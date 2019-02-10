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
    return <Row className="tx-info">
        <Col xs={4} md={2} lg={1}><Link to="#">{numeral(tx.height).format(0,0)}</Link></Col>
        <Col xs={6} md={2} lg={4} className="text-truncate"><Link to="#">{tx.txhash}</Link></Col>
        <Col xs={{size:2}} md={{size:2, order:"last"}} lg={1}>{(!tx.code)?<TxIcon valid />:<TxIcon />}</Col>
        <Col xs={{order:11}} md={{size:6}}>{(tx.tx.value.msg && tx.tx.value.msg.length >0)?tx.tx.value.msg.map((msg,i) => {
            return <span key={i} >
                <span id={"tx-"+tx.txhash+"-"+i}>
                    <MsgType type={msg.type}/>
                </span>
                <UncontrolledTooltip placement="top" target={"tx-"+tx.txhash+"-"+i}>
                    {JSON.stringify(msg.value)}
                </UncontrolledTooltip>
            </span>
        }):''}</Col>
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
            return <div className="transactions-list">{this.state.txs}</div>
        }
    }
}