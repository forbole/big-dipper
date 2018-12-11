import React, { Component } from 'react';
import { Badge, Container, Row, Col } from 'reactstrap';
import Validator from './Validator.js';

export default class ValidatorDetails extends Component{
    constructor(props){
        super(props);
    }

    render() {
        return <div>
        <h1>Validator Details <Badge color="primary">{Meteor.settings.public.chainId}</Badge></h1>
            <Row>
                <Col md={12}>
                    <Validator address={this.props.match.params.address} />
                </Col>
            </Row>
        </div>
    }

}