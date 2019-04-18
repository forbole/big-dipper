import React, { Component } from 'react';
import { Container, TabContent, TabPane, Nav, NavItem, NavLink, Button, CardTitle, CardText, Row, Col, Card, CardBody, Alert, Spinner } from 'reactstrap';
import { Link,  } from 'react-router-dom';
import numeral from 'numeral';
import moment from 'moment';
import Avatar from '../components/Avatar.jsx';
import classnames from 'classnames';
import { TransactionRow } from '../transactions/TransactionRow.jsx';
export default class Block extends Component{
    constructor(props){
        super(props);

        this.toggle = this.toggle.bind(this);
        this.state = {
            activeTab: 'tx-transfer',
            transferTxs: {},
            stakingTxs: {},
            distributionTxs: {},
            governanceTxs: {},
            slashingTxs: {},
        };
    }

    toggle(tab) {
        if (this.state.activeTab !== tab) {
          this.setState({
            activeTab: tab
          });
        }
    }

    componentDidUpdate(prevProps){
        if (this.props != prevProps){
            if (this.props.transactionsExist){
                // console.log("have txs.");
                this.setState({
                    transferTxs: this.props.transferTxs,
                    stakingTxs: this.props.stakingTxs,
                    distributionTxs: this.props.distributionTxs,
                    governanceTxs: this.props.governanceTxs,
                    slashingTxs: this.props.slashingTxs
                })
            }
        }
    }

    render(){
        if (this.props.loading){
            return <Container id="block">
                <Spinner type="grow" color="primary" />
            </Container>
        }
        else{
            if (this.props.blockExist){
                // console.log(this.props.block);
                let block = this.props.block;
                let proposer = block.proposer();
                let moniker = proposer?proposer.description.moniker:'';
                let identity = proposer?proposer.description.identity:'';

                return <Container id="block">
                    <h4>Block {numeral(block.height).format("0,0")}</h4>
                    <Card>
                        <div className="card-header">Information</div>
                        <CardBody>
                            <Row>
                                <Col md={4} className="label">Hash</Col>
                                <Col md={8} className="value text-nowrap address">{block.hash}</Col>
                                <Col md={4} className="label">Proposer</Col>
                                <Col md={8} className="value"><Link to={"/validator/"+((proposer)?proposer.operator_address:'')}><Avatar moniker={moniker} identity={identity} address={block.proposerAddress} list={true} /> {moniker}</Link></Col>
                                <Col md={4} className="label">No. of Transactions</Col>
                                <Col md={8} className="value">{numeral(block.transNum).format("0,0")}</Col>
                                <Col md={4} className="label">Time</Col>
                                <Col md={8} className="value">{moment.utc(block.time).format("D MMM YYYY, h:mm:ssa z")} ({moment(block.time).fromNow()})</Col>
                            </Row>
                        </CardBody>
                    </Card>
                    <Card>
                        <div className="card-header">Transactions</div>
                        <CardBody>
                            <Nav tabs className="tx-types">
                                <NavItem>
                                    <NavLink
                                    className={classnames({ active: this.state.activeTab === 'tx-transfer' })}
                                    onClick={() => { this.toggle('tx-transfer'); }}
                                    >
                                    Transfer ({numeral(this.state.transferTxs.length).format("0,0")})
                                    </NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink
                                    className={classnames({ active: this.state.activeTab === 'tx-staking' })}
                                    onClick={() => { this.toggle('tx-staking'); }}
                                    >
                                    Staking ({numeral(this.state.stakingTxs.length).format("0,0")})
                                    </NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink
                                    className={classnames({ active: this.state.activeTab === 'tx-distr' })}
                                    onClick={() => { this.toggle('tx-distr'); }}
                                    >
                                    Distribution ({numeral(this.state.distributionTxs.length).format("0,0")})
                                    </NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink
                                    className={classnames({ active: this.state.activeTab === 'tx-gov' })}
                                    onClick={() => { this.toggle('tx-gov'); }}
                                    >
                                    Governance ({numeral(this.state.governanceTxs.length).format("0,0")})
                                    </NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink
                                    className={classnames({ active: this.state.activeTab === 'tx-slashing' })}
                                    onClick={() => { this.toggle('tx-slashing'); }}
                                    >
                                    Slashing ({numeral(this.state.slashingTxs.length).format("0,0")})
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
                                                />
                                            }):''}
                                        </Col>
                                    </Row>
                                </TabPane>
                            </TabContent>
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