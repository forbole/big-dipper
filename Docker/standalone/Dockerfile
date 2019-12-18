FROM node:8.16.2-alpine3.10

COPY build/mainchain-explorer.tar.gz /src/mainchain-explorer.tar.gz

WORKDIR /src

RUN tar -xvf mainchain-explorer.tar.gz

WORKDIR /src/bundle/programs/server

RUN npm install

WORKDIR /src/bundle
