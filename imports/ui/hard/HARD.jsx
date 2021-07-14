import React, { Component } from 'react';
import { Table, Badge, Spinner} from 'reactstrap';
import moment from 'moment';
import numbro from 'numbro';
import Account from '../components/Account.jsx';
import Coin from '/both/utils/coins.js'
import i18n from 'meteor/universe:i18n';
import PropTypes from 'prop-types';
import { HARDDepositButton, HARDNewDepositButton, HARDWithdrawButton, HARDBorrowButton, HARDNewBorrowButton, HARDRepayButton, HARDLiquidateButton } from '../ledger/LedgerActions.jsx';
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
            loading: false,
            HARDDeposits: undefined,
            HARDBorrows: undefined
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
        Meteor.call('hard.fetchParameters', (error, result) => {
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
        Meteor.call('hard.findDepositor', this.props.address, (error, result) => {
            if (error) {
                console.warn(error);
                this.setState({
                    loading: true,
                    HARDDeposits: undefined
                })
            }
            else if (result) {
                this.setState({
                    HARDDeposits: result.amount[0],
                    HARDDepositIndex: result.index[0],
                    loading: false,
                    isDepositor: true
                })
            }
        })
    }

    updateBorrows() {
        Meteor.call('hard.findBorrower', this.props.address, (error, result) => {
            if (error) {
                console.warn(error);
                this.setState({
                    loading: true,
                    HARDBorrows: undefined,
                    isDepositor: false
                })
            }
            else if (result) {
                this.setState({
                    HARDBorrows: result.amount[0],
                    HARDBorrowIndex: result.index[0],
                    loading: false,
                    isDepositor: true
                })
            }
        })
    }

    componentDidMount() {
        this.updateParameters();
        this.updateDeposits();
        this.updateBorrows();
        this.getUserBalances();
    }

    componentDidUpdate(prevProps) {
        if (!_.isEqual(prevProps.total, this.props.total) || !_.isEqual(prevProps.collateralDenom, this.props.collateralDenom) || !_.isEqual(prevProps.activeTab, this.props.activeTab) ) {
            this.setState({
                loading: true,

            })
            this.updateParameters();
            this.updateDeposits();
            this.updateBorrows();
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
        else if(this.props.activeTab === 'hard-deposits'){
            if (this.state.HARDDeposits) {
                return <div className="hard-deposits-list">
                    <Table responsive>
                        <tbody>
                            <tr>
                                <th scope="row" className="w-25 text-muted"><T>hard.depositor</T></th>
                                <td><Account address={this.props.address} /></td>
                            </tr>
                            <tr>
                                <th scope="row" className="w-25 text-muted"><T>hard.amount</T></th>
                                <td>
                                    <div>{new Coin(this.state.HARDDeposits?.amount, this.state.HARDDeposits?.denom).toString()}</div>
                               
                                </td>
                            </tr> 
                            <tr>
                                <th scope="row" className="w-25 text-muted"><T>hard.index</T></th>
                                <td>
                                    <div>{`${this.state.HARDDepositIndex?.value}  
                                ${this.state.HARDDepositIndex?.denom}`}</div>
                              
                                </td>
                            </tr>
                        </tbody>
                    </Table> 

                    <div className="hard-buttons float-right">
                        {(this.props.address == this.props.user) ?
                            <HARDNewDepositButton
                                accountTokensAvailable={this.state.total ?? null}
                                HARDParameters={this.state.HARDParameters ?? null}
                                collateralDenom={this.props.collateralDenom ? this.props.collateralDenom : null}
                            /> 
                            : null }
                        {(this.props.address == this.props.user) ?
                            <HARDDepositButton
                                amountAvailable={this.state.total ? this.findTotalValue(this.state.total, this.props.collateralDenom) : null}
                                HARDParameters={this.state.HARDParameters ?? null}
                                collateralDenom={this.props.collateralDenom ? this.props.collateralDenom : null}
                            />
                            : null } 
                        {(this.props.address == this.props.user) ? 
                            <HARDWithdrawButton
                                amountAvailable={this.state.total ? this.findTotalValue(this.state.total, this.props.collateralDenom) : null}
                                collateralDeposited={this.state.HARDDeposits ? this.state.HARDDeposits?.amount : null}
                                collateralDenom={this.props.collateralDenom ? this.props.collateralDenom : null}
                                isDepositor={this.state.isDepositor ? this.state.isDepositor : null}
                            /> 
                            : null} 
                    </div>

                </div>
            }
            else {
                return <div className="hard-buttons float-right">
                    {(this.props.address == this.props.user) ?
                        <HARDNewDepositButton
                            accountTokensAvailable={this.state.total ?? null}
                            HARDParameters={this.state.HARDParameters ?? null}
                            collateralDenom={this.props.collateralDenom ? this.props.collateralDenom : null}
                        /> : null}

                </div>
            }
        }
        if (this.props.activeTab === 'hard-borrows') {
            if (this.state.HARDBorrows) {
                return <div className="hard-borrows-list">
                    <Table responsive>
                        <tbody>
                            <tr>
                                <th scope="row" className="w-25 text-muted"><T>hard.borrower</T></th>
                                <td><Account address={this.props?.address} /></td>
                            </tr>
                            <tr>
                                <th scope="row" className="w-25 text-muted"><T>hard.amount</T></th>
                                <td>
                                    <div>{new Coin(this.state.HARDBorrows?.amount, this.state.HARDBorrows?.denom).toString()}</div>

                                </td>
                            </tr>
                            <tr>
                                <th scope="row" className="w-25 text-muted"><T>hard.index</T></th>
                                <td>
                                    <div>{`${this.state.HARDBorrowIndex?.value}
                                ${this.state.HARDBorrowIndex?.denom}`}</div>

                                </td>
                            </tr>
                        </tbody>
                    </Table>

                    <div className="hard-buttons float-right">
                        {(this.props.address == this.props.user) ?
                            <HARDNewBorrowButton
                                accountTokensAvailable={this.state.total ?? null}
                                HARDParameters={this.state.HARDParameters ?? null}
                                collateralDenom={this.props.collateralDenom ? this.props.collateralDenom : null}
                                amountAvailable={this.state.total ? this.findTotalValue(this.state.total, this.props.collateralDenom) : null}
                            /> 
                            : null}

                        {(this.props.address == this.props.user) ?
                            <HARDBorrowButton
                                amountAvailable={this.state.total ? this.findTotalValue(this.state.total, this.props.collateralDenom) : null}
                                borrowedValue={this.state.HARDBorrows.amount ?? null}
                                collateralDenom={this.props.collateralDenom ? this.props.collateralDenom : null}
                            />
                            : null }

                        {(this.props.address == this.props.user) ?
                            <HARDRepayButton
                                amountAvailable={this.state.total ? this.findTotalValue(this.state.total, this.props.collateralDenom) : null}
                                borrowedValue={this.state.HARDBorrows.amount ?? null}
                                collateralDenom={this.props.collateralDenom ? this.props.collateralDenom : null}
                            />
                            : null }

                        {(this.props.address == this.props.user) ?
                            <HARDLiquidateButton
                                amountAvailable={this.state.total ? this.findTotalValue(this.state.total, this.props.collateralDenom) : null}
                                collateralDenom={this.props.collateralDenom ? this.props.collateralDenom : null}
                                borrower={this.props.address ?? ''}
                            />
                            : null}
                    </div>

                </div>

            }
            else {
                return <div className="hard-buttons float-right">
                    {(this.props.address == this.props.user) ?
                        <HARDNewBorrowButton
                            accountTokensAvailable={this.state.total ?? null}
                            HARDParameters={this.state.HARDParameters ?? null}
                            collateralDenom={this.props.collateralDenom ? this.props.collateralDenom : null}
                            amountAvailable={this.state.total ? this.findTotalValue(this.state.total, this.props.collateralDenom) : null}
                        /> : null }
                </div>
            }
            
        }
    }
}





HARD.propTypes = {
    address: PropTypes.string.isRequired,
    activeTab: PropTypes.string.isRequired,
    collateralDenom: PropTypes.string.isRequired,
    user: PropTypes.string.isRequired
}
