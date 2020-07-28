import React, { Component } from 'react';
import { Container, Row, Col, Card, CardBody, Spinner } from 'reactstrap';
import { Link, } from 'react-router-dom';
import numbro from 'numbro';
import moment from 'moment';
import Avatar from '../components/Avatar.jsx';
import TranactionTabs from '../transactions/TransactionTabs.jsx';
import { Helmet } from 'react-helmet';
import i18n from 'meteor/universe:i18n';
import TimeStamp from '../components/TimeStamp.jsx';

const T = i18n.createComponent();
export default class Block extends Component {
    constructor(props) {
        super(props);

        this.state = {
            transferTxs: {},
            cdpTxs: {},
            swapTxs: {},
            priceTxs: {},
            stakingTxs: {},
            distributionTxs: {},
            governanceTxs: {},
            slashingTxs: {},
            incentiveTxs: {},
            auctionTxs: {},
        };
    }

    componentDidUpdate(prevProps) {
        if (this.props != prevProps) {
            if (this.props.transactionsExist) {
                // console.log("have txs.");
                this.setState({
                    transferTxs: this.props.transferTxs,
                    cdpTxs: this.props.cdpTxs,
                    swapTxs: this.props.swapTxs,
                    priceTxs: this.props.priceTxs,
                    stakingTxs: this.props.stakingTxs,
                    distributionTxs: this.props.distributionTxs,
                    governanceTxs: this.props.governanceTxs,
                    slashingTxs: this.props.slashingTxs,
                    incentiveTxs: this.props.incentiveTxs,
                    auctionTxs: this.props.auctionTxs,
                })
            }
        }
    }

    render() {
        if (this.props.loading) {
            return <Container id="block">
                <Spinner type="grow" color="primary" />
            </Container>
        }
        else {
            if (this.props.blockExist) {
                // console.log(this.props.block);
                let block = this.props.block;
                let proposer = block.proposer();
                let moniker = proposer ? proposer.description.moniker : '';
                let profileUrl = proposer ? proposer.profile_url : '';

                return <Container id="block">
                    <Helmet>
                        <title>Block {numbro(block.height).format("0,0")} on Cosmos Hub | The Big Dipper</title>
                        <meta name="description" content={"Block details of height " + numbro(block.height).format("0,0")} />
                    </Helmet>
                    <h4><T>blocks.block</T> {numbro(block.height).format("0,0")}</h4>
                    <Card>
                        <div className="card-header"><T>common.information</T></div>
                        <CardBody>
                            <Row>
                                <Col md={4} className="label"><T>common.hash</T></Col>
                                <Col md={8} className="value text-nowrap address">{block.hash}</Col>
                                <Col md={4} className="label"><T>blocks.proposer</T></Col>
                                <Col md={8} className="value"><Link to={"/validator/" + ((proposer) ? proposer.operator_address : '')}><Avatar moniker={moniker} profileUrl={profileUrl} address={block.proposerAddress} list={true} /> {moniker}</Link></Col>
                                <Col md={4} className="label"><T>blocks.numOfTransactions</T></Col>
                                <Col md={8} className="value">{numbro(block.transNum).format("0,0")}</Col>
                                <Col md={4} className="label"><T>common.time</T></Col>
                                <Col md={8} className="value"><TimeStamp time={block.time} /> ({moment(block.time).fromNow()})</Col>
                            </Row>
                        </CardBody>
                    </Card>
                    <TranactionTabs
                        transferTxs={this.state.transferTxs}
                        cdpTxs={this.state.cdpTxs}
                        swapTxs={this.state.swapTxs}
                        priceTxs={this.state.priceTxs}
                        stakingTxs={this.state.stakingTxs}
                        distributionTxs={this.state.distributionTxs}
                        governanceTxs={this.state.governanceTxs}
                        slashingTxs={this.state.slashingTxs}
                        incentiveTxs={this.state.incentiveTxs}
                        auctionTxs={this.state.auctionTxs}
                    />
                </Container>
            }
            else {
                return <Container id="block"><div><T>block.notFound</T></div></Container>
            }
        }
    }
}