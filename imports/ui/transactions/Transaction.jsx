import React, { Component } from 'react';
import { Container, Row, Col, Card, CardBody, Alert, Spinner } from 'reactstrap';
import { TxIcon } from '../components/Icons.jsx';
import Activities from '../components/Activities.jsx';
import CosmosErrors from '../components/CosmosErrors.jsx';
import { Link } from 'react-router-dom';
import { Markdown } from 'react-showdown';
import numbro from 'numbro';
import moment from 'moment';
import { Helmet } from 'react-helmet';
import i18n from 'meteor/universe:i18n';

const T = i18n.createComponent();
export default class Transaction extends Component{
    constructor(props){
        super(props);
        let showdown  = require('showdown');
        showdown.setFlavor('github');
    }

    render(){
        if (this.props.loading){
            return <Container id="transaction">
                <Spinner type="grow" color="primary" />
            </Container>
        }
        else{
            if (this.props.transactionExist){
                let tx = this.props.transaction;
                return <Container id="transaction">
                    <Helmet>
                        <title>Transaction {tx.hash} on Cosmos Hub | The Big Dipper</title>  
                        <meta name="description" content={"Details of transaction "+tx.hash} />
                    </Helmet>
                    <h4><T>transactions.transaction</T> {(!tx.result.Code)?<TxIcon valid />:<TxIcon />}</h4>
                    {(tx.code)?<Row><Col xs={{size:12, order:"last"}} className="error">
                        <Alert color="danger">
                            <CosmosErrors 
                                code={tx.result.Code}
                                logs={tx.result.Log}
                                gasWanted={tx.result.GasWanted}
                                gasUses={tx.result.GasUsed}
                            />
                        </Alert>
                    </Col></Row>:''}
                    <Card>
                        <div className="card-header"><T>common.information</T></div>
                        <CardBody>
                            <Row>
                                <Col md={4} className="label"><T>common.hash</T></Col>
                                <Col md={8} className="value text-nowrap address">{tx.hash}</Col>
                                <Col md={4} className="label"><T>common.height</T></Col>
                                <Col md={8} className="value"><Link to={"/blocks/"+tx.height}>{numbro(tx.height).format("0,0")}</Link> ({moment.utc(tx.block().time).format("D MMM YYYY, h:mm:ssa z")})</Col>
                                <Col md={4} className="label"><T>transactions.fee</T></Col>
                                <Col md={8} className="value">{tx.tx.value.fee.amount?tx.tx.value.fee.amount.map((fee,i) => {
                                    return <span className="text-nowrap" key={i}>{numbro(fee.amount*tx.result.GasUsed/tx.result.GasWanted/Meteor.settings.public.stakingFraction).format("0,0.0000")} {Meteor.settings.public.stakingDenom}</span>
                                }):<span>No fee</span>}</Col>
                                <Col md={4} className="label"><T>transactions.gasUsedWanted</T></Col>
                                <Col md={8} className="value">{numbro(tx.result.GasUsed).format("0,0")} / {numbro(tx.result.GasWanted).format("0,0")}</Col>
                                <Col md={4} className="label"><T>transactions.memo</T></Col>
                                <Col md={8} className="value"><Markdown markup={ tx.tx.value.memo } /></Col>
                            </Row>
                        </CardBody>
                    </Card>
                    <Card>
                        <div className="card-header"><T>transactions.activities</T></div>
                    </Card>
                    {(tx.tx.value.msg && tx.tx.value.msg.length >0)?tx.tx.value.msg.map((msg,i) => {
                        return <Card body key={i}><Activities msg={msg} invalid={(!!tx.result.Code)} tags={tx.result.Tags} /></Card>
                    }):''}
                </Container>
            }
            else{
                return <Container id="transaction"><div><T>transactions.noTxFound</T></div></Container>
            }
        }
    }
}