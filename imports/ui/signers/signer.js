import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Row, Col } from 'reactstrap';
import numbro from 'numbro';

export default class Signer extends Component {
    constructor(props){
        super(props);
    }

    render() {
        if (this.props.signer){
            let missed = numbro(100.0 - ((this.props.signer.numSigned / this.props.numBlocks) * 100)).format('0.000')
            let lastSeen = this.props.signer.lastSeen.toLocaleString('en-GB', { timeZone: 'UTC' })
            return <Row className="block-info">
                <Col xs={1}><Link to={"/validator/"+this.props.signer.address}>{this.props.signer.moniker}</Link></Col>
                <Col xs={4}>{this.props.signer.operatorAddress}</Col>
                <Col xs={2}><a href={addhttp(this.props.signer.website)} target="_blank">{this.props.signer.website}</a></Col>
                <Col xs={1}>{numbro(this.props.signer.numSigned).format('0,0')}</Col>
                <Col xs={1}>{missed}% </Col>
                <Col xs={1}><Link to={"/blocks/"+this.props.signer.lastSigned}>{numbro(this.props.signer.lastSigned).format('0,0')}</Link></Col>
                <Col xs={2}>{lastSeen}</Col>
            </Row>
        }
        else{
            return <div className="blockrow"></div>
        }
    }
}