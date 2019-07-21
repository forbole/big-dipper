import bech32 from "bech32";

export function getBech32Address(hash, prefix='desmos') {
    if (!hash) return ''
    let address = Buffer.from(hash, `hex`)
    let words = bech32.toWords(address)
    return bech32.encode(prefix, words)
}

export class Magpie {
    constructor({ pubKey, privKey, pubAddr, accountNumber }) {
        this.pubKey = pubKey
        this.privKey = privKey
        this.pubAddr = pubAddr
        this.accountNumber = accountNumber
    }

    sign(txMsg) {
        const txContext = {
            chainId: Meteor.settings.public.desmosChainId,
            accountNumber: this.accountNumber,
            sequence: txMsg.value.signatures[0].sequence
        }
        const wasmBytesToSign = Ledger.getBytesToSign(txMsg, txContext);
        signMessageWithKey(wasmBytesToSign, this.privKey)
        let signature = localStorage.getItem(DESMOSPROXYSIG)
        Ledger.applySignature(txMsg, txContext, signature);
        return txMsg
    }

    // Creates a new tx skeleton
    createSkeleton(sequence) {
        return {
            type: 'cosmos-sdk/StdTx',
            value: {
                msg: [],
                fee: {
                    amount:[],
                    gas: 200000
                },
                memo: '',
                signatures: [{
                    signature: null,
                    account_number: this.accountNumber.toString(),
                    sequence: sequence.toString(),
                    pub_key: {
                        type: 'tendermint/PubKeySecp256k1',
                        value: this.pubKey,
                    },
                }],
            },
        };
    }

    createCreateSession(
        sequence,
        externalAddress,
        externalPubKey,
    ) {
        const txSkeleton = this.createSkeleton(sequence)
        txSkeleton.value.msg.push({
            type: "desmos/MsgCreateSession",
            value: {
                created: new Date().toISOString(),
                external_owner: externalAddress,
                namespace: "cosmos",
                owner: this.pubAddr,
                pubkey: externalPubKey,
                signature: null
            }
        })
        return txSkeleton;
    }

    createPost(
        sequence,
        externalAddress,
        message,
        parentID,
    ) {
        const txSkeleton = this.createSkeleton(sequence)
        txSkeleton.value.msg.push({
            type: "desmos/MsgCreatePost",
            value: {
                external_owner: externalAddress,
                message: message,
                namespace: "cosmos",
                owner: this.pubAddr,
                parentID:parentID.toString(),
                signature: null,
                time: new Date().toISOString(),
            }
        })
        return txSkeleton;
    }
    createEditPost(
        sequence,
        externalAddress,
        message,
        postID,
    ) {
        const txSkeleton = this.createSkeleton(sequence)
        txSkeleton.value.msg.push({
            type: "desmos/MsgCreatePost",
            value: {
                external_owner: externalAddress,
                message: message,
                namespace: "cosmos",
                owner: this.pubAddr,
                postId:postID.toString(),
                signature: null,
                time: new Date().toISOString(),
            }
        })
        return txSkeleton;
    }

    createLike(
        sequence,
        externalAddress,
        postID,
    ) {
        const txSkeleton = this.createSkeleton(sequence)
        txSkeleton.value.msg.push({
            type: "desmos/MsgLike",
            value: {
                external_owner: externalAddress,
                namespace: "cosmos",
                owner: this.pubAddr,
                postID:postID.toString(),
                signature: null,
                time: new Date().toISOString(),
            }
        })
        return txSkeleton;
    }
}