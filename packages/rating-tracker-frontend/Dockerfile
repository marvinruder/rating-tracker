FROM node:lts-alpine as test

WORKDIR /app

COPY . .
RUN yarn install
RUN yarn test:ci


FROM node:lts-alpine as build
ENV NODE_ENV production

WORKDIR /app

COPY . .
RUN yarn workspaces focus --production
RUN yarn build


FROM node:lts-alpine as run

COPY --from=build /app/package.json /package.json
COPY --from=build /app/dist /dist

CMD ["yarn", "serve"]
