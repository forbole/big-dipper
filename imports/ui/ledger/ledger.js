/* eslint-disable camelcase */
// https://github.com/zondax/cosmos-delegation-js/
// https://github.com/cosmos/ledger-cosmos-js/blob/master/src/index.js
import 'babel-polyfill';

import Long from "long";
import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
import CosmosApp from "ledger-cosmos-js"
import { signatureImport } from "secp256k1"
import { Validators } from '/imports/api/validators/validators.js';
import semver from "semver"
import bech32 from "bech32";
import sha256 from "crypto-js/sha256"
import ripemd160 from "crypto-js/ripemd160"
import CryptoJS from "crypto-js"
import { MsgDelegate, MsgUndelegate, MsgBeginRedelegate } from "@cosmjs/stargate/build/codec/cosmos/staking/v1beta1/tx"; 
import { MsgSend } from "@cosmjs/stargate/build/codec/cosmos/bank/v1beta1/tx"; 
import { MsgWithdrawDelegatorReward } from "@cosmjs/stargate/build/codec/cosmos/distribution/v1beta1/tx";
import { VoteOption, TextProposal } from "../../../cosmos/codec/gov/v1beta1/gov";
import { Plan, SoftwareUpgradeProposal, CancelSoftwareUpgradeProposal} from '../../../cosmos/codec/upgrade/upgrade';
import { ParameterChangeProposal } from '../../../cosmos/codec/params/v1beta1/params';
import { CommunityPoolSpendProposal, CommunityPoolSpendProposalWithDeposit } from '@cosmjs/stargate/build/codec/cosmos/distribution/v1beta1/distribution'
import { ClientUpdateProposal } from '@cosmjs/stargate/build/codec/ibc/core/client/v1/client';
import numbro from 'numbro';

// TODO: discuss TIMEOUT value
const INTERACTION_TIMEOUT = 10000
const REQUIRED_COSMOS_APP_VERSION = Meteor.settings.public.ledger.ledgerAppVersion || "2.16.0";
const DEFAULT_DENOM = Meteor.settings.public.bondDenom || 'cudo';
const TYPE_URLS = {
    msgDelegate: "/cosmos.staking.v1beta1.MsgDelegate",
    msgUndelegate:"/cosmos.staking.v1beta1.MsgUndelegate",
    msgRedelegate: "/cosmos.staking.v1beta1.MsgBeginRedelegate",
    msgSend: "/cosmos.bank.v1beta1.MsgSend",
    msgWithdraw: "/cosmos.distribution.v1beta1.MsgWithdrawDelegationReward",
    msgSubmitProposal: "/cosmos.gov.v1beta1.MsgSubmitProposal",
    proposalTypeCancelSoftwareUpgradeProposal: "/cosmos.upgrade.v1beta1.CancelSoftwareUpgradeProposal",
    proposalTypeSoftwareUpgradeProposal: "/cosmos.upgrade.v1beta1.SoftwareUpgradeProposal",
    proposalTypeTextProposal: "/cosmos.gov.v1beta1.TextProposal",
    proposalTypeParameterChangeProposal: "/cosmos.params.v1beta1.ParameterChangeProposal",
    proposalTypeCommunityPoolSpendProposal: "/cosmos.distribution.v1beta1.CommunityPoolSpendProposal",
    proposalTypeClientUpdateProposal: "/ibc.core.client.v1.ClientUpdateProposal",
}

export const DEFAULT_GAS_PRICE = parseFloat(Meteor.settings.public.ledger.gasPrice) || 0.025;
export const DEFAULT_MEMO = 'Sent via CUDOS explorer'

/*
HD wallet derivation path (BIP44)
DerivationPath{44, 118, account, 0, index}
*/

const COINTYPE = Meteor.settings.public.ledger.coinType || 118;

const HDPATH = [44, COINTYPE, 0, 0, 0]

const chainId = Meteor.settings.public.chainId;

function bech32ify(address, prefix) {
    const words = bech32.toWords(address)
    return bech32.encode(prefix, words)
}

