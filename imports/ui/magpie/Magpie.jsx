import React, { Component } from 'react';
// import wasmExec from '/client/libs/wasm_exec.js';
import { Button, Input } from 'reactstrap';

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

    render(){
        return <div>
            <Button color="primary" onClick={this.generateKey}>Create Key</Button>

            <div>
                <span>Public Key</span>
                <Input type="textarea" id="pubKey" value={this.state.pubKey}/>
            </div>
            <div>
                <span>Private Key</span>
                <Input type="textarea" id="privKey" value={this.state.privKey}/>
            </div>
        </div>
    }
}