FROM node:20.1.0-alpine as build
LABEL stage=build
ENV NODE_ENV production
ENV FORCE_COLOR true

WORKDIR /workdir

COPY . .

# Build and create local production caches while using global mirror
RUN \
  yarn build && \
  yarn config set enableGlobalCache false && \
  yarn cache clean && \
  yarn workspaces focus --production rating-tracker-backend

# Create directories for run container and copy only necessary files
RUN mkdir -p /workdir/app/packages/rating-tracker-backend/public /workdir/app/packages/rating-tracker-commons /workdir/app/.yarn && \
  cp -r /workdir/.pnp.* /workdir/package.json /workdir/app && \
  cp -r /workdir/.yarn/cache /workdir/.yarn/unplugged /workdir/app/.yarn && \
  cp -r /workdir/packages/rating-tracker-backend/dist /workdir/packages/rating-tracker-backend/package.json /workdir/app/packages/rating-tracker-backend && \
  cp -r /workdir/packages/rating-tracker-commons/dist /workdir/packages/rating-tracker-commons/package.json /workdir/app/packages/rating-tracker-commons && \
  cp -r /workdir/packages/rating-tracker-frontend/dist/* /workdir/app/packages/rating-tracker-backend/public && \
  find /workdir/app -name '*.d.ts' -type f -delete

FROM alpine:3.17.3 as run
ENV NODE_ENV production
WORKDIR /app
RUN --mount=type=cache,target=/var/cache/apk apk add dumb-init
COPY --from=build /etc/passwd /etc
COPY --from=build /usr/lib/libstdc++* /usr/lib/libgcc* /usr/lib
COPY --from=build /usr/local/bin/node /usr/local/bin
USER node
COPY --from=build --chown=node:node /workdir/app .
CMD [ "node", "--experimental-loader", "./.pnp.loader.mjs", "-r", "./.pnp.cjs", "packages/rating-tracker-backend/dist/src/server.js" ]
