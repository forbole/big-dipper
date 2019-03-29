import React, { Component } from 'react';
import { Row, Col } from 'reactstrap';
import TwentyEighty from './TwentyEightyContainer.js';
import ThirtyFour from './ThirtyFourContainer.js';
import VotingPower from './VotingPowerContainer.js';

export default class Distribution extends Component{
    constructor(props){
        super(props);
    }

    render(){
        return <div id="voting-power-dist">
                <h1 className="d-none d-lg-block">Voting Power Distribution</h1>
                
                <Row>
                    <Col md={6}><TwentyEighty /></Col>
                    <Col md={6}><ThirtyFour /></Col>
                </Row>
                <Row>
                    <Col>
                        <VotingPower />
                    </Col>
                </Row>

            </div>
        }
}