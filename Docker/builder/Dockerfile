FROM geoffreybooth/meteor-base:1.9

COPY . /mainchain-explorer
WORKDIR /mainchain-explorer

RUN rm -rf /mainchain-explorer/node_modules
RUN meteor npm install --save

RUN meteor build ../output/ --architecture os.linux.x86_64  --server-only
