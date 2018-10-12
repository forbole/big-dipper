import React, { Component } from 'react';
import { Badge, Row, Col } from 'reactstrap';
import List from './ListContainer.js';

export default class Proposals extends Component{
    constructor(props){
        super(props);
    }

    render() {
        return <div>
        <h1>Proposals <Badge color="primary">{Meteor.settings.public.chainId}</Badge></h1>
        <p className="lead">Here is a list of governance proposals.</p>
            <Row>
                <Col md={12}>
                    <List />
                </Col>
            </Row>
        </div>
    }

}