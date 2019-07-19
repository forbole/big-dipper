import React, { Component } from 'react';
// import wasmExec from '/client/libs/wasm_exec.js';
import { Button, Input, Row, Col} from 'reactstrap';

import bech32 from "bech32";
import secp256k1 from "secp256k1";
import sha256 from "crypto-js/sha256"
import ripemd160 from "crypto-js/ripemd160"
import CryptoJS from "crypto-js"
import { Ledger, DEFAULT_MEMO } from '/imports/ui/ledger/ledger.js';

export default class Magpie extends Component{
    constructor(props){
        super(props);
        this.state = {}
        this.ledger = new Ledger({testModeAllowed: false});
    }

    generateKey = () => {
        // createKey();
        this.setState({
            pubKey: localStorage.getItem('pubKey'),
            privKey: localStorage.getItem('privKey')
        })
        this.getMessage(localStorage.getItem('pubKey'))
    }

    getBech32Pubkey = (pk) => {
        if (!pk) return
        const message = CryptoJS.enc.Hex.parse(Buffer.from(pk,'base64').toString('hex'))
        const hash = ripemd160(sha256(message)).toString()
        const address = Buffer.from(hash, 'hex')
        const words = bech32.toWords(address)
        const cosmosAddress = bech32.encode('desmos', words)
        return cosmosAddress
    }

    getTxContext = (pk) => {
        return {
            chainId: 'tesmos-1'/*Meteor.settings.public.chainId*/,
            bech32: this.getBech32Pubkey(pk),
            accountNumber: 8/*this.state.currentUser.accountNumber*/,
            sequence: 0/*this.state.currentUser.sequence*/,
            denom: 'desmos'/*Coin.MintingDenom*/,
            pk: pk,
            path: [44, 118, 0, 0, 0],
            memo: ''
        }
    }

    getMessage = (pk) => {
        const txContext = this.getTxContext(pk);
        let txMsg = Ledger.createCreateSession(
            txContext,
            localStorage.getItem(CURRENTUSERADDR),
            new Date().toISOString());


        const bytesToSign = Ledger.getBytesToSign(txMsg, txContext);
        this.setState({
            'rawMessage': JSON.stringify(txMsg),
            'bytesToSign': bytesToSign
        })

        this.ledger.sign(bytesToSign).then((sig) => {
            txMsg.value.msg[0].value.signature = sig.toString('base64');
            const wasmBytesToSign = Ledger.getBytesToSign(txMsg, txContext);
            this.setState({
                'ledgerSignedMessage': JSON.stringify(txMsg),
                wasmBytesToSign
            })
            signMessageWithKey(wasmBytesToSign, this.state.privKey)
            let signature = localStorage.getItem('signature')
            Ledger.applySignature(txMsg, txContext, signature);
            this.setState({
                signature,
                'doubleSignedMessage': JSON.stringify(txMsg)
            })
        })
    }

    handleInputChange = (e) => {
        let target = e.currentTarget;
        this.setState({[target.name]: target.value})
    }

    signMessageWithKey = () => {
        signMessageWithKey(this.state.message, this.state.privKey)
        this.setState({'signature': localStorage.getItem('signature')})
    }

    verifyMessageWithKey = () => {
        verifyMessageWithKey(this.state.message, this.state.signature, this.state.pubKey)
        this.setState({'verified': localStorage.getItem('verified')})
    }

    render(){
        return <div>


            <div>
                <span>Public Key</span>
                <Input type="textarea" id="pubKey" value={this.state.pubKey}/>
                <span>Bech32 Address</span>
                <Input type="textarea" value={this.getBech32Pubkey(this.state.pubKey)}/>
            </div>
            <div>
                <span>Private Key</span>
                <Input type="textarea" id="privKey" value={this.state.privKey}/>
            </div>
            <div>
                <span>Raw Message</span>
                <Input name="message" value={this.state.rawMessage}
                    placeholder="message" type="textarea"/>

                <span>Bytes For Ledger To Sign</span>
                <Input name="message" value={this.state.bytesToSign}
                    placeholder="message" type="textarea"/>

                <span>Ledger Signed Message</span>
                <Input name="message" value={this.state.ledgerSignedMessage}
                    placeholder="message" type="textarea"/>

                <span>Bytes For WASM to Sign</span>
                <Input name="message" value={this.state.wasmBytesToSign}
                    placeholder="message" type="textarea"/>

                <span>Final Message</span>
                <Input name="message" value={this.state.doubleSignedMessage}
                    placeholder="message" type="textarea"/>

            </div>
            <div>
                <span>Signature</span>
                <Input type="textarea" value={this.state.signature}/>
            </div>
            <div>
                <span>Verified?</span>
                <Input type="input" value={this.state.verified}/>
            </div>
            <Row>
                <Col><Button color="primary" onClick={this.generateKey}>Create Key</Button></Col>
                <Col><Button color="primary" onClick={this.signMessageWithKey}>Sign</Button></Col>
                <Col><Button color="primary" onClick={this.verifyMessageWithKey}>Verify</Button></Col>
            </Row>
            <Input type="textarea" value={JSON.stringify(localStorage)}/>

        </div>
    }
}