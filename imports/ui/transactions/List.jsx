import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, UncontrolledTooltip } from 'reactstrap';
import { TxIcon } from '../components/Icons.jsx';
import { MsgType } from '../components/MsgType.jsx';
import moment from 'moment';
import numeral from 'numeral';

const TransactionRow = (props) => {
    console.log(props.tx);
    let tx = props.tx;
    moment.relativeTimeThreshold('ss', 3);
    return <Row className="tx-info">
        <Col xs={9} lg={7}>{(tx.tx.value.msg && tx.tx.value.msg.length >0)?tx.tx.value.msg.map((msg,i) => {
            return <div><MsgType key={i} type={msg.type}/></div>
        }):''}</Col>
        <Col xs={3} lg={{size:1,order:"last"}} className="text-truncate"><Link to="#">{tx.txhash}</Link></Col>
        <Col xs={6} md={9} lg={{size:2,order:"last"}}>{tx.block()?moment.utc(tx.block().time).fromNow():''}</Col>
        <Col xs={4} md={2} lg={1}><Link to="#">{numeral(tx.height).format(0,0)}</Link></Col>
        <Col xs={2} md={1}>{(!tx.code)?<TxIcon valid />:<TxIcon />}</Col>
        <Col xs={12} lg={2}>{tx.tx.value.fee.amount?tx.tx.value.fee.amount.map((fee,i) => {
            return <p>{numeral(fee.amount).format(0,0)} {fee.denom}</p>
        }):'No fee'}</Col>
    </Row>
}

export default class Transactions extends Component{
    constructor(props){
        super(props);
        this.state = {
            txs: ""
        }
    }

    componentDidUpdate(prevProps){
        if (this.props != prevProps){
            if (this.props.transactions.length > 0){
                this.setState({
                    txs: this.props.transactions.map((tx, i) => {
                        return <TransactionRow 
                            key={i} 
                            index={i} 
                            tx={tx} 
                        />
                    })
                })    
            }
        }
    }

    render(){
        if (this.props.loading){
            return <div>Loading...</div>;
        }
        else if (!this.props.transactionsExist){
            return <div>No transaction found.</div>
        }
        else{
            return <div className="transactions-list">
                <Row className="header text-nowrap d-none d-md-flex">
                    <Col xs={9} lg={7}><i className="material-icons">message</i> <span className="d-none d-md-inline-block">Activities</span></Col>
                    <Col xs={3} lg={{size:1,order:"last"}}><i className="fas fa-hashtag"></i> <span className="d-none d-md-inline-block">Tx Hash</span></Col>
                    <Col xs={6} md={9} lg={{size:2,order:"last"}}><i className="material-icons">schedule</i> <span className="d-none d-md-inline-block">Age</span></Col>
                    <Col xs={4} md={2} lg={1}><i className="fas fa-database"></i> <span className="d-none d-md-inline-block">Height</span></Col>
                    <Col xs={2} md={1} className="text-nowrap"><i className="material-icons">check_circle</i> <span className="d-none d-lg-inline-block">Valid</span></Col>
                    <Col xs={12} lg={2}><i className="material-icons">monetization_on</i> <span className="d-none d-md-inline-block">Fee</span></Col>
                </Row>
                {this.state.txs}
            </div>
        }
    }
}