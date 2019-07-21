import React, { Component } from 'react';
// import wasmExec from '/client/libs/wasm_exec.js';
import { Button, Input, Row, Col} from 'reactstrap';

import bech32 from "bech32";
import secp256k1 from "secp256k1";
import sha256 from "crypto-js/sha256"
import ripemd160 from "crypto-js/ripemd160"
import CryptoJS from "crypto-js"
import { Ledger, DEFAULT_MEMO, createBech32Address } from '/imports/ui/ledger/ledger.js';
import { getBech32Address } from './magpie.js';


bech32Address = (pubkey) =>
    createBech32Address(Buffer.from(pubkey,'base64'), 'desmos')

export default class Magpie extends Component{
    constructor(props){
        super(props);
        this.state = {pubKey: ''}
        this.ledger = new Ledger({testModeAllowed: false});
    }

    generateKey = () => {
        createKey();
        this.setState({
            pubKey: localStorage.getItem(DESMOSPROXYPUBKEY),
            privKey: localStorage.getItem(DESMOSPROXYPRIVKEY)
        })
        this.getMessage(localStorage.getItem(DESMOSPROXYPUBKEY), localStorage.getItem(DESMOSPROXYPRIVKEY))
    }

    getTxContext = (pk) => {
        return {
            chainId: 'testnet'/*Meteor.settings.public.chainId*/,
            bech32: bech32Address(pk, 'desmos'),
            accountNumber: 7/*this.state.currentUser.accountNumber*/,
            sequence: 0/*this.state.currentUser.sequence*/,
            denom: 'desmos'/*Coin.MintingDenom*/,
            pk: pk,
            path: [44, 118, 0, 0, 0],
            memo: ''
        }
    }

    getMessage = (pk, privKey) => {
        const txContext = this.getTxContext(pk);
        let txMsg = Ledger.createCreateSession(
            txContext,
            localStorage.getItem(CURRENTUSERADDR),
            localStorage.getItem(CURRENTUSERPUBKEY));


        const bytesToSign = Ledger.getBytesToSign(txMsg, {...txContext, accountNumber: 0, sequence: 0});
        this.setState({
            'rawMessage': JSON.stringify(txMsg),
            'bytesToSign': bytesToSign
        })

        //this.ledger.sign(bytesToSign).then((sig) => {
            let sig = 'whev'
            txMsg.value.msg[0].value.signature = sig.toString('base64');
            const wasmBytesToSign = Ledger.getBytesToSign(txMsg, {...txContext/*,accountNumber:0, chainId:""*/});
            this.setState({
                'ledgerSignedMessage': JSON.stringify(txMsg),
                wasmBytesToSign
            })
            let toSign = Buffer.from(wasmBytesToSign).toString('base64');
            console.log(toSign)
            console.log(privKey)
            signMessageWithKey(toSign, privKey)
            let signature = localStorage.getItem(DESMOSPROXYSIG)
            let buffer = Buffer.from(signature, 'base64')
            //buffer = buffer.slice(0, buffer.length - 1)
            Ledger.applySignature(txMsg, txContext, buffer.toString('base64'));
            this.setState({
                signature,
                'doubleSignedMessage': JSON.stringify(txMsg)
            })
        //})
    }

    handleInputChange = (e) => {
        let target = e.currentTarget;
        this.setState({[target.name]: target.value})
    }

    signMessageWithKey = () => {
        signMessageWithKey(this.state.message, this.state.privKey)
        this.setState({'signature': localStorage.getItem(DESMOSPROXYSIG)})
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
                <Input type="textarea" value={bech32Address(this.state.pubKey, 'desmos')}/>
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
            <div>
                <Input type="textarea" value={`
#### pubKey:
\`\`\`
${this.state.pubKey}
\`\`\`

#### bech32 Address:
\`\`\`
${bech32Address(this.state.pubKey, 'desmos')}
\`\`\`

#### privKey:
\`\`\`
${this.state.privKey}
\`\`\`

#### raw message:
\`\`\`json
${this.state.rawMessage}
\`\`\`

#### Bytes For Ledger To Sign
\`\`\`json
${this.state.bytesToSign}
\`\`\`

#### Ledger Signed Message
\`\`\`json
${this.state.ledgerSignedMessage}
\`\`\`

#### Bytes For WASM to Sign
\`\`\`json
${this.state.wasmBytesToSign}
\`\`\`

#### Final Message
\`\`\`json
${this.state.doubleSignedMessage}
\`\`\`
                    `}/>
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