export const toPubKey = (address) => {
    return bech32.decode(Meteor.settings.public.bech32PrefixAccAddr, address);
}

function createCosmosAddress(publicKey) {
    try{
        const message = CryptoJS.enc.Hex.parse(publicKey.toString(`hex`))
        const hash = ripemd160(sha256(message)).toString()
        const address = Buffer.from(hash, `hex`)
        const cosmosAddress = bech32ify(address, Meteor.settings.public.bech32PrefixAccAddr)
        return cosmosAddress
    } catch(e){
        console.log(e);
    }
}

export class Ledger {

    static PROPOSAL_TYPES = {
        PROPOSAL_TYPE_TEXT: 1,
        PROPOSAL_TYPE_SOFTWARE_UPDATE: 2,
        PROPOSAL_TYPE_CANCEL_SOFTWARE_UPDATE: 3,
        PROPOSAL_TYPE_PARAM_CHANGE: 4,
        PROPOSAL_TYPE_COMMUNITY_POOL_SPEND: 5,
    }

    constructor({ testModeAllowed }) {
        this.testModeAllowed = testModeAllowed
        
    }

    // test connection and compatibility
    async testDevice() {
        // poll device with low timeout to check if the device is connected
        // const secondsTimeout = 3 // a lower value always timeouts
        // await this.connect(secondsTimeout)
    }
    async isSendingData() {
        // check if the device is connected or on screensaver mode
        // const response = await this.cosmosApp.publicKey(HDPATH)
        // this.checkLedgerErrors(response, {
        //     timeoutMessag: "Could not find a connected and unlocked Ledger device"
        // })
    }
    async isReady() {
    // check if the version is supported
        // const version = await this.getCosmosAppVersion()

        // if (!semver.gte(version, REQUIRED_COSMOS_APP_VERSION)) {
        //     const msg = `Outdated version: Please update Ledger Cosmos App to the latest version.`
        //     throw new Error(msg)
        // }

        // // throws if not open
        // await this.isCosmosAppOpen()
    }
    // connects to the device and checks for compatibility
    async connect(timeout = INTERACTION_TIMEOUT) {
        // assume well connection if connected once
        // if (this.cosmosApp) return

        // const transport = await TransportWebUSB.create(timeout)
        // const cosmosLedgerApp = new CosmosApp(transport)

        // this.cosmosApp = cosmosLedgerApp

        // await this.isSendingData()
        // await this.isReady()
    }
    
    async getCosmosAppVersion() {
        // await this.connect()

        // const response = await this.cosmosApp.getVersion()
        // this.checkLedgerErrors(response)
        // const { major, minor, patch, test_mode } = response
        // checkAppMode(this.testModeAllowed, test_mode)
        // const version = versionString({ major, minor, patch })

        const version = "1";
        return version
    }

    async isCosmosAppOpen() {
        // await this.connect()

        // const response = await this.cosmosApp.appInfo()
        // this.checkLedgerErrors(response)
        // const { appName } = response

        // if (appName.toLowerCase() !== Meteor.settings.public.ledger.appName.toLowerCase()) {
        //     throw new Error(`Close ${appName} and open the ${Meteor.settings.public.ledger.appName} app`)
        // }
    }

    static checkForKeplr() {
        return new Promise((resolve, reject) => {
            let counter = 0;
            const intervalHandler = setInterval(() => {
                if (window.getOfflineSigner && window.keplr) {
                    clearInterval(intervalHandler);
                    resolve(true);
                }
                if (++counter === 20) {
                    resolve(false);
                }
            }, 50);
        });
    }

