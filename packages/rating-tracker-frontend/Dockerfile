FROM node:current-alpine
ENV NODE_ENV production

WORKDIR /app

COPY . .
RUN yarn install --production
RUN yarn build

CMD ["yarn", "serve"]
