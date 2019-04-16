import React, { Component } from 'react';
import { Container, Row, Col, Card, CardBody, Alert, Spinner } from 'reactstrap';
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
                console.log(this.props.block);
                let block = this.props.block;
                return <Container id="block">
                    <h4>Block {numeral(block.height).format("0,0")}</h4>
                    <Card>
                        <div className="card-header">Information</div>
                        <CardBody>
                            {/* <Row>
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

                            </Row> */}
                        </CardBody>
                    </Card>
                    <Card>
                        <div className="card-header">Transactions</div>
                        <CardBody>
                        </CardBody>
                    </Card>
                </Container>
            }
            else{
                return <Container id="block"><div>No such block found.</div></Container>
            }
        }
    }
}