    static async connectKeplr() {
        const hasKelpr = await Ledger.checkForKeplr();
        if (hasKelpr === false) {
            alert('Please install keplr extension');
            return;
        }

        if (window.keplr.experimentalSuggestChain) {
            try {
                await window.keplr.experimentalSuggestChain({
                    // Chain-id of the Cosmos SDK chain.
                    chainId: Meteor.settings.public.chainId,
                    // The name of the chain to be displayed to the user.
                    chainName: Meteor.settings.public.chainName,
                    // RPC endpoint of the chain.
                    rpc: Meteor.settings.public.urls.rpc,
                    // REST endpoint of the chain.
                    rest: Meteor.settings.public.urls.api,
                    // Staking coin information
                    stakeCurrency: {
                        // Coin denomination to be displayed to the user.
                        coinDenom: Meteor.settings.public.coins[0].displayName,
                        // Actual denom (i.e. uatom, uscrt) used by the blockchain.
                        coinMinimalDenom: Meteor.settings.public.coins[0].denom,
                        // # of decimal points to convert minimal denomination to user-facing denomination.
                        coinDecimals: Math.log10(Meteor.settings.public.coins[0].fraction),
                        // (Optional) Keplr can show the fiat value of the coin if a coingecko id is provided.
                        // You can get id from https://api.coingecko.com/api/v3/coins/list if it is listed.
                        coinGeckoId: Meteor.settings.public.coingeckoId,
                    },
                    // (Optional) If you have a wallet webpage used to stake the coin then provide the url to the website in `walletUrlForStaking`.
                    // The 'stake' button in Keplr extension will link to the webpage.
                    walletUrlForStaking: Meteor.settings.public.urls.staking,
                    // The BIP44 path.
                    bip44: {
                        // You can only set the coin type of BIP44.
                        // 'Purpose' is fixed to 44.
                        coinType: Meteor.settings.public.ledger.coinType,
                    },
                    bech32Config: {
                        bech32PrefixAccAddr: Meteor.settings.public.bech32PrefixAccAddr,
                        bech32PrefixAccPub: Meteor.settings.public.bech32PrefixAccPub,
                        bech32PrefixValAddr: Meteor.settings.public.bech32PrefixValAddr,
                        bech32PrefixValPub: Meteor.settings.public.bech32PrefixValPub,
                        bech32PrefixConsAddr: Meteor.settings.public.bech32PrefixConsAddr,
                        bech32PrefixConsPub: Meteor.settings.public.bech32PrefixConsPub
                    },
                    // List of all coin/tokens used in this chain.
                    currencies: [{
                        // Coin denomination to be displayed to the user.
                        coinDenom: Meteor.settings.public.coins[0].displayName,
                        // Actual denom (i.e. uatom, uscrt) used by the blockchain.
                        coinMinimalDenom: Meteor.settings.public.coins[0].denom,
                        // # of decimal points to convert minimal denomination to user-facing denomination.
                        coinDecimals: Math.log10(Meteor.settings.public.coins[0].fraction),
                        // (Optional) Keplr can show the fiat value of the coin if a coingecko id is provided.
                        // You can get id from https://api.coingecko.com/api/v3/coins/list if it is listed.
                        coinGeckoId: Meteor.settings.public.coingeckoId,
                    }],
                    // List of coin/tokens used as a fee token in this chain.
                    feeCurrencies: [{
                        // Coin denomination to be displayed to the user.
                        coinDenom: Meteor.settings.public.coins[0].displayName,
                        // Actual denom (i.e. uatom, uscrt) used by the blockchain.
                        coinMinimalDenom: Meteor.settings.public.coins[0].denom,
                        // # of decimal points to convert minimal denomination to user-facing denomination.
                        coinDecimals: Math.log10(Meteor.settings.public.coins[0].fraction),
                        // (Optional) Keplr can show the fiat value of the coin if a coingecko id is provided.
                        // You can get id from https://api.coingecko.com/api/v3/coins/list if it is listed.
                        // coinGeckoId: Meteor.settings.public.coingeckoId,
                    }],
                    // (Optional) The number of the coin type.
                    // This field is only used to fetch the address from ENS.
                    // Ideally, it is recommended to be the same with BIP44 path's coin type.
                    // However, some early chains may choose to use the Cosmos Hub BIP44 path of '118'.
                    // So, this is separated to support such chains.
                    coinType: Meteor.settings.public.ledger.coinType,
                    // (Optional) This is used to set the fee of the transaction.
                    // If this field is not provided, Keplr extension will set the default gas price as (low: 0.01, average: 0.025, high: 0.04).
                    // Currently, Keplr doesn't support dynamic calculation of the gas prices based on on-chain data.
                    // Make sure that the gas prices are higher than the minimum gas prices accepted by chain validators and RPC/REST endpoint.
                    gasPriceStep: {
                        low: Meteor.settings.public.ledger.gasPrice / 2,
                        average: Meteor.settings.public.ledger.gasPrice / 8,
                        high: Meteor.settings.public.ledger.gasPrice * 2
                    }
                });
            } catch (ex) {
                alert("Failed to suggest the chain");
            }
        } else {
            alert("Please use the recent version of keplr extension");
        }
        // You should request Keplr to enable the wallet.
        // This method will ask the user whether or not to allow access if they haven't visited this website.
        // Also, it will request user to unlock the wallet if the wallet is locked.
        // If you don't request enabling before usage, there is no guarantee that other methods will work.
        await window.keplr.enable(Meteor.settings.public.chainId);

        const offlineSigner = window.getOfflineSigner(Meteor.settings.public.chainId);
        const account = (await offlineSigner.getAccounts())[0];
    
        localStorage.setItem(CURRENTUSERADDR, account.address);
        localStorage.setItem(CURRENTUSERPUBKEY, account.pubkey);

        return account;
    }


