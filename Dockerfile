# Base stage
FROM node:16-slim as base
ENV NODE_ENV=production
ENV PATH=/node/app/node_modules/.bin/:$PATH
RUN apt-get update && apt-get install -y graphicsmagick
WORKDIR /node/app
COPY package*.json ./
RUN npm config list
RUN npm ci && npm cache clean --force
CMD ["node", "server.js"]

# Dev stage
FROM base as dev
RUN apt-get update -qq && apt-get install -qy \
  ca-certificates \
  bzip2 \
  curl \
  libfontconfig \
  --no-install-recommends
RUN npm config list
RUN npm install --only=development && npm cache clean --force
CMD ["nodemon", "server.js"]

# Test stage
FROM dev as test
COPY . .
RUN npm audit

# Pre-prod stage
FROM test as pre-prod
RUN rm -rf ./tests && rm -rf ./node_modules

# Prod stage
FROM base as prod
COPY --from=pre-prod /node/app /node/app
HEALTHCHECK CMD curl http://127.0.0.1/ || exit 1