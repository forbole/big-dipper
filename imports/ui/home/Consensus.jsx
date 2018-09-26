import React, { Component } from 'react';
import { Row, Col, Card, CardImg, CardText, CardBody,
    CardTitle, CardSubtitle, Button, Progress } from 'reactstrap';

export default class Consensus extends Component{
    constructor(props){
        super(props);
    }

    render(){
        if (this.props.loading){
            return <div>Loading</div>
        }
        else{
            return <Card className="status border-danger">
                <div className="card-header">Consensus State</div>
                <CardBody>
                <Row>
                    <Col md={3}><CardSubtitle>Height</CardSubtitle><span className="value">{this.props.consensus.votingHeight}</span></Col>
                    <Col md={9}><CardSubtitle>Voting Power</CardSubtitle><Progress animated value={this.props.consensus.votedPower} className="value">{this.props.consensus.votedPower}%</Progress></Col>
                </Row>
                </CardBody>
            </Card>;
        }
    }
}