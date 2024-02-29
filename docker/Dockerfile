FROM alpine:3.19.1
ARG TARGETARCH

# Install standard libraries and copy Node.js binary
RUN \
  --mount=type=bind,from=node:21.6.2-alpine,source=/usr/local/bin/node,target=/mnt/usr/local/bin/node \
  --mount=type=bind,from=node:21.6.2-alpine,source=/etc,target=/mnt/etc \
  --mount=type=cache,target=/var/cache/apk,id=${TARGETARCH}:/var/cache/apk \
  apk add libgcc libstdc++ && \
  cp -a /mnt/etc/passwd /etc/passwd && \
  cp -a /mnt/etc/group /etc/group && \
  cp -a /mnt/usr/local/bin/node /usr/local/bin/node && \
  mkdir -p /app && \
  chown -R node:node /app

USER node:node
WORKDIR /app
ENV NODE_ENV production

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

### <- This is a special marker, everything above it can be built and cached before the production bundle is available

RUN \
  --mount=type=bind,source=app,target=/mnt/app \
  cp -r /mnt/app / && \
  if [ "$TARGETARCH" == "amd64" ]; then \
  rm /app/prisma/client/libquery_engine-linux-musl-arm64-openssl-3.0.x.so.node; \
  elif [ "$TARGETARCH" == "arm64" ]; then \
  rm /app/prisma/client/libquery_engine-linux-musl-openssl-3.0.x.so.node; \
  fi

CMD [ "node", "--enable-source-maps", "server.cjs" ]
