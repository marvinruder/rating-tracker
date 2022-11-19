FROM node:alpine as build
ENV NODE_ENV production
ENV FORCE_COLOR true

WORKDIR /build

COPY . .

# Build
RUN yarn workspaces focus --production
RUN yarn
RUN yarn build

# Copy static frontend files into backend for serving
RUN cp -r /build/packages/rating-tracker-frontend/dist /build/packages/rating-tracker-backend/public

# Delete frontend code and caches only used by frontend
RUN rm -r /build/packages/rating-tracker-frontend
RUN yarn

# Create directories for run container and copy only necessary files
RUN mkdir -p /build/app/packages/rating-tracker-backend /build/app/.yarn
RUN cp -r /build/.pnp.* /build/package.json /build/yarn.lock /build/app
RUN cp -r /build/.yarn/cache /build/.yarn/releases /build/.yarn/unplugged /build/app/.yarn
RUN cp -r /build/packages/rating-tracker-backend/dist /build/packages/rating-tracker-backend/public /build/packages/rating-tracker-backend/package.json /build/app/packages/rating-tracker-backend

# should contain the yarnPath
RUN tail -1 .yarnrc.yml > /build/app/.yarnrc.yml

FROM node:alpine as run
RUN apk add --no-cache dumb-init
ENV NODE_ENV production
USER node
WORKDIR /app
COPY --from=build --chown=node:node /build/app .
CMD [ "dumb-init", "yarn", "start" ]
