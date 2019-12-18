FROM geoffreybooth/meteor-base:1.8.2

COPY . /mainchain-explorer
WORKDIR /mainchain-explorer

RUN meteor npm install
RUN meteor update

RUN echo "Done updating"
