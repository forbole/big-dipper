import React, { Component } from 'react';
import { Table, Badge, ToastHeader, ToastBody, Toast } from 'reactstrap';
import moment from 'moment';
import numbro from 'numbro';
import Account from '../components/Account.jsx';
import Coin from '/both/utils/coins.js'
import i18n from 'meteor/universe:i18n';
import PropTypes from 'prop-types';
import { HARDDepositButton, HARDWithdrawButton } from '../ledger/LedgerActions.jsx';
import _ from 'lodash';

const T = i18n.createComponent();
let timer = 0;

export default class HARD extends Component {
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
            total: props.total,
            deposits: [],
            isDepositor: false,
            cdpOwner: '',
            depositValue: 0,
            BNB_USD: 0,
            BNB_USD_30: 0,
            denomType: '',
            HARDParameters: undefined
        }

    }

    getUserBalances() {
        if (this.props.user) {
            Meteor.call('accounts.getBalance', this.props.user, (error, result) => {
                if (!error) {
                    this.setState({
                        total: result.available
                    })
                }
            })
        }
    }

    updateParameters() {
        Meteor.call('hard.parameters', (error, result) => {
            if (error) {
                console.warn(error);
                this.setState({
                    loading: false,
                    HARDParameters: null
                })
            }

            if (result) {
                this.setState({
                    HARDParameters: result
                })
            }
        })
    }

    updateDeposits() {
        Meteor.call('hard.deposits', (error, result) => {
            if (error) {
                console.warn(error);
                this.setState({
                    loading: false,
                    HARDParameters: null
                })
            }

            if (result) {
                this.setState({
                    HARDParameters: result
                })
            }
        })
    }

    componentDidMount() {
        this.updateParameters();
        this.updateDeposits();
        this.getUserBalances();

        timer = Meteor.setInterval(() => {
            this.updateParameters();
            this.updateDeposits();
            this.getUserBalances();
        }, 9000)

    }

    componentWillUnmount() {
        Meteor.clearInterval(timer);
    }

    componentDidUpdate(prevProps) {
        if (!_.isEqual(prevProps.total, this.props.total)) {
            this.setState({
                total: this.props.total,
            })
        }
    }

    findTotalValue(params, denomType) {
        let value = (params).find(({ denom }) => denom === denomType);
        let totalValue = value ? value.amount : null;
        return totalValue
    }

    getCDPParams(denomType, valueToGet) {
        let value = (this.props.collateralParams).find(({ denom }) => denom === denomType);
        let totalValue = value ? value[valueToGet] : null;
        if(totalValue >= 0){
            return parseFloat(totalValue)
        }
        else{
            return totalValue
        }
    }


    render() {
        return <div className="hard-content">
            <span className="bnb-usd-price">
                <span className="pr-3">
                    <div ><Badge color="info" className="badge-bnb-usd">HARD : USD </Badge> </div>
                    <div className="mb-2 ml-3"> <strong className="text-info">1 : {this.props.HARD_USD_Price ? numbro(this.props.HARD_USD_Price).formatCurrency({ mantissa: 4 }) : 0}</strong></div>
                </span>
            </span>
            <div className="cdp-buttons float-right">
                <HARDDepositButton
                    accountTokensAvailable={this.state.total ?? null}
                    HARDParameters={this.state.HARDParameters ?? null}
                    collateralDenom={this.props.collateralDenom ? this.props.collateralDenom : null}
                />
                {((this.props.owner == this.props.user) || (this.state.isDepositor)) ? <HARDWithdrawButton
                    amountAvailable={this.state.total ? this.findTotalValue(this.state.total, this.props.collateralDenom) : null}
                    cdpOwner={this.state.userCDP ? this.state.userCDP.cdp.owner : null}
                    CDPParameters={this.props.collateralParams ?? null}
                    collateralDeposited={this.state.userCDP ? this.state.userCDP.cdp.collateral.amount : null}
                    collateralDenom={this.props.collateralDenom ? this.props.collateralDenom : null}
                    principalDenom={this.state.userCDP ? this.state.userCDP.cdp.principal.denom : null}
                    principalDeposited={this.state.userCDP ? this.state.userCDP.cdp.principal.amount : null}
                    collateralizationRatio={this.getCDPParams(this.props.collateralDenom, 'liquidation_ratio') ?? null}
                    isDepositor={this.state.isDepositor ? this.state.isDepositor : null}
                /> : ''}
            </div>

        </div>

    }
}





HARD.propTypes = {
    owner: PropTypes.string.isRequired,
    collateralType: PropTypes.string.isRequired,
    collateralDenom: PropTypes.string.isRequired,
    user: PropTypes.string.isRequired,
    HARD_USD_Price: PropTypes.string.isRequired
}
