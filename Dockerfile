# syntax=docker/dockerfile:1-labs

FROM --platform=$BUILDPLATFORM rust:1.83.0-alpine AS wasm

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


FROM --platform=$BUILDPLATFORM node:22.13.0-alpine AS yarn
ENV FORCE_COLOR=true
ENV PRISMA_CLI_BINARY_TARGETS=linux-musl-openssl-3.0.x,linux-musl-arm64-openssl-3.0.x

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
  --mount=type=bind,source=tools/package.json,target=tools/package.json \
  --mount=type=bind,source=tools/.yarnrc.yml,target=tools/.yarnrc.yml \
  --mount=type=bind,source=tools/yarn.lock,target=tools/yarn.lock \
  corepack enable && \
  yarn workspaces focus -A --production && \
  yarn tools


FROM --platform=$BUILDPLATFORM node:22.13.0-alpine AS test-backend
ENV FORCE_COLOR=true
ENV DOMAIN=example.com
ENV SUBDOMAIN=subdomain
ENV SIGNAL_URL=http://127.0.0.1:8080
ENV SIGNAL_SENDER=+493012345678

ENV PATH="/workdir/tools/node_modules/.bin:${PATH}"

ENV PGDATA=/tmp/postgresql/data
ENV POSTGRES_HOST=127.0.0.1

WORKDIR /workdir

# Install PostgreSQL and initialize database
RUN \
  apk add --no-cache postgresql-contrib && \
  mkdir -p /run/postgresql && \
  chown -R postgres:postgres /run/postgresql && \
  su postgres -c 'initdb'

# Run backend tests
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
  --mount=type=bind,from=yarn,source=/workdir/packages/backend/prisma,target=packages/backend/prisma \
  --mount=type=bind,from=yarn,source=/workdir/tools,target=tools \
  --network=none \
  su postgres -c 'postgres -c fsync=off -c synchronous_commit=off -c full_page_writes=off &' && \
  yarn workspace @rating-tracker/backend test && \
  mkdir -p /coverage && \
  mv packages/backend/coverage /coverage/backend


FROM --platform=$BUILDPLATFORM node:22.13.0-alpine AS test-commons
ENV FORCE_COLOR=true

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


FROM --platform=$BUILDPLATFORM node:22.13.0-alpine AS test-frontend
ENV FORCE_COLOR=true

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


FROM --platform=$BUILDPLATFORM node:22.13.0-alpine AS build-backend
ENV NODE_ENV=production
ENV FORCE_COLOR=true

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
  --mount=type=bind,from=yarn,source=/workdir/packages/backend/prisma,target=packages/backend/prisma \
  --network=none \
  # Bundle backend
  yarn workspace @rating-tracker/backend build && \
  # Parse backend bundle for correctness and executability in Node.js
  /bin/sh -c 'cd packages/backend && EXIT_AFTER_READY=1 node -r ./test/env.ts dist/server.mjs' && \
  # Create directories for target container and copy only necessary files
  mkdir -p /app/public/api-docs /app/prisma/client && \
  cp -r packages/backend/dist/* /app && \
  cp -r packages/backend/prisma/migrations /app/prisma && \
  cp packages/backend/prisma/client/schema.prisma /app/prisma/client && \
  ln -s ./client/schema.prisma /app/prisma/schema.prisma

FROM --platform=$BUILDPLATFORM node:22.13.0-alpine AS build-frontend
ENV NODE_ENV=production
ENV FORCE_COLOR=true

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


FROM --platform=$BUILDPLATFORM eclipse-temurin:21.0.5_11-jre-alpine AS result

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
FROM node:22.13.0-alpine AS node

FROM alpine:3.21.2 AS deploy-base
ARG TARGETARCH

# Install standard libraries and copy Node.js binary
RUN \
  --mount=type=bind,from=node,source=/usr/local/bin/node,target=/mnt/usr/local/bin/node \
  --mount=type=bind,from=node,source=/etc,target=/mnt/etc \
  apk add --no-cache libstdc++ && \
  cp -a /mnt/etc/group /etc/group && \
  cp -a /mnt/etc/passwd /etc/passwd && \
  cp -a /mnt/usr/local/bin/node /usr/local/bin/node


FROM deploy-base AS deploy
ARG TARGETARCH
ENV NODE_ENV=production
ENV PATH="/app/tools/node_modules/.bin:${PATH}"

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
  org.opencontainers.image.version="6.1.0" \
  org.opencontainers.image.created=$BUILD_DATE

# Define health check
HEALTHCHECK CMD wget -qO /dev/null http://localhost:$PORT/api/status || exit 1

RUN \
  --mount=type=bind,from=yarn,source=/workdir/tools,target=/mnt/app/tools \
  cp -r /mnt/app/tools /app && \
  if [ "$TARGETARCH" == "amd64" ]; then \
  rm /app/tools/node_modules/@prisma/engines/libquery_engine-linux-musl-arm64-openssl-3.0.x.so.node; \
  rm /app/tools/node_modules/@prisma/engines/schema-engine-linux-musl-arm64-openssl-3.0.x; \
  elif [ "$TARGETARCH" == "arm64" ]; then \
  rm /app/tools/node_modules/@prisma/engines/libquery_engine-linux-musl-openssl-3.0.x.so.node; \
  rm /app/tools/node_modules/@prisma/engines/schema-engine-linux-musl-openssl-3.0.x; \
  fi

RUN \
  --mount=type=bind,from=result,source=app,target=/mnt/app \
  cp -r /mnt/app / && \
  if [ "$TARGETARCH" == "amd64" ]; then \
  ln -s /app/tools/node_modules/@prisma/engines/libquery_engine-linux-musl-openssl-3.0.x.so.node /app/prisma/client/libquery_engine-linux-musl-openssl-3.0.x.so.node; \
  elif [ "$TARGETARCH" == "arm64" ]; then \
  ln -s /app/tools/node_modules/@prisma/engines/libquery_engine-linux-musl-arm64-openssl-3.0.x.so.node /app/prisma/client/libquery_engine-linux-musl-arm64-openssl-3.0.x.so.node; \
  fi

CMD [ "node", "--enable-source-maps", "server.mjs" ]
