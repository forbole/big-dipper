/* eslint-disable camelcase */

import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Card, Alert, UncontrolledPopover, PopoverHeader, PopoverBody } from 'reactstrap';
import { TxIcon } from '../components/Icons.jsx';
import Activities from '../components/Activities.jsx';
import CosmosErrors from '../components/CosmosErrors.jsx';
import TimeAgo from '../components/TimeAgo.jsx';
import numbro from 'numbro';
import Coin from '/both/utils/coins.js'
import SentryBoundary from '../components/SentryBoundary.jsx';
import { Markdown } from 'react-showdown';

let showdown  = require('showdown');
showdown.setFlavor('github');

export const TransactionRow = (props) => {
    let tx = props.tx;
    let homepage = window?.location?.pathname === '/' ? true : false;

    return <SentryBoundary><Row className={(tx.code)?"tx-info w-40 invalid":"tx-info w-40"}>
        <Col xs={12} lg={homepage ? 5 : 7} className="activity" >{(tx?.tx?.body?.messages && tx?.tx?.body?.messages.length >0)?tx?.tx?.body?.messages.map((msg,i) => {
            return <Card body key={i}><Activities msg={msg} id={props.index} invalid={(!!tx.tx_response.code)} events={(tx.tx_response.logs && tx.tx_response.logs[i]) ? tx.tx_response.logs[i].events : null} showDetails={false}/></Card>
        }):''}</Col>
        {!homepage ? <Col xs={(!props.blockList)?{size:6,order:"last"}:{size:12,order:"last"}} md={(!props.blockList)?{size:3, order: "last"}:{size:7, order: "last"}} lg={(!props.blockList)?{size:1,order:"last"}:{size:2,order:"last"}} className="text-truncate"><i className="fas fa-hashtag d-lg-none"></i> <Link to={"/transactions/"+tx.txhash}>{tx.txhash}</Link></Col> : 
            <Col xs={(!props.blockList)?{size:6,order:"last"}:{size:12,order:"last"}} md={(!props.blockList)?{size:3, order: "last"}:{size:7, order: "last"}} lg={{size:2,order:"last"}} className="text-truncate ml-n4"><i className="fas fa-hashtag d-lg-none"></i> <Link to={"/transactions/"+tx.txhash}>{tx.txhash}</Link></Col>}
        <Col xs={6} md={9} lg={{size:2,order:"last"}} className="text-nowrap"><i className="material-icons">schedule</i> <span>{tx.block()?<TimeAgo time={tx.block().time} />:''}</span>{(tx?.tx?.body?.memo && tx?.tx?.body?.memo != "")?<span>
            <i className="material-icons ml-2 memo-button" id={"memo-"+tx.txhash}>message</i>
            <UncontrolledPopover trigger="legacy" placement="top-start" target={"memo-"+tx.txhash}>
                <PopoverBody><Markdown markup={tx.tx.body.memo} /></PopoverBody>
            </UncontrolledPopover>
        </span>:""}</Col>
        {(!props.blockList) ? <Col xs={4} md={2} lg={!homepage ? 1 : 2}><i className="fas fa-database d-lg-none"></i> <Link to={"/blocks/"+tx.height}>{numbro(tx.height).format("0,0")}</Link></Col>:''}
        <Col xs={(!props.blockList)?2:4} md={1}>{(!tx.code)?<TxIcon valid />:<TxIcon />}</Col> 
        {!homepage ? <Col xs={(!props.blockList)?6:8} md={(!props.blockList)?9:4} lg={2} className="fee"><i className="material-icons d-lg-none">monetization_on</i> {(tx?.tx?.auth_info?.fee?.amount.length > 0)?tx?.tx?.auth_info?.fee?.amount.map((fee,i) => {
            return <span className="text-nowrap" key={i}>{(new Coin(parseFloat(fee.amount), (fee)?fee.denom:null)).toString(6)}</span>
        }) : <span>No fee</span>}</Col> : <Col xs={(!props.blockList) ? 6 : 8} md={(!props.blockList) ? 9 : 4} lg={2} className="fee d-sm-none"><i className="material-icons d-lg-none">monetization_on</i> {(tx?.tx?.auth_info?.fee?.amount.length > 0) ? tx?.tx?.auth_info?.fee?.amount.map((fee, i) => {
            return <span className="text-nowrap" key={i}>{(new Coin(parseFloat(fee.amount), (fee) ? fee.denom : null)).toString(6)}</span>
        }) : <span>No fee</span>}</Col> } 
        {(tx.code)?<Col xs={{size:12, order:"last"}} className="error">
            <Alert color="danger">
                <CosmosErrors
                    code={tx.code}
                    codespace={tx.codespace}
                    log={tx.raw_log}
                />
            </Alert>
        </Col>:''}
    </Row></SentryBoundary>
}
