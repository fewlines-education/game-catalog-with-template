FROM node:14.4.0-alpine as build

ENV NODE_ENV=development

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install

COPY . ./

RUN yarn build

FROM node:14.4.0-alpine

ENV NODE_ENV=production

WORKDIR /app

COPY --from=build /app/package.json /app/yarn.lock ./
COPY --from=build /app/dist ./dist
COPY --from=build /app/views ./views
COPY --from=build /app/public ./public

HEALTHCHECK --interval=10s --timeout=3s \
  CMD ls is-started || exit 1

RUN yarn install --production

RUN apk add --no-cache bash

RUN echo -e "#! /usr/bin/env bash\n\nyarn start | tee >(awk '/listen on/ { system(\"touch is-started\") }')" > start.sh

CMD bash ./start.sh