    async getAccount() {
        // await this.connect()

        // const response = await this.cosmosApp.publicKey(HDPATH)
        // this.checkLedgerErrors(response)
        // return response.compressed_pk
        if (!window.getOfflineSigner){
            await Ledger.connectKeplr();
        }

        const offlineSigner = window.getOfflineSigner(Meteor.settings.public.chainId);
        let account = (await offlineSigner.getAccounts())[0];
        return account;
    }

    async getCosmosAddress() {
        const account = await this.getAccount();
        return {pubKey: account.pubkey, address: account.address}
    }

    async confirmLedgerAddress() {
        // await this.connect()
        // const cosmosAppVersion = await this.getCosmosAppVersion()

        // if (semver.lt(cosmosAppVersion, REQUIRED_COSMOS_APP_VERSION)) {
        //     // we can't check the address on an old cosmos app
        //     return
        // }

        // const response = await this.cosmosApp.getAddressAndPubKey(
        //     HDPATH,
        //     BECH32PREFIX,
        // )
        // this.checkLedgerErrors(response, {
        //     rejectionMessage: "Displayed address was rejected"
        // })
    }

    async sign(signMessage) {
        //await this.connect()

        const response = await this.cosmosApp.sign(HDPATH, signMessage)
        this.checkLedgerErrors(response)
        // we have to parse the signature from Ledger as it's in DER format
        const parsedSignature = signatureImport(response.signature)
        return parsedSignature
    }

    /* istanbul ignore next: maps a bunch of errors */
    checkLedgerErrors(
        { error_message, device_locked },
        {
            timeoutMessag = "Connection timed out. Please try again.",
            rejectionMessage = "User rejected the transaction"
        } = {}
    ) {
        if (device_locked) {
            throw new Error(`Ledger's screensaver mode is on`)
        }
        switch (error_message) {
        case `U2F: Timeout`:
            throw new Error(timeoutMessag)
        case `${Meteor.settings.public.ledger.appName} app does not seem to be open`:
            // hack:
            // It seems that when switching app in Ledger, WebUSB will disconnect, disabling further action.
            // So we clean up here, and re-initialize this.cosmosApp next time when calling `connect`
            this.cosmosApp.transport.close()
            this.cosmosApp = undefined
            throw new Error(`${Meteor.settings.public.ledger.appName} app is not open`)
        case `Command not allowed`:
            throw new Error(`Transaction rejected`)
        case `Transaction rejected`:
            throw new Error(rejectionMessage)
        case `Unknown error code`:
            throw new Error(`Ledger's screensaver mode is on`)
        case `Instruction not supported`:
            throw new Error(
                `Your ${Meteor.settings.public.ledger.appName} Ledger App is not up to date. ` +
                `Please update to version ${REQUIRED_COSMOS_APP_VERSION}.`
            )
        case `No errors`:
            // do nothing
            break
        default:
            throw new Error(error_message)
        }
    }

