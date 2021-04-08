import React, { Component } from 'react';
import { Table, Badge, Spinner} from 'reactstrap';
import moment from 'moment';
import numbro from 'numbro';
import Account from '../components/Account.jsx';
import Coin from '/both/utils/coins.js'
import i18n from 'meteor/universe:i18n';
import PropTypes from 'prop-types';
import { HARDDepositButton, HARDWithdrawButton, HARDBorrowButton, HARDRepayButton, HARDLiquidateButton } from '../ledger/LedgerActions.jsx';
import _ from 'lodash';

const T = i18n.createComponent();
let timer = 0;

export default class HARD extends Component {
    constructor(props) {
        super(props);
        this.state = {
            collateralDeposited: 0,
            principalDeposited: 0,
            total: props.total,
            isDepositor: false,
            denomType: '',
            HARDParameters: undefined,
            deposits: undefined,
            loading: false
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
                    loading: true,
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
                    loading: true,
                    deposits: undefined
                })
            }

            if (result) {
                for(let c in result){
                    if(result[c].depositor === this.props.address){
                        for(let d in result[c].amount){
                            if (result[c].amount[d].denom === this.props.collateralDenom) {
                                this.setState({
                                    depositedValue: result[c].amount[d]
                                })
                            }
                        }
                        for(let e in result[c].index){
                            if (result[c].index[e].denom === this.props.collateralDenom){
                                this.setState({
                                    indexValue: result[c].index[e]
                                })
                            }
                        }     
                    }
                }
                this.setState({
                    loading: false,
                    deposits: result
                })
            }
        })
    }

    componentDidMount() {
        this.updateParameters();
        this.updateDeposits();
        this.getUserBalances();
    }

    componentDidUpdate(prevProps) {
        if (!_.isEqual(prevProps.total, this.props.total) || !_.isEqual(prevProps.collateralDenom, this.props.collateralDenom) ) {
            this.setState({
                loading: true,

            })
            this.updateParameters();
            this.updateDeposits();
            this.getUserBalances();
        }
    }

    findTotalValue(params, denomType) {
        let value = (params).find(({ denom }) => denom === denomType);
        let totalValue = value ? value.amount : null;
        return totalValue
    }


    render() {
        if (this.state.loading) {
            return <div>
                <Spinner type="grow" color="primary" />
            </div>
        }
        else if (this.state.depositedValue) {
            return <div className="hard-content">
                <Table responsive>
                    <tbody>
                        <tr>
                            <th scope="row" className="w-25 text-muted"><T>hard.depositor</T></th>
                            <td><Account address={this.props.address} /></td>
                        </tr>
                        <tr>
                            <th scope="row" className="w-25 text-muted"><T>hard.amount</T></th>
                            <td>
                                <div>{new Coin(this.state.depositedValue.amount, this.state.depositedValue.denom).toString()}</div>
                               
                            </td>
                        </tr> 
                        <tr>
                            <th scope="row" className="w-25 text-muted"><T>hard.index</T></th>
                            <td>
                                <div>{`${this.state.indexValue?.value}  
                                ${this.state.indexValue?.denom}`}</div>
                              
                            </td>
                        </tr>
                    </tbody>
                </Table> 

                <div className="hard-buttons float-right">
                    <HARDDepositButton
                        accountTokensAvailable={this.state.total ?? null}
                        HARDParameters={this.state.HARDParameters ?? null}
                        collateralDenom={this.props.collateralDenom ? this.props.collateralDenom : null}
                    />
                    {/* {((this.props.owner == this.props.user) || (this.state.isDepositor)) ? <HARDWithdrawButton
                        amountAvailable={this.state.total ? this.findTotalValue(this.state.total, this.props.collateralDenom) : null}
                        cdpOwner={this.state.userCDP ? this.state.userCDP.cdp.owner : null}
                        CDPParameters={this.props.collateralParams ?? null}
                        collateralDeposited={this.state.userCDP ? this.state.userCDP.cdp.collateral.amount : null}
                        collateralDenom={this.props.collateralDenom ? this.props.collateralDenom : null}
                        principalDenom={this.state.userCDP ? this.state.userCDP.cdp.principal.denom : null}
                        principalDeposited={this.state.userCDP ? this.state.userCDP.cdp.principal.amount : null}
                        isDepositor={this.state.isDepositor ? this.state.isDepositor : null}
                    /> : ''}
                    {(this.props.owner == this.props.user) ? <HARDBorrowButton
                        amountAvailable={this.state.total ? this.findTotalValue(this.state.total, this.props.collateralDenom) : null}
                        CDPParameters={this.props.collateralParams ?? null}
                        collateralDeposited={this.state.userCDP ? this.state.userCDP.cdp.collateral.amount : null}
                        collateralDenom={this.props.collateralDenom ? this.props.collateralDenom : null}
                        principalDenom={this.state.userCDP ? this.state.userCDP.cdp.principal.denom : null}
                        principalDeposited={this.state.userCDP ? this.state.userCDP.cdp.principal.amount : null}
                    /> : ''}

                    {(this.props.owner == this.props.user) ? <HARDRepayButton
                        amountAvailable={this.state.total ? this.findTotalValue(this.state.total, this.props.collateralDenom) : null}
                        CDPParameters={this.props.collateralParams ?? null}
                        collateralDeposited={this.state.userCDP ? this.state.userCDP.cdp.collateral.amount : null}
                        collateralDenom={this.props.collateralDenom ? this.props.collateralDenom : null}
                        principalDenom={this.state.userCDP ? this.state.userCDP.cdp.principal.denom : null}
                        principalDeposited={this.state.userCDP ? this.state.userCDP.cdp.principal.amount : null}
                        disabled={false}
                        hard="HARD"
                    /> : ''}

                    {(this.props.owner == this.props.user) ? <HARDLiquidateButton
                        amountAvailable={this.state.total ? this.findTotalValue(this.state.total, this.props.collateralDenom) : null}
                        CDPParameters={this.props.collateralParams ?? null}
                        collateralDeposited={this.state.userCDP ? this.state.userCDP.cdp.collateral.amount : null}
                        collateralDenom={this.props.collateralDenom ? this.props.collateralDenom : null}
                        principalDenom={this.state.userCDP ? this.state.userCDP.cdp.principal.denom : null}
                        principalDeposited={this.state.userCDP ? this.state.userCDP.cdp.principal.amount : null}
                        disabled={false}
                        borrower="kava127lary0erprnrv9vn3wykyt9pjm5a5tdwdnm3h"
                        hard="HARD"
                    /> : ''} */}
                </div>

            </div>

        }
        else{
            return <div>
                <div className="hard-buttons float-right">
                    <HARDDepositButton
                        accountTokensAvailable={this.state.total ?? null}
                        HARDParameters={this.state.HARDParameters ?? null}
                        collateralDenom={this.props.collateralDenom ? this.props.collateralDenom : null}
                    />
                </div>
            </div>
        }
    }
}





HARD.propTypes = {
    // owner: PropTypes.string.isRequired,
    // collateralType: PropTypes.string.isRequired,
    collateralDenom: PropTypes.string.isRequired,
    user: PropTypes.string.isRequired
}
