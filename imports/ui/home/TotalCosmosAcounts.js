/* eslint-disable camelcase */
import 'babel-polyfill';
import { getNewWalletFromSeed } from "@lunie/cosmos-keys"
import { SigningStargateClient, assertIsBroadcastTxSuccess } from "@cosmjs/stargate"
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";

export const DEFAULT_GAS_PRICE = parseFloat(Meteor.settings.public.ledger.gasPrice) || 0.025;
export const DEFAULT_MEMO = 'Sent via Big Dipper'
const RPC = Meteor.settings.public.remote.rpc
const API = Meteor.settings.public.remote.api
const COINTYPE = Meteor.settings.public.ledger.coinType
const seed = ""
const options = { prefix: 'cosmos' };
const bech32prefix = 'cosmos';

getFromAddress = () => {
    let hdpath = `m/44'/${COINTYPE}'/0'/0/0`
    const { cosmosAddress, privateKey, publicKey } = getNewWalletFromSeed(seed, bech32prefix, hdpath)
    return { cosmosAddress, privateKey, publicKey }
}

getToAddress = (accountIndex) => {
    let hdpath = `m/44'/${COINTYPE}'/${accountIndex}'/0/0`
    const { cosmosAddress, privateKey, publicKey } = getNewWalletFromSeed(seed, bech32prefix, hdpath)
    return { cosmosAddress, privateKey, publicKey }
}

async function queryTotalNumberOfCosmosAccounts(accountIndex){
    let sendFromAddress = this.getFromAddress();
    let sendToAddress = this.getToAddress(accountIndex);
    // console.log("to account " + sendToAddress.cosmosAddress)

    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(seed);
    const client = await SigningStargateClient.connectWithSigner(RPC, wallet, options);
    const amount = [{ amount: "1", denom: "uatom" }]
    const fee = {
        amount: [{ amount: "100", denom: "uatom" }],
        gas: "100000",
    }
    const sendMsg = {
        typeUrl: "/cosmos.bank.v1beta1.MsgSend",
        value: {
            fromAddress: sendFromAddress.cosmosAddress,
            toAddress: sendToAddress.cosmosAddress,
            amount: [...amount],
        },
    };
    try {
        let signMessage = await client.signAndBroadcast(sendFromAddress.cosmosAddress, [sendMsg], fee, DEFAULT_MEMO);
        assertIsBroadcastTxSuccess(signMessage);
    }
    catch (e) {
        console.log(e)
    }
    try {
        const accountNumber = await client.getSequence(sendToAddress.cosmosAddress);
        // console.log(accountNumber)
        const latestAccountNumber = accountNumber.accountNumber || 0;
        try{
            Meteor.call('chain.getTotalCosmosAccounts', latestAccountNumber)
        }
        catch(e){
            console.log("Error updating Total Number Of Cosmos Accounts " + e)
        }
        return latestAccountNumber
    }
    catch (e) {
        console.log(e)
    }
}

export async function getTotalCosmosAccounts() {
    let accountIndex;
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(seed);
    const client = await SigningStargateClient.connectWithSigner(RPC, wallet, options);
    for(let c = 1; c < 100; c++){
        let accIndex = this.getToAddress(c);
        try{
            // eslint-disable-next-line no-await-in-loop
            await client.getSequence(accIndex.cosmosAddress)   
        }
        catch(e){
            accountIndex = c
            break;
        }
       
    }
    // console.log(accountIndex)

    return queryTotalNumberOfCosmosAccounts(accountIndex)
}