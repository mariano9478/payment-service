FROM node:20-alpine3.18 AS base

ENV DIR /app
WORKDIR $DIR
ARG NPM_TOKEN
ARG ST_LAWPAY_CLIENT_ID
ARG ST_LAWPAY_CLIENT_SECRET
ARG PAYMENT_IS_LOCAL
ARG LOG_LEVEL
ARG DB_LOCAL
ARG DB_PASSWORD
ARG DB_HOST
ARG DB_NAME
ARG DB_USER
ARG KEYVAULT_URL

FROM base AS dev

ENV NODE_ENV=development

COPY package*.json .

RUN echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" > ".npmrc" && \
    npm ci && \
    rm -f .npmrc

COPY tsconfig*.json .
COPY .swcrc .
COPY nest-cli.json .
COPY src src

EXPOSE $PORT
CMD ["npm", "run", "dev"]

FROM base AS build

RUN apk update && apk add --no-cache dumb-init=1.2.5-r2

COPY package*.json .
# Bellow npm install is a workaround for https://github.com/swc-project/swc/issues/5616#issuecomment-1651214641
RUN echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" > ".npmrc" && \
    npm install --save-optional \
    "@swc/core-linux-x64-gnu@1" \
    "@swc/core-linux-x64-musl@1" && \
    npm install && \
    rm -f .npmrc

COPY tsconfig*.json .
COPY .swcrc .
COPY nest-cli.json .
COPY src src

RUN npm run build && \
    npm prune --production

FROM base AS production

ENV NODE_ENV=production
ENV USER=node

COPY --from=build /usr/bin/dumb-init /usr/bin/dumb-init
COPY --from=build $DIR/node_modules node_modules
COPY --from=build $DIR/dist dist

USER $USER
EXPOSE $PORT
CMD ["dumb-init", "node", "dist/main.js"]
