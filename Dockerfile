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

# Delete frontend code, caches only used by frontend, and unused TypeScript output
RUN rm -r /build/packages/rating-tracker-frontend
RUN yarn
RUN find /build/packages -type f '(' -name "*.d.ts*" -o -name "*.tsbuildinfo" ')' -delete

# Create directories for run container and copy only necessary files
RUN mkdir -p /build/app/packages/rating-tracker-backend /build/app/packages/rating-tracker-commons /build/app/.yarn
RUN cp -r /build/.pnp.* /build/package.json /build/yarn.lock /build/app
RUN cp -r /build/.yarn/cache /build/.yarn/releases /build/.yarn/unplugged /build/app/.yarn
RUN cp -r /build/packages/rating-tracker-backend/dist /build/packages/rating-tracker-backend/public /build/packages/rating-tracker-backend/package.json /build/app/packages/rating-tracker-backend
RUN cp -r /build/packages/rating-tracker-commons/dist /build/packages/rating-tracker-commons/package.json /build/app/packages/rating-tracker-commons

# should contain the yarnPath
RUN tail -1 .yarnrc.yml > /build/app/.yarnrc.yml

FROM node:alpine as run
RUN apk add --no-cache dumb-init
ENV NODE_ENV production
USER node
WORKDIR /app
COPY --from=build --chown=node:node /build/app .
CMD [ "dumb-init", "yarn", "start" ]
