# Big Dipper
Forbole Block Explorer for Cosmos

## Demo
[Explore Cosmos Game of Stakes (game_of_stakes_6) with The Big Dipper](https://bigdipper.forbole.com)

[Cosmos Testnet (gaia-12001)](https://gaia-12k1.bigdipper.live)

[Cosmos Testnet (gaia-11001)](https://gaia-11k1.bigdipper.live)

[Cosmos Testnet (gaia-10k)](https://gaia-10k.bigdipper.live)

## Projects running with the Big Dipper
[JoyStream testnet](http://explorer.joystream.org/)

[Sentinel testnet](https://explorer.sentinel.co/)

## How to run The Big Dipper

1. Copy `settings.json.default` to `settings.json`.
2. Update paths to `gaiacli` and `gaiadebug`.
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