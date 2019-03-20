import React, { Component } from 'react';
import { Row, Col } from 'reactstrap';
import TwentyEighty from './TwentyEightyContainer.js';
import ThirtyFour from './ThirtyFourContainer.js';

export default class VotingPower extends Component{
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
                
            </div>
        }
}