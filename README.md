![Unification](https://raw.githubusercontent.com/unification-com/mainchain/master/unification_logoblack.png "Unification")

# Unification Block Explorer

Block Explorer for Unification networks.

Forked from https://github.com/forbole/big-dipper, with UND specific modifications for:

* WRKChain Tx Msgs
* BEACON Tx Msgs
* Enterprise UND Tx Msgs

## Live block explorers

[UND TestNet Explorer](https://explorer-testnet.unification.io)

## How to run UND Block Explorer

1. Copy `default_settings.json` to `settings.json`.
2. Update the RPC and LCD URLs.
3. Update Bech32 address prefixes.
4. Update genesis file location.

### Requirements

* [Meteor v1.10](https://www.meteor.com/install)

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