    static getBytesToSign(tx, txContext) {
        if (typeof txContext === 'undefined') {
            throw new Error('txContext is not defined');
        }
        if (typeof txContext.chainId === 'undefined') {
            throw new Error('txContext does not contain the chainId');
        }
        if (typeof txContext.accountNumber === 'undefined') {
            throw new Error('txContext does not contain the accountNumber');
        }
        if (typeof txContext.sequence === 'undefined') {
            throw new Error('txContext does not contain the sequence value');
        }

        const txFieldsToSign = {
            account_number: txContext.accountNumber.toString(),
            chain_id: txContext.chainId,
            fee: tx.value.fee,
            memo: tx.value.memo,
            msgs: tx.value.msg,
            sequence: txContext.sequence.toString(),
        };

        return JSON.stringify(canonicalizeJson(txFieldsToSign));
    }

    static applyGas(unsignedTx, gas, gasPrice=DEFAULT_GAS_PRICE, denom=DEFAULT_DENOM) {
        if (typeof unsignedTx === 'undefined') {
            throw new Error('undefined unsignedTx');
        }
        if (typeof gas === 'undefined') {
            throw new Error('undefined gas');
        }

        // eslint-disable-next-line no-param-reassign
        unsignedTx.value.fee = {
            amount: [{
                amount: Math.ceil(gas * gasPrice).toString(),
                denom: denom,
            }],
            gas: gas.toString(),
        };

        return unsignedTx;
    }

    static applySignature(unsignedTx, txContext, secp256k1Sig) {
        if (typeof unsignedTx === 'undefined') {
            throw new Error('undefined unsignedTx');
        }
        if (typeof txContext === 'undefined') {
            throw new Error('undefined txContext');
        }
        if (typeof txContext.pk === 'undefined') {
            throw new Error('txContext does not contain the public key (pk)');
        }
        if (typeof txContext.accountNumber === 'undefined') {
            throw new Error('txContext does not contain the accountNumber');
        }
        if (typeof txContext.sequence === 'undefined') {
            throw new Error('txContext does not contain the sequence value');
        }

        const tmpCopy = Object.assign({}, unsignedTx, {});

        tmpCopy.value.signatures = [
            {
                signature: secp256k1Sig.toString('base64'),
                account_number: txContext.accountNumber.toString(),
                sequence: txContext.sequence.toString(),
                pub_key: {
                    type: 'tendermint/PubKeySecp256k1',
                    value: txContext.pk//Buffer.from(txContext.pk, 'hex').toString('base64'),
                },
            },
        ];
        return tmpCopy;
    }

    // Creates a new tx skeleton
    static createSkeleton(txContext, msgs=[]) {
        if (typeof txContext === 'undefined') {
            throw new Error('undefined txContext');
        }
        if (typeof txContext.accountNumber === 'undefined') {
            throw new Error('txContext does not contain the accountNumber');
        }
        if (typeof txContext.sequence === 'undefined') {
            throw new Error('txContext does not contain the sequence value');
        }
        const txSkeleton = {
            type: 'auth/StdTx',
            value: {
                msg: msgs,
                fee: '',
                memo: txContext.memo || DEFAULT_MEMO,
                signatures: [{
                    signature: 'N/A',
                    account_number: txContext.accountNumber.toString(),
                    sequence: txContext.sequence.toString(),
                    pub_key: {
                        type: 'tendermint/PubKeySecp256k1',
                        value: txContext.pk || 'PK',
                    },
                }],
            },
        };
        //return Ledger.applyGas(txSkeleton, DEFAULT_GAS);
        return txSkeleton
    }

