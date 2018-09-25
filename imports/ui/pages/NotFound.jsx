import React, { Component } from 'react';
import { Container, Row, Col } from 'reactstrap';

export default class NotFound extends Component{
    constructor(props){
        super(props);
    }

    render() {
        return <Container className="not-found">
            <h1>Your page cannot be found.</h1>
            <i className="material-icons">block</i>
        </Container>
    }

}