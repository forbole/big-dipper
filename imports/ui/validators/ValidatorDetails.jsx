import React, { Component } from 'react';
import { Badge, Container, Row, Col } from 'reactstrap';
import Validator from './Validator.js';

export default class ValidatorDetails extends Component{
    constructor(props){
        super(props);
    }

    render() {
        console.log(this.props);
        return <div>
        <h1>Validator Details <Badge color="primary">{Meteor.settings.public.chainId}</Badge></h1>
        {/* <p className="lead">Here is a list of active validators.</p> */}
            <Row>
                <Col md={12}>
                    <Validator address={this.props.match.params.address} />
                    {/* <List revoked={false}/> */}
                </Col>
            </Row>
        </div>
    }

}