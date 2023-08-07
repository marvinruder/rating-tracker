FROM node:20.5.0-alpine as build
LABEL stage=build
ENV NODE_ENV production
ENV FORCE_COLOR true
ARG BUILDARCH
ARG TARGETARCH
ARG TARGETOS

WORKDIR /workdir

COPY . .

RUN \
  if [ "$BUILDARCH" != "$TARGETARCH" ]; then \
  yarn rebuild && \
  rm -r /workdir/packages/backend/prisma/client && \
  yarn workspace @rating-tracker/backend prisma:generate; \
  fi

# Build and create local production caches while using global mirror
RUN \
  yarn build && \
  yarn config set enableGlobalCache false && \
  yarn cache clean && \
  yarn workspaces focus --production @rating-tracker/backend

# Create directories for run container and copy only necessary files
RUN mkdir -p /workdir/app/packages/backend/public /workdir/app/packages/commons /workdir/app/.yarn && \
  cp -r /workdir/.pnp.* /workdir/package.json /workdir/app && \
  cp -r /workdir/.yarn/cache /workdir/.yarn/unplugged /workdir/app/.yarn && \
  cp -r /workdir/packages/backend/dist /workdir/packages/backend/package.json /workdir/app/packages/backend && \
  cp -r /workdir/packages/commons/dist /workdir/packages/commons/package.json /workdir/app/packages/commons && \
  cp -r /workdir/packages/frontend/dist/* /workdir/app/packages/backend/public && \
  find /workdir/app -name '*.d.ts' -type f -delete && \
  # Remove binaries of unused Selenium Manager
  rm -r /workdir/app/.yarn/unplugged/selenium-webdriver-npm-*/node_modules/selenium-webdriver/bin


FROM alpine:3.18.2 as run
ARG BUILD_DATE
ARG TARGETARCH
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
RUN --mount=type=cache,id=apk-${TARGETARCH},target=/var/cache/apk apk add dumb-init
COPY --from=build /etc/passwd /etc
COPY --from=build /usr/lib/libstdc++* /usr/lib/libgcc* /usr/lib/
COPY --from=build /usr/local/bin/node /usr/local/bin
USER node
COPY --from=build --chown=node:node /workdir/app .
CMD [ "dumb-init", "node", "--experimental-loader", "./.pnp.loader.mjs", "-r", "./.pnp.cjs", "packages/backend/dist/src/server.js" ]
