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

# Copy static frontend files into backend for serving
RUN cp -r /workdir/packages/rating-tracker-frontend/dist /workdir/packages/rating-tracker-backend/public

# Delete frontend code, caches only used by frontend, unused TypeScript output and build tools in yarn cache
RUN rm -r /workdir/packages/rating-tracker-frontend
#  && \
#   echo -e "\033[0;34m➤\033[0m YN0019: \033[0;35m$(yarn | grep -c 'appears to be unused - removing') packages\033[0m appear to be unused - removing"
# RUN find /workdir/packages -type f '(' -name "*.d.ts*" -o -name "*.tsbuildinfo" ')' -delete && \
#   rm -r \
#   /workdir/.yarn/cache/@babel-* \
#   /workdir/.yarn/cache/@esbuild-* \
#   /workdir/.yarn/cache/@eslint-* \
#   /workdir/.yarn/cache/@istanbuljs-* \
#   /workdir/.yarn/cache/@types-* \
#   /workdir/.yarn/cache/@typescript-* \
#   /workdir/.yarn/cache/caniuse-* \
#   /workdir/.yarn/cache/diff-* \
#   /workdir/.yarn/cache/esbuild-* \
#   /workdir/.yarn/cache/eslint-* \
#   /workdir/.yarn/cache/esquery-* \
#   /workdir/.yarn/cache/happy-dom-* \
#   /workdir/.yarn/cache/istanbul-* \
#   /workdir/.yarn/cache/js-sdsl-* \
#   /workdir/.yarn/cache/node-gyp-* \
#   /workdir/.yarn/cache/prettier-* \
#   /workdir/.yarn/cache/rollup-* \
#   /workdir/.yarn/cache/typescript-* \
#   /workdir/.yarn/cache/vite-* \
#   /workdir/.yarn/cache/vitest-* \
#   /workdir/.yarn/unplugged/@cbor-extract-* \
#   /workdir/.yarn/unplugged/@esbuild-* \
#   /workdir/.yarn/unplugged/cbor-extract-* \
#   /workdir/.yarn/unplugged/esbuild-* \
#   /workdir/.yarn/unplugged/node-gyp-*

# Create directories for run container and copy only necessary files
RUN mkdir -p /workdir/app/packages/rating-tracker-backend /workdir/app/packages/rating-tracker-commons /workdir/app/.yarn && \
  cp -r /workdir/.pnp.* /workdir/package.json /workdir/yarn.lock /workdir/app && \
  cp -r /workdir/.yarn/cache /workdir/.yarn/releases /workdir/.yarn/unplugged /workdir/app/.yarn && \
  cp -r /workdir/packages/rating-tracker-backend/dist /workdir/packages/rating-tracker-backend/public /workdir/packages/rating-tracker-backend/package.json /workdir/app/packages/rating-tracker-backend && \
  cp -r /workdir/packages/rating-tracker-commons/dist /workdir/packages/rating-tracker-commons/package.json /workdir/app/packages/rating-tracker-commons && \
  # should contain the yarnPath
  tail -1 .yarnrc.yml > /workdir/app/.yarnrc.yml

FROM node:19.7.0-alpine as run
ENV NODE_ENV production
WORKDIR /app
RUN apk add --no-cache dumb-init
USER node
COPY --from=build --chown=node:node /workdir/app .
CMD [ "dumb-init", "yarn", "start" ]
