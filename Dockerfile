# syntax=docker/dockerfile:1-labs

FROM --platform=$BUILDPLATFORM rust:1.78.0-alpine as wasm

WORKDIR /workdir

# Install required tools and libraries
RUN \
  --mount=type=cache,target=/usr/local/cargo/registry \
  apk add --no-cache binaryen pkgconfig musl-dev openssl-dev && \
  RUSTFLAGS="-Ctarget-feature=-crt-static" cargo install wasm-bindgen-cli && \
  rustup target add wasm32-unknown-unknown && \
  wget -O - https://rustwasm.github.io/wasm-pack/installer/init.sh | sh

# Get and build dependencies based on dummy `lib.rs`
RUN \
  --mount=type=cache,target=/usr/local/cargo/registry \
  --mount=type=bind,source=wasm/Cargo.toml,target=Cargo.toml \
  --mount=type=bind,source=wasm/Cargo.lock,target=Cargo.lock \
  mkdir ./src && \
  echo 'pub fn tmp() {}' > ./src/lib.rs && \
  cargo build --release --target wasm32-unknown-unknown && \
  rm ./src/lib.rs ./target/wasm32-unknown-unknown/release/deps/wasm.wasm

# Build WebAssembly package
RUN \
  --mount=type=cache,target=/usr/local/cargo/registry \
  --mount=type=bind,source=wasm/Cargo.toml,target=Cargo.toml \
  --mount=type=bind,source=wasm/Cargo.lock,target=Cargo.lock \
  --mount=type=bind,source=wasm/src,target=src \
  wasm-pack build -s rating-tracker --release && \
  # Fix `package.json`
  sed -E -i.bak 's/"module": "([A-Za-z0-9\-\.]+)",/"main": "\1",\n  "module": "\1",/g ; s/^}$/}\n/' pkg/package.json && \
  rm pkg/package.json.bak


FROM --platform=$BUILDPLATFORM node:22.1.0-alpine as yarn
ENV FORCE_COLOR true

WORKDIR /workdir

# Copy files required for installing dependencies
COPY packages/backend/prisma ./packages/backend/prisma

# Install dependencies
RUN \
  --mount=type=bind,source=package.json,target=package.json \
  --mount=type=bind,source=.yarnrc.yml,target=.yarnrc.yml \
  --mount=type=bind,source=yarn.lock,target=yarn.lock \
  --mount=type=bind,source=packages/backend/package.json,target=packages/backend/package.json \
  --mount=type=bind,source=packages/commons/package.json,target=packages/commons/package.json \
  --mount=type=bind,source=packages/frontend/package.json,target=packages/frontend/package.json \
  --mount=type=bind,source=packages/wasm/package.json,target=packages/wasm/package.json \
  corepack enable && \
  PRISMA_CLI_BINARY_TARGETS=linux-musl-openssl-3.0.x,linux-musl-arm64-openssl-3.0.x yarn workspaces focus -A --production


FROM --platform=$BUILDPLATFORM node:22.1.0-alpine as test-backend
ENV FORCE_COLOR true
ENV DOMAIN example.com
ENV SUBDOMAIN subdomain
ENV SIGNAL_URL http://127.0.0.1:8080
ENV SIGNAL_SENDER +493012345678

WORKDIR /workdir

# Install Docker in Docker and create test containers
RUN \
  --security=insecure \
  --mount=type=tmpfs,target=/var/run \
  --mount=type=bind,source=packages/backend/test/docker-compose.yml,target=packages/backend/test/docker-compose.yml \
  apk add --no-cache docker docker-compose fuse-overlayfs && \
  mkdir -p /etc/docker && \
  echo '{"storage-driver": "fuse-overlayfs"}' > /etc/docker/daemon.json && \
  (dockerd > /dev/null 2>&1 &) && \
  START_DOCKER_DAEMON_AGAIN=100 && \
  until docker system info > /dev/null 2>&1; do echo Waiting for Docker Daemon to start…; sleep 0.1; if [ $((START_DOCKER_DAEMON_AGAIN--)) -eq 0 ]; then (dockerd > /dev/null 2>&1 &) && START_DOCKER_DAEMON_AGAIN=100; fi; done && \
  docker compose -f packages/backend/test/docker-compose.yml up --quiet-pull --no-start

