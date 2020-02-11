FROM geoffreybooth/meteor-base:1.9

COPY . /mainchain-explorer
WORKDIR /mainchain-explorer

RUN meteor npm install
RUN meteor update

RUN meteor build ../output/ --architecture os.linux.x86_64
