FROM node:12.15.0-alpine3.11

COPY build/mainchain-explorer.tar.gz /src/mainchain-explorer.tar.gz

WORKDIR /src

RUN tar -xvf mainchain-explorer.tar.gz

WORKDIR /src/bundle/programs/server

RUN npm install

COPY sleep_wrapper.sh /src/bundle/sleep_wrapper.sh
WORKDIR /src/bundle
