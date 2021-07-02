  
import React, { Component } from 'react';
import {Row, Col } from 'reactstrap';
import ChainStatus from './ChainStatusContainer.js';
import ChainInfo from '../components/ChainInfo.jsx'
import Consensus from './ConsensusContainer.js';
import TopValidators from './TopValidatorsContainer.js';
import Chart from './ChartContainer.js';
import { Helmet } from "react-helmet";

export default class Home extends Component{
    constructor(props){
        super(props);
    }

    render() {
        return <div id="home">
            <Helmet>
                <title>CUDOS Explorer</title>
                <meta name="description" content="The decentralized cloud computing network for everyone." />
            </Helmet>
            <ChainInfo/>
            <Consensus />
            <ChainStatus />
            <Row>
                <Col md={6}>
                    <TopValidators />
                </Col>
                <Col md={6}>
                    <Chart />
                </Col>
            </Row>
        </div>
    }

}