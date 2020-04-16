
import React, { Component } from 'react';
import { TabContent, TabPane, Nav, NavItem, NavLink, Row, Col, Card, CardHeader, CardBody } from 'reactstrap';
import classnames from 'classnames';
import numbro from 'numbro';
import { TransactionRow } from './TransactionRow.jsx';
import i18n from 'meteor/universe:i18n';
import PropTypes from 'prop-types';

const T = i18n.createComponent();
export default class TransactionTabs extends Component{
    constructor(props){
        super(props);
        this.state ={
            activeTab: 'tx-transfer',
            transferTxs: {},
            cdpTxs: {},
            swapTxs: {},
            priceTxs: {},
            stakingTxs: {},
            distributionTxs: {},
            governanceTxs: {},
            slashingTxs: {}
        }
    }

    toggle = (tab) => {
        if (this.state.activeTab !== tab) {
            this.setState({
                activeTab: tab
            });
        }
    }

    componentDidUpdate(prevProps){
        if (this.props != prevProps){
            this.setState({
                transferTxs: this.props.transferTxs,
                cdpTxs: this.props.cdpTxs,
                swapTxs: this.props.swapTxs,
                priceTxs: this.props.priceTxs,
                stakingTxs: this.props.stakingTxs,
                distributionTxs: this.props.distributionTxs,
                governanceTxs: this.props.governanceTxs,
                slashingTxs: this.props.slashingTxs
            })    
        }
    }

