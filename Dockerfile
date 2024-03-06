# Lists all images to be prefetched by the regular Docker builder
FROM scratch as prefetch
COPY --from=postgres:alpine /etc/os-release /etc/os-release-postgres
COPY --from=redis:alpine /etc/os-release /etc/os-release-redis
COPY --from=node:21.6.2-alpine /etc/os-release /etc/os-release-node
COPY --from=eclipse-temurin:21.0.2_13-jre-alpine /etc/os-release /etc/os-release-java


# Lists all images to be prefetched by the Docker BuildKit builder
FROM scratch as prefetch-buildx
COPY --from=rust:1.76.0-alpine /etc/os-release /etc/os-release-rust
COPY --from=alpine:3.19.1 /etc/os-release /etc/os-release-alpine
COPY --from=node:21.6.2-alpine /etc/os-release /etc/os-release-node


FROM rust:1.76.0-alpine as wasm

ARG TARGETARCH

WORKDIR /workdir

# Install required tools and libraries
RUN \
  --mount=type=cache,target=/var/cache/apk,id=${TARGETARCH}:/var/cache/apk \
  --mount=type=cache,target=/usr/local/cargo/registry \
  apk add binaryen pkgconfig musl-dev nasm openssl-dev && \
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


FROM node:21.6.2-alpine as yarn
ENV FORCE_COLOR true

WORKDIR /workdir

# Copy caches and files required for installing dependencies
COPY cache/. /root/.cache
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
  yarn workspaces focus -A --production


FROM node:21.6.2-alpine as test
ENV FORCE_COLOR true
ENV DOMAIN example.com
ENV SUBDOMAIN subdomain
ENV SIGNAL_URL http://127.0.0.1:8080
ENV SIGNAL_SENDER +493012345678

WORKDIR /workdir

RUN \
  --mount=type=cache,target=/var/cache/apk \
  apk add docker docker-compose

# Run tests
RUN \
  --mount=type=bind,target=.,rw \
  --mount=type=bind,from=wasm,source=/workdir/pkg,target=packages/wasm \
  --mount=type=bind,from=yarn,source=/usr/local,target=/usr/local \
  --mount=type=bind,from=yarn,source=/workdir/.yarn,target=.yarn \
  --mount=type=bind,from=yarn,source=/root/.cache,target=/root/.cache \
  --mount=type=bind,from=yarn,source=/workdir/.pnp.cjs,target=.pnp.cjs \
  --mount=type=bind,from=yarn,source=/workdir/.pnp.loader.mjs,target=.pnp.loader.mjs \
  --mount=type=bind,from=yarn,source=/workdir/packages/backend/prisma/client,target=packages/backend/prisma/client \
  (dockerd &) && \
  sed -i "s/localhost/localhost postgres-test redis-test/" /etc/hosts && \
  sleep 2 && \
  docker compose -f packages/backend/test/docker-compose.yml up --force-recreate -V -d && \
  yarn test && \
  mkdir -p /coverage && \
  mv packages/backend/coverage /coverage/backend && \
  mv packages/commons/coverage /coverage/commons && \
  mv packages/frontend/coverage /coverage/frontend


FROM node:21.6.2-alpine as build
LABEL stage=build
ENV NODE_ENV production
ENV FORCE_COLOR true

WORKDIR /workdir

# Build project
RUN \
  --mount=type=bind,target=.,rw \
  --mount=type=bind,from=wasm,source=/workdir/pkg,target=packages/wasm \
  --mount=type=bind,from=yarn,source=/usr/local,target=/usr/local \
  --mount=type=bind,from=yarn,source=/workdir/.yarn,target=.yarn \
  --mount=type=bind,from=yarn,source=/root/.cache,target=/root/.cache \
  --mount=type=bind,from=yarn,source=/workdir/.pnp.cjs,target=.pnp.cjs \
  --mount=type=bind,from=yarn,source=/workdir/.pnp.loader.mjs,target=.pnp.loader.mjs \
  --mount=type=bind,from=yarn,source=/workdir/packages/backend/prisma/client,target=packages/backend/prisma/client \
  # Bundle frontend and backend
  yarn build && \
  # Create CommonJS module containing log formatter configuration
  yarn build:logFormatterConfig && \
  # Parse backend bundle for correctness and executability in Node.js
  /bin/sh -c 'cd packages/backend && EXIT_AFTER_READY=1 PORT_OFFSET=4096 node -r ./test/env.ts dist/server.cjs' && \
  # Create directories for target container and copy only necessary files
  mkdir -p /app/public/api-docs /app/prisma/client && \
  cp packages/backend/dist/* /app && \
  cp -r packages/backend/prisma/client/schema.prisma packages/backend/prisma/client/libquery_engine-* /app/prisma/client && \
  cp -r packages/frontend/dist/* /app/public && \
  # Copy project files as well as Swagger UI files and WebAssembly package
  cp \
  .yarn/unplugged/swagger-ui-dist-*/node_modules/swagger-ui-dist/swagger-ui.css \
  .yarn/unplugged/swagger-ui-dist-*/node_modules/swagger-ui-dist/swagger-ui-bundle.js \
  .yarn/unplugged/swagger-ui-dist-*/node_modules/swagger-ui-dist/swagger-ui-standalone-preset.js \
  /app/public/api-docs/


FROM eclipse-temurin:21.0.2_13-jre-alpine as result

# Install bash and download and extract Codacy coverage reporter
RUN --mount=type=cache,target=/var/cache/apk \
  apk --update add bash && \
  wget -qO - https://coverage.codacy.com/get.sh > /usr/local/bin/codacy-coverage && \
  chmod +x /usr/local/bin/codacy-coverage && \
  codacy-coverage download

WORKDIR /coverage

# Add caches
COPY --from=yarn /root/.cache /cache

# Add build artifacts
COPY --from=build /app /app

# Copy coverage reports from test stage
COPY --from=test /coverage /coverage

ENTRYPOINT [ "codacy-coverage" ]


FROM alpine:3.19.1 as deploy
ARG TARGETARCH
ENV NODE_ENV production

# Install standard libraries and copy Node.js binary
RUN \
  --mount=type=bind,from=node:21.6.2-alpine,source=/usr/local/bin/node,target=/mnt/usr/local/bin/node \
  --mount=type=bind,from=node:21.6.2-alpine,source=/etc,target=/mnt/etc \
  --mount=type=cache,target=/var/cache/apk,id=${TARGETARCH}:/var/cache/apk \
  apk add libgcc libstdc++ && \
  cp -a /mnt/etc/group /etc/group && \
  cp -a /mnt/etc/passwd /etc/passwd && \
  cp -a /mnt/usr/local/bin/node /usr/local/bin/node

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
  org.opencontainers.image.version="4.3.1" \
  org.opencontainers.image.created=$BUILD_DATE

# Define health check
HEALTHCHECK CMD wget -qO /dev/null http://localhost:$PORT/api/status || exit 1

### <- This is a special marker, everything in this stage above it can and will be built and cached before the production bundle is available

RUN \
  --mount=type=bind,source=app,target=/mnt/app \
  cp -r /mnt/app / && \
  if [ "$TARGETARCH" == "amd64" ]; then \
  rm /app/prisma/client/libquery_engine-linux-musl-arm64-openssl-3.0.x.so.node; \
  elif [ "$TARGETARCH" == "arm64" ]; then \
  rm /app/prisma/client/libquery_engine-linux-musl-openssl-3.0.x.so.node; \
  fi

CMD [ "node", "--enable-source-maps", "server.cjs" ]
