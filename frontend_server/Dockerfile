FROM node:22.16-alpine AS development-dependencies-env
COPY . /app
WORKDIR /app

RUN npm i
RUN npm run build
