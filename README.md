# Big Dipper :sparkles:

Block Explorer for Cosmos


## Projects running on mainnets

[Explore Akash with Big Dipper](https://akash.bigdipper.live/)

[Explore Band Protocol with Big Dipper](https://band.bigdipper.live/)

[Explore Cosmos Hub with Big Dipper](https://cosmos.bigdipper.live)

[Explore e-Money with Big Dipper](https://e-money.network/)

[Explore IRISnet with Big Dipper](https://iris.bigdipper.live)

[Explore IOV with Big Dipper](https://big-dipper.iov-mainnet-2.iov.one/)

[Explore Kava with Big Dipper](https://kava.bigdipper.live/)

[Explore LikeCoin Chain with Big Dipper](http://likecoin.bigdipper.live/)

## Projects with testnets

[Agoric](https://explorer.testnet.agoric.com/)

[Desmos Network](https://morpheus.desmos.network/)

[Persistence](https://explorer.persistence.one/)

[Regen Network](https://explorer.regen.vitwit.com/)

[Sentinel](https://explorer.sentinel.co/)

## How to run The Big Dipper

1. Copy `default_settings.json` to `settings.json`.
2. Update the RPC and API URLs
3. Update Bech32 address prefixes
4. Add coins settings
5. Update Ledger settings

### Requirements

* [Meteor v2.x](https://www.meteor.com/install)

### Run in local

```sh
meteor npm install --save
meteor --settings settings.json
```

### Run via docker-compose
```sh
METEOR_SETTINGS=$(cat settings.json) docker-compose up
```

### Run in production

```sh
./scripts/build.sh
```

It will create a packaged Node JS tarball in `Linux x86_64` architecture at `../output`. Deploy that packaged Node JS project with process manager like [PM2](https://github.com/Unitech/pm2) or [Phusion Passenger](https://www.phusionpassenger.com/library/walkthroughs/basics/nodejs/fundamental_concepts.html).

You will need to have [MongoDB >= 4.x](https://docs.mongodb.com/manual/administration/install-on-linux/) installed and [setup environment variables](https://guide.meteor.com/deployment.html#environment) correctly in order run in production. For more details on how to deploy a Meteor application, please refer to the offical documentation on [Custom Deployment](https://guide.meteor.com/deployment.html#custom-deployment). 

### Docker builds

big-dipper docker image is a multi stage build that is based on [disney/meteor-base](https://github.com/disney/meteor-base/). When you change the meteor or node version, change the lines `FROM geoffreybooth/meteor-base:2` and `FROM node:12.16.1-alpine` respectively. When running the image follow the same [environment variable principles](https://guide.meteor.com/deployment.html#environment) mentioned above. If you get an `non-zero exit (137)` error during the build phase, increase docker container memory and swap limit. Ideally you can set up [remote docker host](https://www.digitalocean.com/community/tutorials/how-to-provision-and-manage-remote-docker-hosts-with-docker-machine-on-ubuntu-18-04) to prevent your computer's fan going brrrrrr.

---
## Donations :pray:

The Big Dipper is always free and open. Anyone can use to monitor available Cosmos hub or zones, or port to your own chain built with Cosmos SDK. We welcome any supports to help us improve this project.

ATOM: `cosmos1n67vdlaejpj3uzswr9qapeg76zlkusj5k875ma`\
BTC: `bc1qye4k27zsn5nehzded6jwsvzg8qd6kgvxyhckts`\
ETH: `0x8CAb9F3fC6bBBD819050365627FC6B79d0ea73e6`

And by downloading and using [Brave](https://brave.com/big517).
