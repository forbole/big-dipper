import React, { Component } from 'react';
import { Table, Badge, ToastHeader, ToastBody, Toast, Spinner } from 'reactstrap';
import moment from 'moment';
import numbro from 'numbro';
import Account from '../components/Account.jsx';
import Coin from '/both/utils/coins.js'
import i18n from 'meteor/universe:i18n';
import PropTypes from 'prop-types';
import { DepositCDPButton, WithdrawCDPButton, DrawDebtCDPButton, RepayDebtCDPButton, CreateCDPButton } from '../ledger/LedgerActions.jsx';
import _ from 'lodash';

const T = i18n.createComponent();
let timer = 0;

export default class CDP extends Component {
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
            loading: false
        }

    }

    getUserBalances() {
        if (this.props.user) {
            Meteor.call('accounts.getBalance', this.props.user, (error, result) => {
                if (!error) {
                    this.setState({
                        loading: false,
                        total: result.available
                    })
                }
                else{
                    this.setState({
                        loading: true,
                        total: undefined
                    })
                }
            })
        }
    }

    updateCDP() {
        Meteor.call('cdp.fetchAccount', this.props.owner, this.props.collateralType, (error, result) => {
            if (error) {
                console.warn(error);
                this.setState({
                    loading: true,
                    userCDP: null
                })
            }
            else if (result) {
                this.setState({
                    loading: false,
                    userCDP: result
                })
            }
            
        })
    }

    updateDeposits() {
        Meteor.call('cdp.deposits', this.props.owner, this.props.collateralType, (error, result) => {
            if (!error) {
                this.setState({
                    deposits: result,
                    isDepositor: false,
                })

                for (let i in result) {
                    if (this.props.user == result[i].depositor) {
                        this.setState({
                            isDepositor: true,
                            depositValue: result[i].amount.amount
                        })
                    }
                }
            }
        })
    }

    componentDidMount() {
        this.updateCDP();
        this.updateDeposits();
        this.getUserBalances();

    }


    componentDidUpdate(prevProps) {
        if (!_.isEqual(prevProps.collateralType, this.props.collateralType)){
            this.setState({
                loading: true,
            })
            this.updateCDP();
            this.updateDeposits();
            this.getUserBalances();
        }
    }

    findTotalValue(params, denomType) {
        let value = (params).find(({ denom }) => denom === denomType);
        let totalValue = value ? value.amount : null;
        return totalValue
    }

    getCollateralizationRatio(denomType) {
        for (let c in this.props?.collateralParams){
            if (this.props.collateralParams[c]?.type === denomType){
                if (this.props.collateralParams[c]?.liquidation_ratio) {
                    return parseFloat(this.props.collateralParams[c]?.liquidation_ratio)
                }
            }
        }
    }


    render() {
        if(this.state.loading){
            return <div>
                <Spinner type="grow" color="primary" />
            </div>
        }
        else if (this.state.userCDP && this.state.userCDP.cdp && !this.props.createCDP) {
            return <div className="cdp-content">
                <Table responsive>
                    <tbody>
                        <tr>
                            <th scope="row" className="w-25 text-muted"><T>cdp.id</T></th>
                            <td>{this.state.userCDP.cdp.id}</td>
                        </tr>
                        {(this.props.owner) ? <tr>
                            <th scope="row" className="w-25 text-muted"><T>cdp.owner</T></th>
                            <td><Account address={this.props.owner} /></td>
                        </tr> : null}
                        {(this.state.userCDP.cdp.type) ? <tr>
                            <th scope="row" className="w-25 text-muted"><T>cdp.collateralType</T></th>
                            <td><div >{this.state.userCDP.cdp.type}</div></td>
                        </tr> : null}
                        {(this.state.userCDP.cdp.collateral) ? <tr>
                            <th scope="row" className="w-25 text-muted"><T>cdp.collateralDeposited</T></th>
                            <td><div >{new Coin(this.state.userCDP.cdp.collateral.amount, this.state.userCDP.cdp.collateral.denom).toString(6)}</div></td>
                        </tr> : null}
                        {(this.state.userCDP.cdp.principal) ? <tr>
                            <th scope="row" className="w-25 text-muted"><T>cdp.principal</T></th>
                            <td><div >{new Coin(this.state.userCDP.cdp.principal.amount, this.state.userCDP.cdp.principal.denom).toString(6)}</div></td>
                        </tr> : null}
                        <tr>
                            <th scope="row" className="w-25 text-muted"><T>cdp.accumulatedFees</T></th>
                            <td>
                                <div>{new Coin(this.state.userCDP.cdp.accumulated_fees.amount, this.state.userCDP.cdp.accumulated_fees.denom).toString(6)}
                                    <small> (<T>common.lastUpdated</T> {moment.utc(this.state.userCDP.cdp.fees_updated).fromNow()})</small>
                                </div></td>
                        </tr>
                        {(this.state.userCDP.collateral_value && (this.state.userCDP.collateral_value.length > 0)) ? <tr>
                            <th scope="row" className="w-25 text-muted"><T>cdp.collateralValue</T></th>
                            <td>{this.state.userCDP.collateral_value.map((col, i) => <div key={i}>{new Coin(col.amount, col.denom).toString(6)}</div>)}</td>
                        </tr> : null}
                        <tr>
                            <th scope="row" className="w-25 text-muted"><T>cdp.interestFactor</T></th>
                            <td>{numbro(this.state.userCDP.cdp.interest_factor).format({ mantissa: 4 })}</td>
                        </tr>
                        <tr>
                            <th scope="row" className="w-25 text-muted"><T>cdp.collateralizationRatio</T></th>
                            <td className={this.state.userCDP.collateralization_ratio > 2 ? "text-success" : "text-danger"}>{numbro(this.state.userCDP.collateralization_ratio).format({ mantissa: 4 })}</td>
                        </tr>
                    </tbody>
                </Table>
                <div className="cdp-buttons float-right">
                    <DepositCDPButton
                        amountAvailable={this.state.total ? this.findTotalValue(this.state.total, this.props.collateralDenom) : null}
                        cdpOwner={this.state.userCDP ? this.state.userCDP.cdp.owner : null}
                        CDPParameters={this.props.collateralParams ?? null}
                        collateralDeposited={this.state.userCDP ? this.state.userCDP.cdp.collateral.amount : null}
                        collateralDenom={this.props.collateralDenom ? this.props.collateralDenom : null}
                        principalDenom={this.state.userCDP ? this.state.userCDP.cdp.principal.denom : null}
                        principalDeposited={this.state.userCDP ? this.state.userCDP.cdp.principal.amount : null}
                        collateralizationRatio={this.getCollateralizationRatio(this.props.collateralDenom) ?? null}
                    />
                    {((this.props.owner == this.props.user) || (this.state.isDepositor)) ? <WithdrawCDPButton
                        amountAvailable={this.state.total ? this.findTotalValue(this.state.total, this.props.collateralDenom) : null}
                        cdpOwner={this.state.userCDP ? this.state.userCDP.cdp.owner : null}
                        CDPParameters={this.props.collateralParams ?? null}
                        collateralDeposited={this.state.userCDP ? this.state.userCDP.cdp.collateral.amount : null}
                        collateralDenom={this.props.collateralDenom ? this.props.collateralDenom : null}
                        principalDenom={this.state.userCDP ? this.state.userCDP.cdp.principal.denom : null}
                        principalDeposited={this.state.userCDP ? this.state.userCDP.cdp.principal.amount : null}
                        collateralizationRatio={this.getCollateralizationRatio(this.props.collateralDenom) ?? null}
                        isDepositor={this.state.isDepositor ? this.state.isDepositor : null}
                    /> : null}
                    {(this.props.owner == this.props.user) ? <DrawDebtCDPButton
                        amountAvailable={this.state.total ? this.findTotalValue(this.state.total, this.props.collateralDenom) : null}
                        CDPParameters={this.props.collateralParams ?? null}
                        collateralDeposited={this.state.userCDP ? this.state.userCDP.cdp.collateral.amount : null}
                        collateralDenom={this.props.collateralDenom ? this.props.collateralDenom : null}
                        principalDenom={this.state.userCDP ? this.state.userCDP.cdp.principal.denom : null}
                        principalDeposited={this.state.userCDP ? this.state.userCDP.cdp.principal.amount : null}
                        collateralizationRatio={this.getCollateralizationRatio(this.props.collateralDenom) ?? null}
                    /> : null}

                    {(this.props.owner == this.props.user) ? <RepayDebtCDPButton
                        amountAvailable={this.state.total ? this.findTotalValue(this.state.total, this.props.collateralDenom) : null}
                        CDPParameters={this.props.collateralParams ?? null}
                        collateralDeposited={this.state.userCDP ? this.state.userCDP.cdp.collateral.amount : null}
                        collateralDenom={this.props.collateralDenom ? this.props.collateralDenom : null}
                        principalDenom={this.state.userCDP ? this.state.userCDP.cdp.principal.denom : null}
                        principalDeposited={this.state.userCDP ? this.state.userCDP.cdp.principal.amount : null}
                        collateralizationRatio={this.getCollateralizationRatio(this.props.collateralDenom) ?? null}
                        disabled={!this.state.userCDP}
                    /> : null}
                </div>

            </div>
        }

        else if (this.props.createCDP){
            return <div >
                <span className="bnb-usd-price">
                    <span className="pr-3">
                        <div ><Badge color="success" className="badge-bnb-usd">BNB : USD</Badge> </div>
                        <div className="mb-2 ml-2"> <strong className="text-success">1 : {this.props.BNB_USD_Price ? numbro(this.props.BNB_USD_Price).formatCurrency({ mantissa: 4 }) : 0}</strong></div>
                    </span>
                    <span className="pr-3">
                        <div ><Badge color="warning" className="badge-bnb-usd">BNB : USD : 30</Badge> </div>
                        <div className="mb-2 ml-2"> <strong className="text-warning">1 : {this.props.BNB_USD_30_Price ? numbro(this.props.BNB_USD_30_Price).formatCurrency({ mantissa: 4 }) : 0}</strong></div>
                    </span>
                    <span className="pr-3">
                        <div ><Badge color="info" className="badge-bnb-usd">HARD : USD </Badge> </div>
                        <div className="mb-2 ml-3"> <strong className="text-info">1 : {this.props.HARD_USD_Price ? numbro(this.props.HARD_USD_Price).formatCurrency({ mantissa: 4 }) : 0}</strong></div>
                    </span>
                </span>
                <div className="bnb-usd-price float-right px-2">
                    <CreateCDPButton
                        accountTokensAvailable={this.state.total ?? null}
                        CDPParameters={this.props.collateralParams ?? null}
                        debtParams={this.props.debtParams ??  null} 
                        collateralDenom={this.props.collateralDenom ? this.props.collateralDenom : null}
                        collateralizationRatio={this.getCollateralizationRatio(this.props.collateralDenom) ?? null}
                    />
                </div>
            </div >

        }

        else return <span className="pl-2">{`No active CDP for collateral type ${this.props.collateralType.toUpperCase()}`}</span>;

    }
}





CDP.propTypes = {
    owner: PropTypes.string.isRequired,
    collateralType: PropTypes.string.isRequired,
    collateralDenom: PropTypes.string.isRequired,
    user: PropTypes.string.isRequired
}
