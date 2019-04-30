
import React, { Component } from 'react';
import { TabContent, TabPane, Nav, NavItem, NavLink, Row, Col, Card, CardHeader, CardBody } from 'reactstrap';
import classnames from 'classnames';
import numbro from 'numbro';
import { TransactionRow } from './TransactionRow.jsx';

export default class TransactionTabs extends Component{
    constructor(props){
        super(props);
        this.state ={
            activeTab: 'tx-transfer',
            transferTxs: {},
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
                stakingTxs: this.props.stakingTxs,
                distributionTxs: this.props.distributionTxs,
                governanceTxs: this.props.governanceTxs,
                slashingTxs: this.props.slashingTxs
            })    
        }
    }

    render(){
        return <Card>
            <CardHeader>Transactions</CardHeader>
            <CardBody>
                <Nav tabs className="tx-types">
                    <NavItem>
                        <NavLink
                        className={classnames({ active: this.state.activeTab === 'tx-transfer' })}
                        onClick={() => { this.toggle('tx-transfer'); }}
                        >
                        Transfer ({numbro(this.state.transferTxs.length).format("0,0")})
                        </NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink
                        className={classnames({ active: this.state.activeTab === 'tx-staking' })}
                        onClick={() => { this.toggle('tx-staking'); }}
                        >
                        Staking ({numbro(this.state.stakingTxs.length).format("0,0")})
                        </NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink
                        className={classnames({ active: this.state.activeTab === 'tx-distr' })}
                        onClick={() => { this.toggle('tx-distr'); }}
                        >
                        Distribution ({numbro(this.state.distributionTxs.length).format("0,0")})
                        </NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink
                        className={classnames({ active: this.state.activeTab === 'tx-gov' })}
                        onClick={() => { this.toggle('tx-gov'); }}
                        >
                        Governance ({numbro(this.state.governanceTxs.length).format("0,0")})
                        </NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink
                        className={classnames({ active: this.state.activeTab === 'tx-slashing' })}
                        onClick={() => { this.toggle('tx-slashing'); }}
                        >
                        Slashing ({numbro(this.state.slashingTxs.length).format("0,0")})
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
                    