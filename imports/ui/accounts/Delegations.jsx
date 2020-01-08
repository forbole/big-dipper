import React, { Component } from 'react';
import { Card, CardHeader, CardBody, Container, Row, Col, Spinner } from 'reactstrap';
import AccountTooltip from '../components/AccountTooltip.jsx';
import i18n from 'meteor/universe:i18n';
import Coin from '/both/utils/coins.js';


const T = i18n.createComponent();

export default class AccountDelegations extends Component{
    constructor(props){
        super(props);

    }


    render(){
        let numDelegations = this.props.delegations.length;
        
        return <Card>
            <CardHeader>{(numDelegations > 0)?numDelegations:<T>accounts.no</T>} <T>accounts.delegation</T>{(numDelegations>1)?<T>accounts.plural</T>:''}</CardHeader>
            {(numDelegations > 0)?<CardBody className="list overflow-auto">
                <Container fluid>
                    <Row className="header text-nowrap d-none d-lg-flex">
                        <Col xs={7} md={5}><i className="fas fa-at"></i> <span><T>accounts.validators</T></span></Col>

                        <Col xs={2} md={3}><i className="fas fa-wallet"></i> <span><T>{Coin.StakingDenomPlural}</T></span></Col>
                        <Col xs={3} md={4}><i className="fas fa-gift"></i> <span><T>common.rewards</T></span></Col>
                    </Row>
                    {this.props.delegations.sort((b, a) => (a.balance - b.balance)).map((d, i) => {
                        return <Row key={i} className="delegation-info">
                            <Col xs={7} md={5} className="text-nowrap overflow-auto"><AccountTooltip address={d.validator_address} /></Col>
                            <Col xs={2} md={3}>{new Coin(d.balance).stakeString()}</Col>
                            <Col xs={3} md={4}>{new Coin(this.props.reward[i]).toString(4)}</Col>                            
                        </Row>
                    })}
                </Container>
            </CardBody>:''}
        </Card>
    }
}