import React, { Component } from 'react';
import { Card, CardHeader, CardBody, Container, Row, Col, Spinner } from 'reactstrap';
import numbro from 'numbro';
import Account from '../components/Account.jsx';
import { Mongo } from 'meteor/mongo';
import moment from 'moment';
import i18n from 'meteor/universe:i18n'; 
import Coin from '../../../both/utils/coins.js';

const T = i18n.createComponent();

export default class AccountRedelegations extends Component{
    constructor(props){
        super(props);
    }

    render(){
        let numRedelegations = this.props.redelegations.length;
        return <div>
          
            <h6>{(numRedelegations > 0 )? numRedelegations : <T>accounts.no</T>}<T>accounts.redelegations</T>{(numRedelegations>1)?<T>accounts.plural</T>:''}</h6>

            {(numRedelegations > 0)?<div className="list overflow-auto"> 
                <Container fluid>
                    <Row className="header text-nowrap d-none d-lg-flex">
                        <Col md={3}><i className="fas fa-at"></i> <span><T>accounts.redelegatedFrom</T></span></Col>
                        <Col md={3}><i className="fas fa-at"></i> <span><T>accounts.redelegatedTo</T></span></Col>
                        <Col md={6}>
                            <Row>
                                <Col md={6}><i className="fas fa-piggy-bank"></i> <span><T>accounts.shares</T></span></Col>
                                <Col md={6}><i className="fas fa-clock"></i> <span><T>accounts.mature</T></span></Col>
                            </Row>
                        </Col>
                    </Row>
                    {this.props.redelegations.map((r, i) =>
                        <Row key={i} className="delegation-info">
                            <Col md={3} className="text-nowrap overflow-auto"><Account address={r.validator_src_address} /></Col>
                            <Col md={3} className="text-nowrap overflow-auto"><Account address={r.validator_dst_address} /></Col>
                            <Col md={6}>{r.entries.map((entry,j) =>
                                <Row key={j}>
                                    <Col md={6}>
                                        {new Coin(entry.balance).toString(6)}
                                    </Col>
                                    <Col md={6}>
                                        {moment.utc(entry.completion_time).fromNow()}
                                    </Col>
                                </Row>
                            )}</Col>
                        </Row>
                    )}
                </Container>
            </div>:''}
        </div>
    }
}