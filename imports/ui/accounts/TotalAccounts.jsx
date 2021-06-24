import { getNewWalletFromSeed } from "@lunie/cosmos-keys"
import { signWithPrivateKey } from "@lunie/cosmos-keys"
import Cosmos from "@lunie/cosmos-js"


function getFromAddress(){
    const seed = "economy stock theory fatal elder harbor betray wasp final emotion task crumble siren bottom lizard educate guess current outdoor pair theory focus wife stone";
    const bech32prefix = 'cosmos';
    let hdpath = `m/44'/${COINTYPE}'/0'/0/0`
    const { cosmosAddress, privateKey, publicKey } = getNewWalletFromSeed(seed, bech32prefix, hdpath)
    return { cosmosAddress, privateKey, publicKey }
}
function getToAddress() {
    const seed = "economy stock theory fatal elder harbor betray wasp final emotion task crumble siren bottom lizard educate guess current outdoor pair theory focus wife stone";
    const bech32prefix = 'cosmos';
    let hdpath = `m/44'/${COINTYPE}'/1'/0/0`
    const { cosmosAddress, privateKey, publicKey } = getNewWalletFromSeed(seed, bech32prefix, hdpath)
    return { cosmosAddress, privateKey, publicKey }
}
export async function queryTotalNumberOfAccounts(transportBLE, accountIndex) {
    // let signMessage = { "account_number": "51442", 
    //     "chain_id": "cosmoshub-4",
    //     "fee": { "amount": [{ "amount": "1879", "denom": "uatom" }], "gas": "93931" }, 
    //     "memo": "Sent via Big Dipper", 
    //     "msgs": [{
    //         "type": "cosmos-sdk/MsgSend",
    //         "value": { "amount": [{ "amount": "100000", "denom": "uatom" }], 
    //             "from_address": "cosmos1uulfsj45fvvkr98s859nxkzy08dzejs35ruy3l", 
    //             "to_address": "cosmos1uulfsj45fvvkr98s859nxkzy08dzejs35ruy3l" } }], 
    //     "sequence": "3" }

    let getFromAddress = getFromAddress();
    let getToAddress = getToAddress();

    console.log(getFromAddress, getToAddress);

    const cosmos = Cosmos("http://139.162.187.197:1317", getFromAddress.cosmosAddress)
    // create message
    const msg = cosmos
        .MsgSend({ toAddress: getToAddress, amounts: [{ denom: 'uatom', amount: 100 }] })
    console.log(msg)
    // create a signer from this local js signer library
    const localSigner = (signMessage) => {
        const signature = signWithPrivateKey(signMessage, privateKey)

        return {
            signature,
            publicKey
        }
    }

    // send the transaction
    const { included } = await msg.send({ gas: 200000 }, localSigner)
    console.log(included)
    // await tx to be included in a block
    await included()
   
    return ''
}