# Run backend tests
RUN \
  --security=insecure \
  --mount=type=tmpfs,target=/var/run \
  --mount=type=bind,source=packages/backend,target=packages/backend,rw \
  --mount=type=bind,source=packages/commons,target=packages/commons \
  --mount=type=bind,source=.yarnrc.yml,target=.yarnrc.yml \
  --mount=type=bind,source=package.json,target=package.json \
  --mount=type=bind,source=tsconfig.json,target=tsconfig.json \
  --mount=type=bind,source=yarn.lock,target=yarn.lock \
  --mount=type=bind,from=yarn,source=/root/.cache,target=/root/.cache \
  --mount=type=bind,from=yarn,source=/usr/local,target=/usr/local \
  --mount=type=bind,from=yarn,source=/workdir/.yarn,target=.yarn \
  --mount=type=bind,from=yarn,source=/workdir/.pnp.cjs,target=.pnp.cjs \
  --mount=type=bind,from=yarn,source=/workdir/.pnp.loader.mjs,target=.pnp.loader.mjs \
  --mount=type=bind,from=yarn,source=/workdir/packages/backend/prisma,target=packages/backend/prisma \
  --network=none \
  (dockerd > /dev/null 2>&1 &) && \
  START_DOCKER_DAEMON_AGAIN=100 && \
  until docker system info > /dev/null 2>&1; do echo Waiting for Docker Daemon to start…; sleep 0.1; if [ $((START_DOCKER_DAEMON_AGAIN--)) -eq 0 ]; then (dockerd > /dev/null 2>&1 &) && START_DOCKER_DAEMON_AGAIN=100; fi; done && \
  docker compose -f packages/backend/test/docker-compose.yml up -d && \
  POSTGRES_HOST=$(docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' postgres-test) \
  REDIS_HOST=$(docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' redis-test) \
  yarn workspace @rating-tracker/backend test && \
  mkdir -p /coverage && \
  mv packages/backend/coverage /coverage/backend


FROM --platform=$BUILDPLATFORM node:22.1.0-alpine as test-commons
ENV FORCE_COLOR true

WORKDIR /workdir

# Run commons tests
RUN \
  --mount=type=bind,source=packages/commons,target=packages/commons,rw \
  --mount=type=bind,source=.yarnrc.yml,target=.yarnrc.yml \
  --mount=type=bind,source=package.json,target=package.json \
  --mount=type=bind,source=tsconfig.json,target=tsconfig.json \
  --mount=type=bind,source=yarn.lock,target=yarn.lock \
  --mount=type=bind,from=yarn,source=/root/.cache,target=/root/.cache \
  --mount=type=bind,from=yarn,source=/usr/local,target=/usr/local \
  --mount=type=bind,from=yarn,source=/workdir/.yarn,target=.yarn \
  --mount=type=bind,from=yarn,source=/workdir/.pnp.cjs,target=.pnp.cjs \
  --mount=type=bind,from=yarn,source=/workdir/.pnp.loader.mjs,target=.pnp.loader.mjs \
  --network=none \
  yarn workspace @rating-tracker/commons test && \
  mkdir -p /coverage && \
  mv packages/commons/coverage /coverage/commons


FROM --platform=$BUILDPLATFORM node:22.1.0-alpine as test-frontend
ENV FORCE_COLOR true

WORKDIR /workdir

# Run frontend tests
RUN \
  --mount=type=bind,source=packages/commons,target=packages/commons \
  --mount=type=bind,source=packages/frontend,target=packages/frontend,rw \
  --mount=type=bind,from=wasm,source=/workdir/pkg,target=packages/wasm \
  --mount=type=bind,source=.yarnrc.yml,target=.yarnrc.yml \
  --mount=type=bind,source=package.json,target=package.json \
  --mount=type=bind,source=tsconfig.json,target=tsconfig.json \
  --mount=type=bind,source=yarn.lock,target=yarn.lock \
  --mount=type=bind,from=yarn,source=/root/.cache,target=/root/.cache \
  --mount=type=bind,from=yarn,source=/usr/local,target=/usr/local \
  --mount=type=bind,from=yarn,source=/workdir/.yarn,target=.yarn \
  --mount=type=bind,from=yarn,source=/workdir/.pnp.cjs,target=.pnp.cjs \
  --mount=type=bind,from=yarn,source=/workdir/.pnp.loader.mjs,target=.pnp.loader.mjs \
  --network=none \
  yarn workspace @rating-tracker/frontend test && \
  mkdir -p /coverage && \
  mv packages/frontend/coverage /coverage/frontend


