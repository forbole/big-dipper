import React, { Component } from 'react';
import { Badge, Row, Col } from 'reactstrap';
import List from './ListContainer.js';

export default class ValidatorRevoked extends Component{
    constructor(props){
        super(props);
    }

    render() {
        return <div>
            <h1>Revoked Validator <Badge color="primary">{Meteor.settings.public.chainId}</Badge></h1>
            <p className="lead">These validators have been revoked. If you know any of them, please ask them to unrevoke.</p>
            <Row>
                <Col md={9}>
                    <List revoked={true}/>
                </Col>
                <Col md={3}>

                </Col>
            </Row>
        </div>
    }
}