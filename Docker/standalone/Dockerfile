FROM node:8.16.2-alpine3.10

COPY build/mainnet-explorer.tar.gz /src/mainnet-explorer.tar.gz

WORKDIR /src

RUN tar -xvf mainnet-explorer.tar.gz

WORKDIR /src/bundle/programs/server

RUN npm install

WORKDIR /src/bundle
