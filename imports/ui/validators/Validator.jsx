import React, { Component } from 'react';
import { Badge, Container, Row, Col } from 'reactstrap';

export default class Validator extends Component{
    constructor(props){
        super(props);
    }

    render() {
        console.log(this.props);
        if (this.props.loading){
            return <div>Loading</div>
        }
        else{
            return <Row>
                <Col md={4}>
                    {/* <img src="" */}
                </Col>
                <Col md={8}>

                </Col>
                {this.props.address}
            </Row>
        }
    }

}