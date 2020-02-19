import React, { Component } from 'react';
import Signer from './signer.js';
import {Spinner, Row, Col, Container} from 'reactstrap';
import i18n from 'meteor/universe:i18n';
import numbro from "numbro";
import SignerHeader from "./SignerHeader";

const T = i18n.createComponent();
export default class SignersTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            signers: "",
            data: {},
            options: {}
        }
    }

    componentDidUpdate(prevProps){
        let signersArray = [];
        let signersObj = {};

        if (this.props.blocks != prevProps.blocks){
            if (this.props.blocks.length > 0 && this.props.validators.length > 0){
                for(let i = 0; i < this.props.validators.length; i++) {
                    let validator = this.props.validators[i]
                    signersObj[validator.address] = {
                        moniker: validator.description.moniker,
                        operatorAddress: validator.operator_address,
                        address: validator.address,
                        website: validator.description.website,
                        lastSeen: validator.lastSeen,
                        numSigned: 0
                    }
                }

                for(let j = 0; j < this.props.blocks.length; j++) {
                    let block = this.props.blocks[j]
                    for(let k = 0; k < block.validators.length; k++) {
                        if(signersObj[block.validators[k]] !== undefined) {
                            signersObj[block.validators[k]].numSigned++
                        }
                    }
                }

                for (const sig of Object.values(signersObj)) {
                    signersArray.push(sig)
                }

                let signers = signersArray.map((signer) => (<Signer key={signer.address} signer={signer} numBlocks={this.props.blocks.length}/>));
                this.setState(
                    {
                        signers: signers
                    }
                )
            }
        }
    }

    render() {
        if (this.props.loading) {
            return (
                <Row>
                    <Col><Spinner type="grow" color="primary" /></Col>
                </Row>
            )
        }
        else if (this.props.blocks.length > 0) {
            return (
                <Container fluid id="block-table">
                    <h2><T>signers.activeValidators</T></h2>
                    <SignerHeader />
                    {this.state.signers}
                </Container>
            )
        }
        else{
            return <Row><Col><T>blocks.noBlock</T></Col></Row>
        }
    }
}