import React, { Component } from 'react';
import { Badge, Container, Row, Col } from 'reactstrap';

export default class ValidatorRevoked extends Component{
    constructor(props){
        super(props);
    }

    render() {
        return <h1>ValidatorRevoked <Badge color="primary">{Meteor.settings.public.chainId}</Badge></h1>
    }

}