FROM nginx:alpine-slim

RUN apk add --no-cache openssl

RUN mkdir /etc/nginx/certs
COPY dhparam /etc/nginx/
COPY certs /etc/nginx/certs

CMD ["nginx", "-g", "daemon off;"]
