# Big Dipper :sparkles:
Forbole Block Explorer for Cosmos

## Projects running on mainnets
[Explore Cosmos Hub (cosmoshub-1) with The Big Dipper](https://cosmos.bigdipper.live)

[Explore IRISnet (irishub) with The Big Dipper](https://iris.bigdipper.live)

## Projects with testnets

[Sentinel testnet](https://explorer.sentinel.co/)

## How to run The Big Dipper

1. Copy `settings.json.default` to `settings.json`.
2. Update path to `gaiadebug`.
3. Update the RPC and LCD URLs.
4. Update Bech32 address prefixes.
5. Update genesis file location.

### Run in local

```
meteor npm install
meteor update
meteor --settings settings.json
```

### Run in production

```
./build.sh
```

It will create a packaged Node JS tarball at `../output`. Deploy that packaged Node JS project with process manager like [forever](https://www.npmjs.com/package/forever) or [Phusion Passenger](https://www.phusionpassenger.com/library/walkthroughs/basics/nodejs/fundamental_concepts.html).

---
## Donations :pray:

The Big Dipper is always free and open. Anyone can use to monitor available Cosmos hub or zones, or port to your own chain built with Cosmos SDK. We welcome any supports to help us improve this project.

ATOM: `cosmos1n67vdlaejpj3uzswr9qapeg76zlkusj5k875ma`\
BTC: `1HrTuvS83VoUVA79wTifko69ziWTjEXzQS`\
ETH: `0xec3AaC5023E0C9E2a76A223E4e312f275c76Cd77`

And by downloading and using [Brave](https://brave.com/big517).
