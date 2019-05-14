import React, { Component } from 'react';
import { Badge, Row, Col } from 'reactstrap';
import ChainStatus from './ChainStatusContainer.js';
import Consensus from './ConsensusContainer.js';
import TopValidators from './TopValidatorsContainer.js';
import Chart from './ChartContainer.js';
import ChainStates from '../components/ChainStatesContainer.js'
import { Helmet } from "react-helmet";

export default class Home extends Component{
    constructor(props){
        super(props);
    }

    render() {
        return <div id="home">
            <Helmet>
                <title>The Big Dipper | Cosmos Explorer by Forbole</title>
                <meta name="description" content="The Big Dipper is always free and open. Anyone can use to monitor available Cosmos hub or zones, or port to your own chain built with Cosmos SDK. We welcome any supports to help us improve this project. (ATOM: cosmos1n67vdlaejpj3uzswr9qapeg76zlkusj5k875ma) (BTC: 1HrTuvS83VoUVA79wTifko69ziWTjEXzQS) (ETH: 0xec3AaC5023E0C9E2a76A223E4e312f275c76Cd77)" />
            </Helmet>
            <Row>
                <Col md={3} xs={12}><h1>{Meteor.settings.public.chainName}</h1></Col>
                <Col md={9} xs={12} className="text-md-right"><ChainStates /></Col>
            </Row>
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