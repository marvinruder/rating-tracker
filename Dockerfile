FROM node:alpine as build
ENV NODE_ENV production
ENV FORCE_COLOR true

WORKDIR /app

COPY . .
RUN yarn workspaces focus --production
RUN yarn
RUN yarn build


FROM node:alpine as run
ENV NODE_ENV production

WORKDIR /app

COPY --from=build /app/.yarn /app/.yarn
COPY --from=build /app/.pnp.cjs /app/.pnp.cjs
COPY --from=build /app/.pnp.loader.mjs /app/.pnp.loader.mjs
COPY --from=build /app/.yarnrc.yml /app/.yarnrc.yml
COPY --from=build /app/package.json /app/package.json
COPY --from=build /app/yarn.lock /app/yarn.lock
COPY --from=build /app/packages/rating-tracker-backend/dist /app/packages/rating-tracker-backend/dist
COPY --from=build /app/packages/rating-tracker-backend/package.json /app/packages/rating-tracker-backend/package.json
COPY --from=build /app/packages/rating-tracker-frontend/dist /app/packages/rating-tracker-backend/dist/static

CMD [ "yarn", "start" ]
