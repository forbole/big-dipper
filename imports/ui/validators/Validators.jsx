import React, { Component } from 'react';
import { Badge, Container, Row, Col } from 'reactstrap';

export default class Validators extends Component{
    constructor(props){
        super(props);
    }

    render() {
        return <h1>Validators <Badge color="primary">{Meteor.settings.public.chainId}</Badge></h1>
    }

}