# Big Dipper
Forbole Block Explorer for Cosmos

## Demo
[Explore Cosmos Hub (cosmoshub-1) with The Big Dipper](https://cosmos.bigdipper.live)

[Explore IRISnet (irishub) with The Big Dipper](https://iris.bigdipper.live)

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