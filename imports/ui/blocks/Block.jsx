import React, { Component } from 'react';
import { Container, Row, Col, Card, CardBody, Alert, Spinner } from 'reactstrap';
import { TxIcon } from '../components/Icons.jsx';
import Activities from '../components/Activities.jsx';
import CosmosErrors from '../components/CosmosErrors.jsx';
import { Link } from 'react-router-dom';
import numeral from 'numeral';
import moment from 'moment';
export default class Block extends Component{
    constructor(props){
        super(props);
    }

    render(){
        if (this.props.loading){
            return <Container id="block">
                <Spinner type="grow" color="primary" />
            </Container>
        }
        else{
            if (this.props.blockExist){
                // console.log(this.props.transaction);
                let tx = this.props.transaction;
                return <Container id="block">
                    <h4>Block </h4>
                </Container>
            }
            else{
                return <Container id="block"><div>No such block found.</div></Container>
            }
        }
    }
}