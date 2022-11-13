FROM node:alpine as build
ENV NODE_ENV production
ENV FORCE_COLOR true

WORKDIR /app

COPY . .
RUN yarn workspaces focus --production
RUN yarn
WORKDIR /app/packages/rating-tracker-frontend
RUN yarn build
RUN cp -r /app/packages/rating-tracker-frontend/dist /app/static
WORKDIR /app
RUN rm -r /app/packages/rating-tracker-frontend
RUN yarn
RUN yarn build
RUN cp -r /app/static /app/packages/rating-tracker-backend/dist/static


FROM node:alpine as run
ENV NODE_ENV production

WORKDIR /app

COPY --from=build /app/*yarn* /app/
COPY --from=build /app/.pnp* /app/
COPY --from=build /app/package.json /app/package.json
COPY --from=build /app/packages/rating-tracker-backend/dist /app/packages/rating-tracker-backend/dist
COPY --from=build /app/packages/rating-tracker-backend/package.json /app/packages/rating-tracker-backend/package.json

CMD [ "yarn", "start" ]
