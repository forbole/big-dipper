import React, { Component } from 'react';
import { Container, Row, Col, Card, CardBody, Alert } from 'reactstrap';
import { TxIcon } from '../components/Icons.jsx';
import Activities from '../components/Activities.jsx';
import CosmosErrors from '../components/CosmosErrors.jsx';
import { Link } from 'react-router-dom';
import numeral from 'numeral';
import moment from 'moment';
export default class Transaction extends Component{
    constructor(props){
        super(props);
    }

    render(){
        if (this.props.loading){
            return <Container id="transaction">
                <div>Loading...</div>
            </Container>
        }
        else{
            if (this.props.transactionExist){
                console.log(this.props.transaction);
                let tx = this.props.transaction;
                return <Container id="transaction">
                    <h4>Transaction {(!tx.code)?<TxIcon valid />:<TxIcon />}</h4>
                    {(tx.code)?<Row><Col xs={{size:12, order:"last"}} className="error">
                        <Alert color="danger">
                            <CosmosErrors 
                                code={tx.code}
                                logs={tx.logs}
                                gasWanted={tx.gas_wanted}
                                gasUses={tx.gas_used}
                            />
                        </Alert>
                    </Col></Row>:''}
                    <Card>
                        <div className="card-header">Information</div>
                        <CardBody>
                            <Row>
                                <Col md={4} className="label">Hash</Col>
                                <Col md={8} className="value text-nowrap address">{tx.txhash}</Col>
                                <Col md={4} className="label">Height</Col>
                                <Col md={8} className="value"><Link to="#">{numeral(tx.height).format("0,0")}</Link> ({moment.utc(tx.block().time).format("D MMM YYYY, h:mm:ssa z")})</Col>
                                <Col md={4} className="label">Fee</Col>
                                <Col md={8} className="value">{tx.tx.value.fee.amount?tx.tx.value.fee.amount.map((fee,i) => {
                                        return <span className="text-nowrap" key={i}>{numeral(fee.amount).format(0,0)} {fee.denom}</span>
                                    }):<span>No fee</span>}</Col>
                                <Col md={4} className="label">Gas (used / wanted)</Col>
                                <Col md={8} className="value">{numeral(tx.gas_used).format("0,0")} / {numeral(tx.gas_wanted).format("0,0")}</Col>

                            </Row>
                        </CardBody>
                    </Card>
                    <Card>
                        <div className="card-header">Activities</div>
                        </Card>
                        {(tx.tx.value.msg && tx.tx.value.msg.length >0)?tx.tx.value.msg.map((msg,i) => {
            return <Card body key={i}><Activities msg={msg} invalid={(!!tx.code)} tags={tx.tags} /></Card>
        }):''}
                </Container>
            }
            else{
                return <Container id="transaction"><div>No such transaction found.</div></Container>
            }
        }
    }
}