FROM --platform=$BUILDPLATFORM node:22.1.0-alpine as build-backend
ENV NODE_ENV production
ENV FORCE_COLOR true

WORKDIR /workdir

# Build backend
RUN \
  --mount=type=bind,source=packages/backend,target=packages/backend,rw \
  --mount=type=bind,source=packages/commons,target=packages/commons \
  --mount=type=bind,source=.yarnrc.yml,target=.yarnrc.yml \
  --mount=type=bind,source=package.json,target=package.json \
  --mount=type=bind,source=tsconfig.json,target=tsconfig.json \
  --mount=type=bind,source=yarn.lock,target=yarn.lock \
  --mount=type=bind,from=yarn,source=/root/.cache,target=/root/.cache \
  --mount=type=bind,from=yarn,source=/usr/local,target=/usr/local \
  --mount=type=bind,from=yarn,source=/workdir/.yarn,target=.yarn \
  --mount=type=bind,from=yarn,source=/workdir/.pnp.cjs,target=.pnp.cjs \
  --mount=type=bind,from=yarn,source=/workdir/.pnp.loader.mjs,target=.pnp.loader.mjs \
  --mount=type=bind,from=yarn,source=/workdir/packages/backend/dist,target=packages/backend/dist,rw \
  --mount=type=bind,from=yarn,source=/workdir/packages/backend/prisma,target=packages/backend/prisma \
  --mount=type=bind,from=yarn,source=/workdir/packages/backend/runtime,target=packages/backend/runtime \
  --network=none \
  # Bundle backend
  yarn workspace @rating-tracker/backend build && \
  # Create CommonJS module containing log formatter configuration
  yarn workspace @rating-tracker/backend build:logFormatterConfig && \
  # Parse backend bundle for correctness and executability in Node.js
  /bin/sh -c 'cd packages/backend && EXIT_AFTER_READY=1 node -r ./test/env.ts dist/server.mjs' && \
  # Create directories for target container and copy only necessary files
  mkdir -p /app/public/api-docs /app/prisma/client && \
  cp -r packages/backend/dist/* /app && \
  cp -r packages/backend/prisma/migrations packages/backend/runtime /app/prisma && \
  cp packages/backend/prisma/client/schema.prisma packages/backend/prisma/client/libquery_engine-* /app/prisma/client && \
  cp \
  .yarn/unplugged/swagger-ui-dist-*/node_modules/swagger-ui-dist/swagger-ui.css \
  .yarn/unplugged/swagger-ui-dist-*/node_modules/swagger-ui-dist/swagger-ui-bundle.js \
  .yarn/unplugged/swagger-ui-dist-*/node_modules/swagger-ui-dist/swagger-ui-standalone-preset.js \
  /app/public/api-docs/

FROM --platform=$BUILDPLATFORM node:22.1.0-alpine as build-frontend
ENV NODE_ENV production
ENV FORCE_COLOR true

WORKDIR /workdir

