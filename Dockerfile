ARG PUBLIC_PATH=/
ARG VUE_APP_SENTECA_KEY

FROM --platform=linux/amd64 node:18-alpine as builder
ARG PUBLIC_PATH
ARG VUE_APP_SENTECA_KEY
ENV VUE_APP_SENTECA_KEY=${VUE_APP_SENTECA_KEY}
WORKDIR /app

RUN apk add --no-cache --virtual .gyp \
        g++ make py3-pip

RUN yarn global add @quasar/cli



COPY package.json yarn.lock ./
RUN yarn install

COPY . .

RUN quasar build

RUN apk del .gyp

FROM caddy:2-alpine
ARG PUBLIC_PATH
ARG VUE_APP_SENTECA_KEY
ENV VUE_APP_SENTECA_KEY=${VUE_APP_SENTECA_KEY}

WORKDIR /srv
COPY --from=builder /app/dist/spa/ .${PUBLIC_PATH}

EXPOSE 80
CMD ["caddy", "file-server"]
