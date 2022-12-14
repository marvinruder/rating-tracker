FROM node:19.4.0-alpine as build
LABEL stage=build
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

# Delete frontend code, caches only used by frontend, unused TypeScript output and build tools in yarn cache
RUN rm -r /build/packages/rating-tracker-frontend
RUN echo -e "\033[0;34m➤\033[0m YN0019: \033[0;35m$(yarn | grep -c 'appears to be unused - removing') packages\033[0m appear to be unused - removing"
RUN find /build/packages -type f '(' -name "*.d.ts*" -o -name "*.tsbuildinfo" ')' -delete
RUN rm -r \
  /build/.yarn/cache/typescript-* \
  /build/.yarn/unplugged/node-gyp-*

# Create directories for run container and copy only necessary files
RUN mkdir -p /build/app/packages/rating-tracker-backend /build/app/packages/rating-tracker-commons /build/app/.yarn && \
  cp -r /build/.pnp.* /build/package.json /build/yarn.lock /build/app && \
  cp -r /build/.yarn/cache /build/.yarn/releases /build/.yarn/unplugged /build/app/.yarn && \
  cp -r /build/packages/rating-tracker-backend/dist /build/packages/rating-tracker-backend/public /build/packages/rating-tracker-backend/package.json /build/app/packages/rating-tracker-backend && \
  cp -r /build/packages/rating-tracker-commons/dist /build/packages/rating-tracker-commons/package.json /build/app/packages/rating-tracker-commons && \
  # should contain the yarnPath
  tail -1 .yarnrc.yml > /build/app/.yarnrc.yml

FROM node:19.4.0-alpine as run
RUN apk add --no-cache dumb-init
ENV NODE_ENV production
USER node
WORKDIR /app
COPY --from=build --chown=node:node /build/app .
CMD [ "dumb-init", "yarn", "start" ]