    // Creates a new delegation tx based on the input parameters
    // the function expects a complete txContext
    static createDelegate(
        txContext,
        validatorBech32,
        uatomAmount
    ) {
        const msgAny = [{    
            typeUrl: TYPE_URLS.msgDelegate,
            value: MsgDelegate.fromPartial({
                delegatorAddress: txContext.bech32,
                validatorAddress: validatorBech32,
                amount: {
                    amount: uatomAmount.toString(10),
                    denom: txContext.denom,
                },
            }),
        }];

        return {msgAny, memo: txContext.memo, fee: Meteor.settings.public.fees.delegate};
    }

    // Creates a new undelegation tx based on the input parameters
    // the function expects a complete txContext
    static createUndelegate(
        txContext,
        validatorBech32,
        uatomAmount
    ) {
        const msgAny = [{    
            typeUrl: TYPE_URLS.msgUndelegate,
            value: MsgUndelegate.fromPartial({
                delegatorAddress: txContext.bech32,
                validatorAddress: validatorBech32,
                amount: {
                    amount: uatomAmount.toString(10),
                    denom: txContext.denom,
                },
            }),
            memo: txContext.memo,
        }];

        return {msgAny, memo: txContext.memo, fee: Meteor.settings.public.fees.undelegate};
    }

    // Creates a new redelegation tx based on the input parameters
    // the function expects a complete txContext
    static createRedelegate(
        txContext,
        validatorSourceBech32,
        validatorDestBech32,
        uatomAmount
    ) {
        const msgAny = [{    
            typeUrl: TYPE_URLS.msgRedelegate,
            value: MsgBeginRedelegate.fromPartial({
                delegatorAddress: txContext.bech32,
                validatorSrcAddress: validatorSourceBech32,
                validatorDstAddress: validatorDestBech32,
                amount: {
                    amount: uatomAmount.toString(10),
                    denom: txContext.denom,
                },
            }),
            memo: txContext.memo,
        }];

        return {msgAny, memo: txContext.memo, fee: Meteor.settings.public.fees.redelegate};
    }

    static async createWithdraw(txContext, validators){
        const msgAny = [];

        validators.forEach(validator => msgAny.push({    
            typeUrl: TYPE_URLS.msgWithdraw,
            value: MsgWithdrawDelegatorReward.fromPartial({
                delegatorAddress: txContext.bech32,
                validatorAddress: validator.address
            })
        }));

        return {msgAny, memo: txContext.memo, fee: Meteor.settings.public.fees.redelegate};
    }

    // Creates a new transfer tx based on the input parameters
    // the function expects a complete txContext
    static createTransfer(
        txContext,
        toAddress,
        amount
    ) {

        const msgAny = [{    
            typeUrl: TYPE_URLS.msgSend,
            value: MsgSend.fromPartial({
                fromAddress: txContext.bech32,
                toAddress: toAddress,
                amount: [{
                    amount: amount.toString(10),
                    denom: txContext.denom,
                }],
            }),
        }];

        return {msgAny, memo: txContext.memo, fee: Meteor.settings.public.fees.redelegate};
    }


    static createSubmitProposal(
        txContext,
        proposalData,
        deposit
    ) {
        
        const content = getProposalContent(proposalData);

        const msgAny = [{
            typeUrl: TYPE_URLS.msgSubmitProposal,
            value: {
                content: content,
                initial_deposit: [{
                    amount: deposit.toString(10),
                    denom: txContext.denom
                }],
                proposer: txContext.bech32
            }
        }];


        return {msgAny, memo: txContext.memo, fee: Meteor.settings.public.fees.redelegate};
    }

    static createVote(
        txContext,
        proposalId,
        option,
    ) {
        
        let voteOptionInt = getVoteOptionIntValue(option);


        const msgAny = [{
            typeUrl: "/cosmos.gov.v1beta1.MsgVote",
            value: {
                option: voteOptionInt,
                proposalId: new Long(proposalId),
                voter: txContext.bech32
            }
        }];

        return {msgAny, memo: txContext.memo, fee: Meteor.settings.public.fees.redelegate};
    }


