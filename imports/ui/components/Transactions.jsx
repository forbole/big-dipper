import React, { Component } from 'react';
import { Card, CardHeader, CardBody, Container, Row, Col, Spinner } from 'reactstrap';
import TransactionTabs from '../transactions/TransactionTabs.jsx';
import i18n from 'meteor/universe:i18n';

const T = i18n.createComponent();

export default class ValidatorTransactions extends Component {
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
            return <Spinner color="primary" type="glow" />
        }
        else if (this.props.transactionsExist) {
            return <TransactionTabs
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
        }
        else {
            return <Card body>
                <T>transactions.noValidatorTxsFound</T>
            </Card>
        }
    }
}