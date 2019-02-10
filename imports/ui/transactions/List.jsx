import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Row, Col } from 'reactstrap';
import { TxIcon } from '../components/Icons.jsx';
import Activities from '../components/Activities.jsx';
import TimeAgo from '../components/TimeAgo.jsx';
import numeral from 'numeral';

const TransactionRow = (props) => {
    let tx = props.tx;
    // console.log(tx);
    return <Row className="tx-info">
        <Col xs={9} lg={7} className="activity">{(tx.tx.value.msg && tx.tx.value.msg.length >0)?tx.tx.value.msg.map((msg,i) => {
            return <div key={i}><Activities msg={msg}/></div>
        }):''}</Col>
        <Col xs={3} lg={{size:1,order:"last"}} className="text-truncate"><Link to="#">{tx.txhash}</Link></Col>
        <Col xs={6} md={9} lg={{size:2,order:"last"}}><i className="material-icons">schedule</i> <span>{tx.block()?<TimeAgo time={tx.block().time} />:''}</span></Col>
        <Col xs={4} md={2} lg={1}><i className="fas fa-database d-lg-none"></i> <Link to="#">{numeral(tx.height).format(0,0)}</Link></Col>
        <Col xs={2} md={1}>{(!tx.code)?<TxIcon valid />:<TxIcon />}</Col>
        <Col xs={12} lg={2}><i className="material-icons d-lg-none">monetization_on</i> <span>{tx.tx.value.fee.amount?tx.tx.value.fee.amount.map((fee,i) => {
            return <p>{numeral(fee.amount).format(0,0)} {fee.denom}</p>
        }):'No fee'}</span></Col>
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
                <Row className="header text-nowrap d-none d-lg-flex">
                    <Col xs={9} lg={7}><i className="material-icons">message</i> <span className="d-none d-md-inline-block">Activities</span></Col>
                    <Col xs={3} lg={{size:1,order:"last"}}><i className="fas fa-hashtag"></i> <span className="d-none d-md-inline-block">Tx Hash</span></Col>
                    <Col xs={4} md={2} lg={1}><i className="fas fa-database"></i> <span className="d-none d-md-inline-block">Height</span></Col>
                    <Col xs={2} md={1} className="text-nowrap"><i className="material-icons">check_circle</i> <span className="d-none d-lg-inline-block">Valid</span></Col>
                    <Col xs={12} lg={2}><i className="material-icons">monetization_on</i> <span className="d-none d-md-inline-block">Fee</span></Col>
                </Row>
                {this.state.txs}
            </div>
        }
    }
}