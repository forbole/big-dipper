/* eslint-disable camelcase */
import { Meteor } from 'meteor/meteor';
import 'babel-polyfill';
import { getNewWalletFromSeed } from "@lunie/cosmos-keys"
import { SigningStargateClient, assertIsBroadcastTxSuccess } from "@cosmjs/stargate"
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";

export const DEFAULT_GAS_PRICE = parseFloat(Meteor.settings.public.ledger.gasPrice) || 0.025;
export const DEFAULT_MEMO = 'Sent via Big Dipper'
const RPC = Meteor?.settings?.public?.remote?.rpc
const COINTYPE = Meteor?.settings?.public?.ledger?.coinType
const seed = Meteor?.settings?.private?.seed;
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

async function fetchCosmosAccountsNumber(accountIndex){
    let sendFromAddress = this.getFromAddress();
    let sendToAddress = this.getToAddress(accountIndex);
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
        const latestAccountNumber = accountNumber.accountNumber || 0;
        try{
            Meteor.call('chain.getCosmosAccountsNumber', latestAccountNumber)
        }
        catch(e){
            console.log("chain.getCosmosAccountsNumber error " + e)
        }
        return latestAccountNumber
    }
    catch (e) {
        console.log(e)
    }
}

export function getCosmosAccountsNumber() {
    Meteor.call('chain.shouldUpdateCosmosAccountsNumber', async (error, result) => {
        if (error) {
            console.log("chain.shouldUpdateCosmosAccountsNumber error ", error);
        }
        else {
            let accountIndex;
            const wallet = await DirectSecp256k1HdWallet.fromMnemonic(seed);
            const client = await SigningStargateClient.connectWithSigner(RPC, wallet, options);
            for (let c = 1; c < 100; c++) {
                let accIndex = this.getToAddress(c);
                try {
                    // eslint-disable-next-line no-await-in-loop
                    await client.getSequence(accIndex.cosmosAddress)
                }
                catch (e) {
                    accountIndex = c
                    break;
                }

            }
            return fetchCosmosAccountsNumber(accountIndex)
        }
    })
}

Meteor.methods({
    'cosmosAccounts.getToAddress': function (accountIndex) {
        this.unblock();
        let hdpath = `m/44'/${COINTYPE}'/${accountIndex}'/0/0`
        const { cosmosAddress, privateKey, publicKey } = getNewWalletFromSeed(seed, bech32prefix, hdpath)
        return { cosmosAddress, privateKey, publicKey }
    },
    'cosmosAccounts.getFromAddress': function () {
        this.unblock();
        let hdpath = `m/44'/${COINTYPE}'/0'/0/0`
        const { cosmosAddress, privateKey, publicKey } = getNewWalletFromSeed(seed, bech32prefix, hdpath)
        return { cosmosAddress, privateKey, publicKey }
    },
    'cosmosAccounts.fetchCosmosAccountsNumber': async function (accountIndex) {
        this.unblock();
        let sendFromAddress, sendToAddress;
        Meteor.call('cosmosAccounts.getFromAddress', (error, result) => {
            if (error) {
                console.log("cosmosAccounts.getFromAddress error ", error);
            }
            else if(result){
                sendFromAddress = result;
            }
        })
        Meteor.call('cosmosAccounts.getToAddress', accountIndex, (error, result) => {
            if (error) {
                console.log("cosmosAccounts.getToAddress error ", error);
            }
            else if (result) {
                sendToAddress = result;
            }
        })

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
            const latestAccountNumber = accountNumber.accountNumber || 0;
            try {
                Meteor.call('chain.getCosmosAccountsNumber', latestAccountNumber)
            }
            catch (e) {
                console.log("chain.getCosmosAccountsNumber error " + e)
            }
            return latestAccountNumber
        }
        catch (e) {
            console.log(e)
        }
    },

    'cosmosAccounts.getTotal': function () {
        this.unblock();
        Meteor.call('chain.shouldUpdateCosmosAccountsNumber', async (error, result) => {
            if (error) {
                console.log("chain.shouldUpdateCosmosAccountsNumber error ", error);
            }
            else {
                let accountIndex;
                const wallet = await DirectSecp256k1HdWallet.fromMnemonic(seed);
                const client = await SigningStargateClient.connectWithSigner(RPC, wallet, options);
                for (let c = 1; c < 100; c++) {
                    let accIndex;
                    // eslint-disable-next-line no-loop-func
                    Meteor.call('cosmosAccounts.getToAddress', c, async (error, result) => {
                        if (error) {
                            console.log("cosmosAccounts.getToAddress error ", error);
                        }
                        else if (result) {
                            accIndex = result;
                            try {
                                // eslint-disable-next-line no-await-in-loop
                                await client.getSequence(accIndex.cosmosAddress)
                            }
                            catch (e) {
                                accountIndex = c
                                // break;
                            }
                        }
                    })
                }
                try {
                    Meteor.call('cosmosAccounts.fetchCosmosAccountsNumber', latestAccountNumber)
                }
                catch (e) {
                    console.log("cosmosAccounts.fetchCosmosAccountsNumber error ", error);

                }
            }
        })
    },

})