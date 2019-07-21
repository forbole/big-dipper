import bech32 from "bech32";
import { Ledger } from '/imports/ui/ledger/ledger.js';
export function getBech32Address(hash, prefix='desmos') {
    if (!hash) return ''
    let address = Buffer.from(hash, `hex`)
    let words = bech32.toWords(address)
    return bech32.encode(prefix, words)
}

export class Magpie {
    constructor(pubKey, privKey, pubAddr) {
        this.pubKey = pubKey
        this.privKey = privKey
        this.pubAddr = pubAddr
    }

    sign(txMsg, accountNumber, sequence) {
        const txContext = {
            chainId: Meteor.settings.public.desmosChainId,
            accountNumber: accountNumber,
            sequence: sequence,
            pk: this.pubKey
        }
        const wasmBytesToSign = Ledger.getBytesToSign(txMsg, txContext);
        let toSign = Buffer.from(wasmBytesToSign).toString('base64');
        signMessageWithKey(toSign, this.privKey)
        let signature = localStorage.getItem(DESMOSPROXYSIG)
        Ledger.applySignature(txMsg, txContext, signature);
        return txMsg
    }

    // Creates a new tx skeleton
    createSkeleton() {
        return {
            type: 'cosmos-sdk/StdTx',
            value: {
                fee: {
                    amount:[],
                    gas: "200000"
                },
                memo: '',
                msg: [],
                signatures: null,
            },
        };
    }

    createCreateSession(
        sequence,
        externalAddress,
        externalPubKey,
    ) {
        const txSkeleton = this.createSkeleton()
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
        return this.getAccountAndSign(txSkeleton);
    }

    createPost(
        externalAddress,
        message,
        parentID,
    ) {
        const txSkeleton = this.createSkeleton()
        txSkeleton.value.msg.push({
            type: "desmos/MsgCreatePost",
            value: {
                created: new Date().toISOString(),
                external_owner: externalAddress,
                message: message,
                namespace: "cosmos",
                owner: this.pubAddr,
                parent_id: parentID || "",
            }
        })
        return this.getAccountAndSign(txSkeleton);
    }
    createEditPost(
        sequence,
        externalAddress,
        message,
        postID,
    ) {
        const txSkeleton = this.createSkeleton()
        txSkeleton.value.msg.push({
            type: "desmos/MsgCreatePost",
            value: {
                external_owner: externalAddress,
                message: message,
                namespace: "cosmos",
                owner: this.pubAddr,
                post_id:postID.toString(),
                signature: null,
                time: new Date().toISOString(),
            }
        })
        return txSkeleton;
    }

    getAccountAndSign(msg, callback) {
        Meteor.call('desmos.getAccount', this.pubAddr, (error, result) => {
            try{
                if (result) {
                    this.sign(msg, result.account_number, result.sequence || 0)

                    Meteor.call('desmos.broadcast', msg, (err, res) => {
                        if (err) {
                            console.log(err)
                        } else if (res) {
                            console.log(res)
                        }
                    })
                } else {
                    console.log(error)
                }

            } catch (e) {
                console.log(e.message);
            }
        })
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
                liker: this.pubAddr,
                post_id:postID.toString(),
                created: new Date().toISOString(),
            }
        })
        return txSkeleton;
    }
}