    static createDeposit(
        txContext,
        proposalId,
        amount) {
        const msgAny = [{
            typeUrl: "/cosmos.gov.v1beta1.MsgDeposit", // Same as above
            value: {
                amount: [{
                    amount: amount.toString(10),
                    denom: txContext.denom
                }],
                depositor: txContext.bech32,
                proposalId: new Long(proposalId),
            },
        }]; 

        return {msgAny, memo: txContext.memo, fee: Meteor.settings.public.fees.redelegate};
    }

}


function getProposalContent(proposalData){
    switch(proposalData.proposalType){
    case Ledger.PROPOSAL_TYPES.PROPOSAL_TYPE_TEXT:
        return {
            typeUrl: TYPE_URLS.proposalTypeTextProposal,
            value: TextProposal.encode({
                title: proposalData.proposalTitle,
                description: proposalData.proposalDescription
            }).finish()
        }
    case Ledger.PROPOSAL_TYPES.PROPOSAL_TYPE_SOFTWARE_UPDATE:
        return {
            typeUrl: TYPE_URLS.proposalTypeSoftwareUpgradeProposal,
            value: SoftwareUpgradeProposal.encode({
                title: proposalData.proposalTitle,
                description: proposalData.proposalDescription,
                plan: {
                    name: proposalData.planName,
                    height: Long.fromString(proposalData.planHeight),
                    info: proposalData.planInfo
                }
            }).finish()
        }
    case Ledger.PROPOSAL_TYPES.PROPOSAL_TYPE_CANCEL_SOFTWARE_UPDATE:
        return {
            typeUrl: TYPE_URLS.proposalTypeCancelSoftwareUpgradeProposal,
            value: CancelSoftwareUpgradeProposal.encode({
                title: proposalData.proposalTitle,
                description: proposalData.proposalDescription,
            }).finish()

        }
    case Ledger.PROPOSAL_TYPES.PROPOSAL_TYPE_PARAM_CHANGE:
        return {
            typeUrl: TYPE_URLS.proposalTypeParameterChangeProposal,
            value: ParameterChangeProposal.encode({
                title: proposalData.proposalTitle,
                description: proposalData.proposalDescription,
                changes: [{
                    subspace: proposalData.changeSubspace,
                    key: proposalData.changeKey,
                    value: `"${proposalData.changeValue}"`
                }]
            }).finish()
        }
    case Ledger.PROPOSAL_TYPES.PROPOSAL_TYPE_COMMUNITY_POOL_SPEND:
        return {
            typeUrl: TYPE_URLS.proposalTypeCommunityPoolSpendProposal,
            value: CommunityPoolSpendProposal.encode({
                title: proposalData.proposalTitle,
                description: proposalData.proposalDescription,
                recipient: proposalData.poolRecipient,
                amount: [{amount: proposalData.poolAmount, denom: proposalData.poolDenom}]
            }).finish()
        }
    }
}

function versionString({ major, minor, patch }) {
    return `${major}.${minor}.${patch}`
}

export const checkAppMode = (testModeAllowed, testMode) => {
    if (testMode && !testModeAllowed) {
        throw new Error(
            `DANGER: The ${Meteor.settings.public.ledger.appName} Ledger app is in test mode and shouldn't be used on mainnet!`
        )
    }
}

function canonicalizeJson(jsonTx) {
    if (Array.isArray(jsonTx)) {
        return jsonTx.map(canonicalizeJson);
    }
    if (typeof jsonTx !== 'object') {
        return jsonTx;
    }
    const tmp = {};
    Object.keys(jsonTx).sort().forEach((key) => {
        // eslint-disable-next-line no-unused-expressions
        jsonTx[key] != null && (tmp[key] = jsonTx[key]);
    });

    return tmp;
}

function getVoteOptionIntValue(option){
    switch(option){
    default:
    case "Unspecified":
        return VoteOption.VOTE_OPTION_UNSPECIFIED;
    case "Yes":
        return VoteOption.VOTE_OPTION_YES;
    case "Abstain":
        return VoteOption.VOTE_OPTION_ABSTAIN;
    case "No":
        return VoteOption.VOTE_OPTION_NO;
    case "NoWithVeto":
        return VoteOption.VOTE_OPTION_NO_WITH_VETO;
    } 
}

