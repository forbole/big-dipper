# Big Dipper :sparkles:

Block Explorer for Cosmos

## Projects running on mainnets

[Explore Cosmos Hub (cosmoshub-3) with Big Dipper](https://cosmos.bigdipper.live)

[Explore IRISnet (irishub) with Big Dipper](https://iris.bigdipper.live)

[Explore LikeCoin Chain (sheungwan) with Big Dipper](http://likecoin.bigdipper.live/)

[Explore Kava (kava-2) with the Big Dipper](https://kava.bigdipper.live/)

## Projects with testnets

[Desmos Network](https://morpheus.desmos.network/)

[Cyber Congress](https://cyberd.ai/)

[Regen Network](http://bigdipper.regen.network/)

[Sentinel](https://explorer.sentinel.co/)

[e-Money](https://e-money.network/)

[Persistence](https://explorer.persistence.one/)

[TruStory](https://explorer.testnet.trustory.io)

[Agoric](https://explorer.testnet.agoric.com/)

## How to run The Big Dipper

1. Copy `default_settings.json` to `settings.json`.
2. Update the RPC and LCD URLs.
3. Update Bech32 address prefixes.
4. Update genesis file location.

### Requirements

* [Meteor v1.9](https://www.meteor.com/install)

### Run in local

```sh
meteor npm install --save
meteor --settings settings.json
```

### Run in production

```sh
./build.sh
```

It will create a packaged Node JS tarball in `Linux x86_64` architecture at `../output`. Deploy that packaged Node JS project with process manager like [PM2](https://github.com/Unitech/pm2) or [Phusion Passenger](https://www.phusionpassenger.com/library/walkthroughs/basics/nodejs/fundamental_concepts.html). 

You will need to have [MongoDB >= 4.x](https://docs.mongodb.com/manual/administration/install-on-linux/) installed and [setup environment variables](https://guide.meteor.com/deployment.html#environment) correctly in order run in production. For more details on how to deploy a Meteor application, please refer to the offical documentation on [Custom Deployment](https://guide.meteor.com/deployment.html#custom-deployment).

---
## Donations :pray:

The Big Dipper is always free and open. Anyone can use to monitor available Cosmos hub or zones, or port to your own chain built with Cosmos SDK. We welcome any supports to help us improve this project.

ATOM: `cosmos1n67vdlaejpj3uzswr9qapeg76zlkusj5k875ma`\
BTC: `1HrTuvS83VoUVA79wTifko69ziWTjEXzQS`\
ETH: `0xec3AaC5023E0C9E2a76A223E4e312f275c76Cd77`

And by downloading and using [Brave](https://brave.com/big517).
