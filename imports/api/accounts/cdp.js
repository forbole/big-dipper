// const kava = require("@kava-labs/javascript-sdk");
// const KavaClient = kava.KavaClient;

// var main = async () => {
//   const mnemonic = "";
//   const testnetURL = "http://kava-testnet-5000.kava.io:1317"; // kava-testnet-5000 endpoint
//   const localURL = "http://localhost:1317"; // local testing endpoint

//   // Declare a new Kava client, set wallet, and initialize chain
//   client = new KavaClient(testnetURL);
//   client.setWallet(mnemonic);
//   await client.initChain();

//   // ...transfer coins, bid on an auction, create a CDP, etc.



//   Meteor.methods({
//     'create.cdp': function(cdpInfo) {
//         const url = `${LCD}/cdp`;
//         data = {
//             "sender": cdpInfo.sender,
//             "collateral": cdpInfo.collateral,
//             "base_req": {
//                 ...body,
//                 "chain_id": Meteor.settings.public.chainId,
//             }
//         }
//         const timestamp = new Date().getTime();
//         console.log(JSON.stringify(data))

//     }
// })
// };

