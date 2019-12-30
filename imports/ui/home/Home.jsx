  
import React, { Component } from 'react';
import {Row, Col } from 'reactstrap';
import ChainStatus from './ChainStatusContainer.js';
import ChainInfo from '../components/ChainInfo.jsx'
import Consensus from './ConsensusContainer.js';
import LatestMessages from '../components/LatestMessagesContainer.js'
import { Helmet } from "react-helmet";

export default class Home extends Component{
    constructor(props){
        super(props);
    }

    render() {
        return <div id="home">
            <Helmet>
                <title>The Big Dipper | Cosmos Explorer by Forbole</title>
                <meta name="description" content="Cosmos is a decentralized network of independent parallel blockchains, each powered by BFT consensus algorithms like Tendermint consensus." />
            </Helmet>
            <Row>
                <Col md={3} xs={12}><h1>{Meteor.settings.public.chainName}</h1></Col>
                {/* <Col md={9} xs={12} className="text-md-right"><ChainStates /></Col> */}
            </Row>
            <Consensus />
            <ChainStatus />
            <Row>
                <Col>
                    <LatestMessages />
                </Col>    
            </Row>
        </div>
    }

}