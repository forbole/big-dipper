import React, { Component } from 'react';
import { Table, Badge, ToastHeader, ToastBody, Toast } from 'reactstrap';
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

    updateCDP() {
        Meteor.call('accounts.getAccountCDP', this.props.owner, this.props.collateral, (error, result) => {
            if (error) {
                console.warn(error);
                this.setState({
                    loading: false,
                    userCDP: null
                })
            }

            if (result) {

                this.setState({
                    userCDP: result

                })
            }
        })
    }

    updateDeposits() {
        Meteor.call('cdp.getDeposits', this.props.owner, this.props.collateral, (error, result) => {
            //console.log(this.props.owner)
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

        Meteor.call('cdp.getCDPParams', (error, result) => {
            if (error) {
                console.warn(error);
                this.setState({
                    loading: false
                })
            }

            if (result) {
                this.setState({
                    cdpParams: result,

                })
            }
        }),

            Meteor.call('cdp.getCDPPrice', 'bnb:usd', (error, result) => {
                if (error) {
                    console.warn(error);
                    this.setState({
                        loading: false
                    })
                }

                if (result) {
                    this.setState({
                        BNB_USD: result
                    })
                }
            }),
            Meteor.call('cdp.getCDPPrice', 'bnb:usd:30', (error, result) => {
                if (error) {
                    console.warn(error);
                    this.setState({
                        loading: false
                    })
                }

                if (result) {
                    this.setState({
                        BNB_USD_30: result
                    })
                }
            }),
            this.updateCDP();
        this.updateDeposits();
        this.getUserBalances();

        timer = Meteor.setInterval(() => {
            this.updateCDP();
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



    render() {
        if (this.state.userCDP && this.state.userCDP.cdp) {
            return <div className="cdp-content">
                <Table responsive>
                    <span className="bnb-usd-price ">
                        <span className="pr-3">
                            <div ><Badge color="success" className="badge-bnb-usd">BNB : USD</Badge> </div>
                            <div className="mb-2"> <strong className="text-success">1 : {this.state.BNB_USD ? numbro(this.state.BNB_USD).formatCurrency({ mantissa: 4 }) : 0}</strong></div>
                        </span>
                        <span >
                            <div ><Badge color="success" className="badge-bnb-usd">BNB : USD : 30</Badge> </div>
                            <div className="mb-2"> <strong className="text-success">1 : {this.state.BNB_USD_30 ? numbro(this.state.BNB_USD_30).formatCurrency({ mantissa: 4 }) : 0}</strong></div>
                        </span>
                    </span>
                    <tbody>
                        <tr>
                            <th scope="row" className="w-25 text-muted"><T>cdp.id</T></th>
                            <td>{this.state.userCDP.cdp.id}</td>
                        </tr>
                        {(this.props.owner) ? <tr>
                            <th scope="row" className="w-25 text-muted"><T>cdp.owner</T></th>
                            <td><Account address={this.props.owner} /></td>
                        </tr> : ''}
                        {(this.state.userCDP.cdp.collateral) ? <tr>
                            <th scope="row" className="w-25 text-muted"><T>cdp.collateralDeposited</T></th>
                            <td><div >{new Coin(this.state.userCDP.cdp.collateral.amount, this.state.userCDP.cdp.collateral.denom).toString(6)}</div></td>
                        </tr> : ''}
                        {(this.state.userCDP.cdp.principal) ? <tr>
                            <th scope="row" className="w-25 text-muted"><T>cdp.principal</T></th>
                            <td><div >{new Coin(this.state.userCDP.cdp.principal.amount, this.state.userCDP.cdp.principal.denom).toString(6)}</div></td>
                        </tr> : ''}
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
                        </tr> : ''}
                        <tr>
                            <th scope="row" className="w-25 text-muted"><T>cdp.collateralizationRatio</T></th>
                            <td className={this.state.userCDP.collateralization_ratio > 2 ? "text-success" : "text-danger"}>{numbro(this.state.userCDP.collateralization_ratio).format({ mantissa: 4 })}</td>
                        </tr>
                    </tbody>
                </Table>
                <div className="cdp-buttons float-right">
                    <DepositCDPButton
                        // cdpParams={this.state.cdpParams ? this.state.cdpParams.debt_param.debt_floor : null}
                        collateral={this.props.collateral ? this.props.collateral : null}
                        bnbTotalValue={this.state.total ? this.findTotalValue(this.state.total, 'bnb') : null}
                        principalDeposited={this.state.userCDP ? this.state.userCDP.cdp.principal.amount : null}
                        principalDenom={this.state.userCDP ? this.state.userCDP.cdp.principal.denom : null}
                        price={this.state.BNB_USD ? this.state.BNB_USD : null}
                        collateralDeposited={this.state.userCDP ? this.state.userCDP.cdp.collateral.amount : null}
                        collateralizationRatio={this.state.cdpParams ? parseFloat(this.state.cdpParams.collateral_params[0].liquidation_ratio) : null}
                        cdpOwner={this.state.userCDP ? this.state.userCDP.cdp.owner : null}
                    />
                    {((this.props.owner == this.props.user) || (this.state.isDepositor)) ? <WithdrawCDPButton
                        // cdpParams={this.state.cdpParams ? this.state.cdpParams.debt_param.debt_floor : null}
                        collateral={this.props.collateral ? this.props.collateral : null}
                        principalDeposited={this.state.userCDP ? this.state.userCDP.cdp.principal.amount : null}
                        principalDenom={this.state.userCDP ? this.state.userCDP.cdp.principal.denom : null}
                        price={this.state.BNB_USD_30 ? this.state.BNB_USD_30 : 0}
                        collateralDeposited={this.state.userCDP ? this.state.userCDP.cdp.collateral.amount : null}
                        cdpOwner={this.state.userCDP ? this.state.userCDP.cdp.owner : null}
                        depositValue={this.state.depositValue ? this.state.depositValue : null}
                        isDepositor={this.state.isDepositor ? this.state.isDepositor : null}
                        collateralizationRatio={this.state.cdpParams ? parseFloat(this.state.cdpParams.collateral_params[0].liquidation_ratio) : null}
                    /> : ''}
                    {(this.props.owner == this.props.user) ? <DrawDebtCDPButton
                        // cdpParams={this.state.cdpParams ? this.state.cdpParams.debt_param.debt_floor : null}
                        collateral={this.props.collateral ? this.props.collateral : null}
                        principalDeposited={this.state.userCDP ? this.state.userCDP.cdp.principal.amount : null}
                        principalDenom={this.state.userCDP ? this.state.userCDP.cdp.principal.denom : null}
                        price={this.state.BNB_USD ? this.state.BNB_USD : null}
                        collateralDeposited={this.state.userCDP ? this.state.userCDP.cdp.collateral.amount : null}
                        collateralizationRatio={this.state.cdpParams ? parseFloat(this.state.cdpParams.collateral_params[0].liquidation_ratio) : null}
                    /> : ''}

                    {(this.props.owner == this.props.user) ? <RepayDebtCDPButton
                        // cdpParams={this.state.cdpParams ? this.state.cdpParams.debt_param.debt_floor : null}
                        collateral={this.props.collateral ? this.props.collateral : null}
                        usdxTotalValue={this.state.total ? this.findTotalValue(this.state.total, 'usdx') : null}
                        principalDeposited={this.state.userCDP ? this.state.userCDP.cdp.principal.amount : null}
                        principalDenom={this.state.userCDP ? this.state.userCDP.cdp.principal.denom : null}
                        price={this.state.BNB_USD_30 ? this.state.BNB_USD_30 : null}
                        collateralDeposited={this.state.userCDP ? this.state.userCDP.cdp.collateral.amount : null}
                        collateralizationRatio={this.state.cdpParams ? parseFloat(this.state.cdpParams.collateral_params[0].liquidation_ratio) : null}
                        minDebt={this.state.cdpParams ? this.state.cdpParams.debt_param.debt_floor : null}
                        disabled={!this.state.cdpParams}
                    /> : ''}
                </div>

            </div>
        }

        else {
            return <div >
                <span className="bnb-usd-price d-flex justify-content-center">
                    <span className="pr-3">
                        <div ><Badge color="success" className="badge-bnb-usd">BNB : USD</Badge> </div>
                        <div className="mb-2"> <strong className="text-success">1 : {this.state.BNB_USD ? numbro(this.state.BNB_USD).formatCurrency({ mantissa: 4 }) : 0}</strong></div>
                    </span>
                    <span >
                        <div ><Badge color="success" className="badge-bnb-usd">BNB : USD : 30</Badge> </div>
                        <div className="mb-2"> <strong className="text-success">1 : {this.state.BNB_USD_30 ? numbro(this.state.BNB_USD_30).formatCurrency({ mantissa: 4 }) : 0}</strong></div>
                    </span>
                    {/* <div className="mb-2"> <strong className="text-success">1 : {this.state.BNB_USD ? numbro(this.state.BNB_USD).formatCurrency({ mantissa: 4 }) : 0}</strong></div> */}
                </span>
                <div className="bnb-usd-price float-right px-2">
                    <CreateCDPButton
                        debtFloor={this.state.cdpParams ? this.state.cdpParams.debt_param.debt_floor : null}
                        collateralizationRatio={this.state.cdpParams ? parseFloat(this.state.cdpParams.collateral_params[0].liquidation_ratio) : null}
                        collateral={this.state.cdpParams ? this.state.cdpParams.collateral_params[0].denom : null}
                        price={this.state.BNB_USD ? this.state.BNB_USD : null}
                        bnbTotalValue={this.state.total ? this.findTotalValue(this.state.total, 'bnb') : null}
                    />
                </div>
            </div >

        }


    }
}





CDP.propTypes = {
    owner: PropTypes.string.isRequired,
    collateral: PropTypes.string.isRequired,
    user: PropTypes.string.isRequired
}
