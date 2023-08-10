FROM alpine:3.18.3 as assemble
ARG TARGETARCH

# Copy project files
COPY app /workdir/app

# Remove unused binaries
WORKDIR /workdir/app/packages/backend/dist/prisma/client
RUN \
  if [ "$TARGETARCH" == "amd64" ]; then \
  rm ./libquery_engine-linux-musl-arm64-openssl-3.0.x.so.node; \
  elif [ "$TARGETARCH" == "arm64" ]; then \
  rm ./libquery_engine-linux-musl-openssl-3.0.x.so.node; \
  fi

FROM alpine:3.18.3 as target
ARG BUILD_DATE
ARG TARGETARCH

# Set OCI image labels
LABEL \
  org.opencontainers.image.title="Rating Tracker" \
  org.opencontainers.image.authors="Marvin A. Ruder <ratingtracker@mruder.dev>" \
  org.opencontainers.image.description="A web service fetching and providing financial and ESG ratings for stocks." \
  org.opencontainers.image.url="https://github.com/marvinruder/rating-tracker" \
  org.opencontainers.image.source="https://github.com/marvinruder/rating-tracker" \
  org.opencontainers.image.vendor="Marvin A. Ruder" \
  org.opencontainers.image.licenses="MIT" \
  org.opencontainers.image.version="2.1.7" \
  org.opencontainers.image.created=$BUILD_DATE

ENV NODE_ENV production

WORKDIR /app

# Install dumb-init
RUN --mount=type=cache,id=apk-${TARGETARCH},target=/var/cache/apk apk add dumb-init

# Copy Node.js binary and required C/C++ libraries
COPY --from=node:20.5.0-alpine /etc/passwd /etc
COPY --from=node:20.5.0-alpine /usr/lib/libstdc++* /usr/lib/libgcc* /usr/lib/
COPY --from=node:20.5.0-alpine /usr/local/bin/node /usr/local/bin

# Switch to non-root user
USER node

# Copy project files
COPY --from=assemble --chown=node:node /workdir/app .

HEALTHCHECK --interval=5m --start-period=15s CMD wget -qO /dev/null http://localhost:$PORT/api/status || exit 1

CMD [ "dumb-init", "node", "packages/backend/dist/server.mjs" ]
