import React, { Component } from 'react';
// import wasmExec from '/client/libs/wasm_exec.js';
import { Button, Input, Row, Col} from 'reactstrap';

import bech32 from "bech32";
import secp256k1 from "secp256k1";
import sha256 from "crypto-js/sha256"
import ripemd160 from "crypto-js/ripemd160"
import CryptoJS from "crypto-js"


export default class Magpie extends Component{
    constructor(props){
        super(props);
        this.state = {}
        /*wasmExec();
        const go = new Go();
        let mod, inst;
        WebAssembly.instantiateStreaming(fetch("/binary/main.wasm"), go.importObject).then(
            async result => {
                mod = result.module;
                inst = result.instance;
                await go.run(inst);
            }
        );*/
    }
    generateKey = () => {
        createKey();
        this.setState({
            pubKey: localStorage.getItem('pubKey'),
            privKey: localStorage.getItem('privKey')
        })
    }

    getBech32Pubkey = () => {
        if (this.state.pubKey) {
             return Meteor.call('pubkeyToBech32', this.state.pubKey, 'desmo');
        }
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
                {/*<Input type="textarea" value={this.getBech32Pubkey()}/>*/}
            </div>
            <div>
                <span>Private Key</span>
                <Input type="textarea" id="privKey" value={this.state.privKey}/>
            </div>
            <div>
                <Input name="message" onChange={this.handleInputChange}
                    placeholder="message" type="textarea"/>
            </div>
            <div>
                <Input type="textarea" value={this.state.signature}/>
            </div>
            <div>
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