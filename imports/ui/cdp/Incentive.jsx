import React, { Component } from 'react';
import { Table, Badge } from 'reactstrap';
import moment from 'moment';
import numbro from 'numbro';
import Account from '../components/Account.jsx';
import Coin from '/both/utils/coins.js'
import i18n from 'meteor/universe:i18n';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { WithdrawIncentiveRewards } from '../ledger/LedgerActions.jsx';


const T = i18n.createComponent();
let timer = 0;
let claims = [];
let totalClaims = 0;

export default class Incentive extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ratio: 0,
            collateral: 0,
            debt: 0,
            collateralAmount: 0,
            debtAmount: 0,
            cdpParams: null,
            userCDP: null,
            denom: '',
            collateralizationRatio: 0,
            collateralDeposited: 0,
            principalDeposited: 0,
            cdpPrice: 0,
            total: props.total,
            deposits: [],
            isDepositor: false,
            cdpOwner: '',
            depositValue: 0,

            incentive: [],
            claimPerdiods: [],
            claimRewardsTotal: 0,
        }

    }

    getIncentive() {

        Meteor.call('cdp.getIncentive', this.props.owner, this.props.collateral, (error, result) => {
            if (error) {
                console.warn(error);
                this.setState({
                    loading: false,
                    incentive: null
                })
            }
            if (result) {

                result.forEach((el, i) => {
                    claims[i] = el.claim_period_id + ", "
                }),

                    result.forEach((el, i) => {
                        totalClaims = parseFloat(totalClaims) + parseFloat(el.reward.amount)
                    })

                this.setState({
                    incentive: result,
                    claimPerdiods: claims,
                    claimRewardsTotal: totalClaims,
                })
            }
        })
    }



    componentDidMount() {
        this.getIncentive();
    }


    render() {
        if (this.state.incentive && this.state.incentive.length > 0) {
            return <div className="cdp-content">
                <Table>
                    <tbody>
                        <tr>
                            <th scope="row" className="w-25 text-muted"><T>cdp.idClaimPeriod</T></th>
                            <td>{this.state.claimPerdiods ? this.state.claimPerdiods : null}</td>
                        </tr>
                        {(this.props.owner) ? <tr>
                            <th scope="row" className="w-25 text-muted"><T>cdp.owner</T></th>
                            <td><Account address={this.state.incentive[0].owner} /></td>
                        </tr> : ''}

                        <tr>
                            <th scope="row" className="w-25 text-muted"><T>cdp.totalReward</T></th>
                            <td><div >{new Coin(this.state.claimRewardsTotal).toString(6)}</div></td>

                        </tr>

                        {this.props.owner === this.props.user ? <tr>
                            <th scope="row" className="w-25 text-muted">{' '}</th>
                            {(this.state.claimRewardsTotal && this.state.claimRewardsTotal > 0) ? <td><WithdrawIncentiveRewards rewards={parseFloat(this.state.claimRewardsTotal)}
                                denom={this.props.collateral} /></td> : null}</tr> : null}


                    </tbody>
                </Table>

            </div>
        }

        else {
            return null
        }


    }
}




Incentive.propTypes = {
    owner: PropTypes.string.isRequired,
    collateral: PropTypes.string.isRequired,
    user: PropTypes.string.isRequired
}
