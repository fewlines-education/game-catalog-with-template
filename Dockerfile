FROM node:14.4.0 as build

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
COPY start.sh /app

HEALTHCHECK --interval=10s --timeout=3s \
  CMD ls is-started || exit 1

RUN yarn install --production

RUN apk add --no-cache bash

CMD ["yarn", "docker"]
