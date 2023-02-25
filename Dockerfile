FROM node:19.7.0-alpine as build
LABEL stage=build
ENV NODE_ENV production
ENV FORCE_COLOR true

WORKDIR /workdir

COPY . .

# Build
RUN \
  yarn build && \
  yarn cache clean && \
  yarn workspaces focus --production rating-tracker-backend

# Create directories for run container and copy only necessary files
RUN mkdir -p /workdir/app/public /workdir/app/packages/rating-tracker-commons /workdir/app/.yarn && \
  cp -r /workdir/.pnp.* /workdir/app && \
  cp -r /workdir/.yarn/cache /workdir/.yarn/unplugged /workdir/app/.yarn && \
  cp -r /workdir/packages/rating-tracker-backend/dist /workdir/app && \
  cp -r /workdir/packages/rating-tracker-commons/dist /workdir/app/packages/rating-tracker-commons && \
  cp -r /workdir/packages/rating-tracker-frontend/dist/* /workdir/app/public


FROM node:19.7.0-alpine as run
ENV NODE_ENV production
WORKDIR /app
RUN apk add --no-cache dumb-init
USER node
COPY --from=build --chown=node:node /workdir/app .
CMD [ "node", "--experimental-loader", "./.pnp.loader.mjs", "-r", "./.pnp.cjs", "dist/src/server.js" ]
