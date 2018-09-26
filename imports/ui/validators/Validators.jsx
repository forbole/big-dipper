import React, { Component } from 'react';
import { Badge, Container, Row, Col } from 'reactstrap';
import List from './ListContainer.js';

export default class Validators extends Component{
    constructor(props){
        super(props);
    }

    render() {
        return <div>
        <h1>Validators <Badge color="primary">{Meteor.settings.public.chainId}</Badge></h1>
        <p className="lead">Here is a list of active validators.</p>
            <Row>
                <Col md={9}>
                    <List revoked={false}/>
                </Col>
                <Col md={3}>

                </Col>
            </Row>
        </div>
    }

}