# Build frontend
RUN \
  --mount=type=bind,source=packages/commons,target=packages/commons \
  --mount=type=bind,source=packages/frontend,target=packages/frontend,rw \
  --mount=type=bind,source=.yarnrc.yml,target=.yarnrc.yml \
  --mount=type=bind,source=package.json,target=package.json \
  --mount=type=bind,source=tsconfig.json,target=tsconfig.json \
  --mount=type=bind,source=yarn.lock,target=yarn.lock \
  --mount=type=bind,from=wasm,source=/workdir/pkg,target=packages/wasm \
  --mount=type=bind,from=yarn,source=/root/.cache,target=/root/.cache \
  --mount=type=bind,from=yarn,source=/usr/local,target=/usr/local \
  --mount=type=bind,from=yarn,source=/workdir/.yarn,target=.yarn \
  --mount=type=bind,from=yarn,source=/workdir/.pnp.cjs,target=.pnp.cjs \
  --mount=type=bind,from=yarn,source=/workdir/.pnp.loader.mjs,target=.pnp.loader.mjs \
  --network=none \
  # Bundle frontend
  yarn workspace @rating-tracker/frontend build && \
  # Create directories for target container and copy only necessary files
  mkdir -p /app/public && \
  cp -r packages/frontend/dist/* /app/public


FROM --platform=$BUILDPLATFORM eclipse-temurin:21.0.3_9-jre-alpine as result

# Install bash and download and extract Codacy coverage reporter
RUN \
  apk add --no-cache bash && \
  wget -qO - https://coverage.codacy.com/get.sh > /usr/local/bin/codacy-coverage && \
  chmod +x /usr/local/bin/codacy-coverage && \
  codacy-coverage download

WORKDIR /coverage

# Add build artifacts
COPY --from=build-backend /app /app
COPY --from=build-frontend /app/public/. /app/public

# Copy coverage reports from test stages
COPY --from=test-backend /coverage/backend /coverage/backend
COPY --from=test-commons /coverage/commons /coverage/commons
COPY --from=test-frontend /coverage/frontend /coverage/frontend

ENTRYPOINT [ "codacy-coverage" ]


# required for Renovate to update the base image:
FROM node:22.1.0-alpine as node

FROM alpine:3.19.1 as deploy-base
ARG TARGETARCH

# Install standard libraries and copy Node.js binary
RUN \
  --mount=type=bind,from=node,source=/usr/local/bin/node,target=/mnt/usr/local/bin/node \
  --mount=type=bind,from=node,source=/etc,target=/mnt/etc \
  apk add --no-cache libgcc libstdc++ && \
  cp -a /mnt/etc/group /etc/group && \
  cp -a /mnt/etc/passwd /etc/passwd && \
  cp -a /mnt/usr/local/bin/node /usr/local/bin/node && \
  # Must exist and be parseable for Prisma Migrate to work:
  echo '{}' > /package.json


FROM deploy-base as deploy
ARG TARGETARCH
ENV NODE_ENV production
ENV PRISMA_SCHEMA_ENGINE_BINARY /app/prisma/runtime/schema-engine

USER node:node
WORKDIR /app

# Set OCI image labels
ARG BUILD_DATE
LABEL \
  org.opencontainers.image.title="Rating Tracker" \
  org.opencontainers.image.authors="Marvin A. Ruder <ratingtracker@mruder.dev>" \
  org.opencontainers.image.description="A web service fetching and providing financial and ESG ratings for stocks." \
  org.opencontainers.image.url="https://github.com/marvinruder/rating-tracker" \
  org.opencontainers.image.source="https://github.com/marvinruder/rating-tracker" \
  org.opencontainers.image.vendor="Marvin A. Ruder" \
  org.opencontainers.image.licenses="MIT" \
  org.opencontainers.image.version="4.5.1" \
  org.opencontainers.image.created=$BUILD_DATE

# Define health check
HEALTHCHECK CMD wget -qO /dev/null http://localhost:$PORT/api/status || exit 1

RUN \
  --mount=type=bind,from=result,source=app,target=/mnt/app \
  cp -r /mnt/app / && \
  ln -s client/schema.prisma prisma/schema.prisma && \
  if [ "$TARGETARCH" == "amd64" ]; then \
  rm /app/prisma/client/libquery_engine-linux-musl-arm64-openssl-3.0.x.so.node; \
  rm /app/prisma/runtime/schema-engine-linux-musl-arm64-openssl-3.0.x; \
  mv /app/prisma/runtime/schema-engine-linux-musl-openssl-3.0.x /app/prisma/runtime/schema-engine; \
  elif [ "$TARGETARCH" == "arm64" ]; then \
  rm /app/prisma/client/libquery_engine-linux-musl-openssl-3.0.x.so.node; \
  rm /app/prisma/runtime/schema-engine-linux-musl-openssl-3.0.x; \
  mv /app/prisma/runtime/schema-engine-linux-musl-arm64-openssl-3.0.x /app/prisma/runtime/schema-engine; \
  fi

CMD [ "node", "--enable-source-maps", "server.mjs" ]