    render(){
        return <Card>
            <CardHeader><T>transactions.transactions</T> <small>(<T>common.last</T> 100)</small></CardHeader>
            <CardBody>
                <Nav tabs className="tx-types">
                    <NavItem>
                        <NavLink
                            className={classnames({ active: this.state.activeTab === 'tx-transfer' })}
                            onClick={() => { this.toggle('tx-transfer'); }}
                        >
                            <T>transactions.transfer</T> ({numbro(this.state.transferTxs.length).format("0,0")})
                        </NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink
                            className={classnames({ active: this.state.activeTab === 'tx-cdp' })}
                            onClick={() => { this.toggle('tx-cdp'); }}
                        >
                            <T>transactions.cdp</T> ({numbro(this.state.cdpTxs.length).format("0,0")})
                        </NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink
                            className={classnames({ active: this.state.activeTab === 'tx-swap' })}
                            onClick={() => { this.toggle('tx-swap'); }}
                        >
                            <T>transactions.swap</T> ({numbro(this.state.swapTxs.length).format("0,0")})
                        </NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink
                            className={classnames({ active: this.state.activeTab === 'tx-price' })}
                            onClick={() => { this.toggle('tx-price'); }}
                        >
                            <T>transactions.priceFeed</T> ({numbro(this.state.priceTxs.length).format("0,0")})
                        </NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink
                            className={classnames({ active: this.state.activeTab === 'tx-staking' })}
                            onClick={() => { this.toggle('tx-staking'); }}
                        >
                            <T>transactions.staking</T> ({numbro(this.state.stakingTxs.length).format("0,0")})
                        </NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink
                            className={classnames({ active: this.state.activeTab === 'tx-distr' })}
                            onClick={() => { this.toggle('tx-distr'); }}
                        >
                            <T>transactions.distribution</T> ({numbro(this.state.distributionTxs.length).format("0,0")})
                        </NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink
                            className={classnames({ active: this.state.activeTab === 'tx-gov' })}
                            onClick={() => { this.toggle('tx-gov'); }}
                        >
                            <T>transactions.governance</T> ({numbro(this.state.governanceTxs.length).format("0,0")})
                        </NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink
                            className={classnames({ active: this.state.activeTab === 'tx-slashing' })}
                            onClick={() => { this.toggle('tx-slashing'); }}
                        >
                            <T>transactions.slashing</T> ({numbro(this.state.slashingTxs.length).format("0,0")})
                        </NavLink>
                    </NavItem>
                </Nav>
                <TabContent activeTab={this.state.activeTab}>
                    <TabPane tabId="tx-transfer">
                        <Row>
                            <Col>
                                {(this.state.transferTxs.length > 0)?this.state.transferTxs.map((tx, i) => {
                                    return <TransactionRow 
                                        key={i} 
                                        index={i} 
                                        tx={tx}
                                        blockList 
                                    />
                                }):''}
                            </Col>
                        </Row>
                    </TabPane>
                    <TabPane tabId="tx-cdp">
                        <Row>
                            <Col>
                                {(this.state.cdpTxs.length > 0)?this.state.cdpTxs.map((tx, i) => {
                                    return <TransactionRow 
                                        key={i} 
                                        index={i} 
                                        tx={tx}
                                        blockList 
                                    />
                                }):''}
                            </Col>
                        </Row>
                    </TabPane>
                    <TabPane tabId="tx-swap">
                        <Row>
                            <Col>
                                {(this.state.swapTxs.length > 0)?this.state.swapTxs.map((tx, i) => {
                                    return <TransactionRow 
                                        key={i} 
                                        index={i} 
                                        tx={tx}
                                        blockList 
                                    />
                                }):''}
                            </Col>
                        </Row>
                    </TabPane>
                    <TabPane tabId="tx-staking">
                        <Row>
                            <Col>
                                {(this.state.stakingTxs.length > 0)?this.state.stakingTxs.map((tx, i) => {
                                    return <TransactionRow 
                                        key={i} 
                                        index={i} 
                                        tx={tx} 
                                        blockList
                                    />
                                }):''}
                            </Col>
                        </Row>
                    </TabPane>
                    <TabPane tabId="tx-distr">
                        <Row>
                            <Col>
                                {(this.state.distributionTxs.length > 0)?this.state.distributionTxs.map((tx, i) => {
                                    return <TransactionRow 
                                        key={i} 
                                        index={i} 
                                        tx={tx} 
                                        blockList
                                    />
                                }):''}
                            </Col>
                        </Row>
                    </TabPane>
                    <TabPane tabId="tx-gov">
                        <Row>
                            <Col>
                                {(this.state.governanceTxs.length > 0)?this.state.governanceTxs.map((tx, i) => {
                                    return <TransactionRow 
                                        key={i} 
                                        index={i} 
                                        tx={tx} 
                                        blockList
                                    />
                                }):''}
                            </Col>
                        </Row>
                    </TabPane>
                    <TabPane tabId="tx-slashing">
                        <Row>
                            <Col>
                                {(this.state.slashingTxs.length > 0)?this.state.slashingTxs.map((tx, i) => {
                                    return <TransactionRow 
                                        key={i} 
                                        index={i} 
                                        tx={tx} 
                                        blockList
                                    />
                                }):''}
                            </Col>
                        </Row>
                    </TabPane>
                </TabContent>
            </CardBody>
        </Card>
    }
}

TransactionTabs.propTypes = {
    transferTxs: PropTypes.oneOfType([
        PropTypes.array.isRequired,
        PropTypes.object.isRequired,
    ]),
    cdpTxs: PropTypes.oneOfType([
        PropTypes.array.isRequired,
        PropTypes.object.isRequired,
    ]),
    swapTxs: PropTypes.oneOfType([
        PropTypes.array.isRequired,
        PropTypes.object.isRequired,
    ]),
    priceTxs: PropTypes.oneOfType([
        PropTypes.array.isRequired,
        PropTypes.object.isRequired,
    ]),
    stakingTxs: PropTypes.oneOfType([
        PropTypes.array.isRequired,
        PropTypes.object.isRequired,
    ]),
    distributionTxs: PropTypes.oneOfType([
        PropTypes.array.isRequired,
        PropTypes.object.isRequired,
    ]),
    governanceTxs: PropTypes.oneOfType([
        PropTypes.array.isRequired,
        PropTypes.object.isRequired,
    ]),
    slashingTxs: PropTypes.oneOfType([
        PropTypes.array.isRequired,
        PropTypes.object.isRequired,
    ])
}