FROM alpine:3.18.4 as assemble
ARG TARGETARCH

# Copy project files
COPY app /workdir/app

# Remove unused binaries
WORKDIR /workdir/app/prisma/client
RUN \
  if [ "$TARGETARCH" == "amd64" ]; then \
  rm ./libquery_engine-linux-musl-arm64-openssl-3.0.x.so.node; \
  elif [ "$TARGETARCH" == "arm64" ]; then \
  rm ./libquery_engine-linux-musl-openssl-3.0.x.so.node; \
  fi

FROM alpine:3.18.4 as target
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
  org.opencontainers.image.version="2.5.0" \
  org.opencontainers.image.created=$BUILD_DATE

ENV NODE_ENV production

WORKDIR /app

# Install standard libraries
RUN \
  --mount=type=cache,target=/var/cache/apk,id=${TARGETARCH}:/var/cache/apk \
  apk add libgcc libstdc++

# Copy Node.js binary and user
COPY --from=node:21.2.0-alpine /etc/passwd /etc
COPY --from=node:21.2.0-alpine /usr/local/bin/node /usr/local/bin

# Switch to non-root user
USER node

# Copy project files
COPY --from=assemble --chown=node:node /workdir/app .

# Define health check
HEALTHCHECK CMD wget -qO /dev/null http://localhost:$PORT/api/status || exit 1

CMD [ "node", "--enable-source-maps", "server.mjs" ]
