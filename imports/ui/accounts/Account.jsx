import React, { Component, useState } from 'react';
import {
    Spinner,
    TabContent, TabPane,
    Nav, NavItem, NavLink,
    Row, Col,
    Card, CardHeader, CardBody,
    Progress,
} from 'reactstrap';
import classnames from 'classnames';
import numbro from 'numbro';
import AccountCopy from '../components/AccountCopy.jsx';
import LinkIcon from '../components/LinkIcon.jsx';
import Delegations from './Delegations.jsx';
import Unbondings from './Unbondings.jsx';
import Redelegations from './Redelegations.jsx';
import AccountTransactions from '../components/TransactionsContainer.js';
import ChainStates from '../components/ChainStatesContainer.js'
import { Helmet } from 'react-helmet';
import { WithdrawButton, TransferButton, ClaimSwapButton } from '../ledger/LedgerActions.jsx';
import CDP from '../cdp/CDP.jsx';
import HARD from '../hard/HARD.jsx';
import SentryBoundary from '../components/SentryBoundary.jsx';
import i18n from 'meteor/universe:i18n';
import Coin from '/both/utils/coins.js';
import Incentive from '../cdp/Incentive.jsx';


const T = i18n.createComponent();
let timer = 0;
const coin1 = 'ukava'
const coin2 = 'bnb'
const coin3 = 'usdx'
const coin4 = 'hard'

const cloneDeep = require('lodash/cloneDeep');

export default class AccountDetails extends Component {
    constructor(props) {
        super(props);
        const defaultCoin = Meteor.settings.public.coins.map(coin => {
            return {
                denom: coin.denom,
                amount: 0
            }
        })
        this.state = {
            address: props.match.params.address,
            loading: true,
            accountExists: false,
            available: [defaultCoin],
            delegated: 0,
            unbonding: 0,
            rewards: [defaultCoin],
            reward: [defaultCoin],
            total: [defaultCoin],
            price: 0,
            user: localStorage.getItem(CURRENTUSERADDR),
            commission: [defaultCoin],
            denom: Coin.StakingCoin.denom,
            rewardsForEachDel: {defaultCoin},
            rewardDenomType: [defaultCoin],
            bondActiveTab: 'delegations',
            cdpActiveTab: 'cdp-create',
            activeSubtab: 'cdp-bnb-a',
            activeSubtabDenomType: 'bnb-a',
            activeSubtabDenom: 'bnb',
            activeHARDTab: '',
            activeHARDSubtab: '',
            activeIncentiveSubtab: 'incentive-hard',
            cdpID: 0,
            cdpOwner: '',
            cdpCollateral: [],
            cdpPrincipal: [],
            cdpAccumulatedFees: [],
            cdpFeesUpdated: 0,
            cdpCollateralValue: 0,
            cdpCollateralizationRatio: 0,
            BNB_USD_Price: 0,
            USDX_Price: 1,
            HARD_USD_Price: 0,
            totalKavaInUSD: 0,
            totalBNBInUSD: 0,
            totalUSDXInUSD: 0,
            totalValueInUSD: 0,
            redelegations: [],
            hasIncentive: false,
            operatorAddress: "",
            hasActiveCDP: false,
            collateralParams: [],
            hasHARDBorrows: false,
            hasHARDDeposit: false,
            HARDDeposits: undefined,
            HARDBorrows: undefined

        }
    }

    static getDerivedStateFromProps(props, state) {
        if (state.user !== localStorage.getItem(CURRENTUSERADDR)) {
            return { user: localStorage.getItem(CURRENTUSERADDR) };
        }
        return null;
    }

    getBalance() {

        let numRewards = {};

        Meteor.call('coinStats.getStats', (error, result) => {
            if (result) {
                this.setState({
                    price: result.usd || 0
                })
            }
        });

        Meteor.call('accounts.getBalance', this.props.match.params.address, (error, result) => {
            if (error) {
                console.warn(error);
                this.setState({
                    loading: false
                })
            }

            if (result) {
                if (result.available && result.available.length > 0) {
                    //Reset the values to display only the latest data from the chain 
                    let getAvailableValue = [];
                    let getTotalValue = [];

                    getAvailableValue = cloneDeep(result.available)
                    getTotalValue = cloneDeep(result.available)

                    this.setState({
                        available: getAvailableValue,
                        total: getTotalValue
                    })
                } else {
                    let setZeroAmount = [{
                        denom: "ukava",
                        amount: "0.00"
                    }]

                    this.setState({
                        available: cloneDeep(setZeroAmount),
                        denom: Coin.StakingCoin.denom,
                        total: cloneDeep(setZeroAmount)

                    })
                }

                this.setState({
                    delegations: result.delegations || []
                })
                if (result.delegations && result.delegations.length > 0) {
                    let delegatedValue = [{
                        denom: "ukava",
                        amount: "0.00"
                    }];

                    result.delegations.forEach((unbond, i) => {
                        delegatedValue.forEach((entry, j) => {
                            delegatedValue[j].amount = parseFloat(delegatedValue[j].amount) + parseFloat(unbond.balance.amount);
                            this.setState({
                                delegated: delegatedValue,
                            })
                        })
                    })

                    if (this.state.total && this.state.total.length > 1) {
                        let totalValue = cloneDeep(this.state.total);

                        this.state.delegated.forEach((delegated, i) => {
                            totalValue.forEach((el, i) => {
                                if (el.denom === delegated.denom) {
                                    el.amount = parseFloat(el.amount) + parseFloat(delegated.amount)
                                }
                            })
                        })

                        this.setState({
                            total: totalValue,
                        })
                    } else {
                        let totalValue = cloneDeep(this.state.total);
                        for (let v in totalValue) {
                            totalValue[v].amount = parseFloat(totalValue[v].amount) + parseFloat(this.state.delegated[v].amount)
                        }
                        this.setState({
                            total: totalValue,
                        })
                    }
                }

                const unbondingValue = [{
                    denom: "ukava",
                    amount: "0.00"
                }];
                this.setState({
                    unbondingDelegations: result.unbonding || [],
                    unbonding: unbondingValue
                })

                if (result.unbonding && result.unbonding.length > 0) {
                    result.unbonding.forEach((unbond, i) => {
                        unbond.entries.forEach((entry, j) => {
                            unbondingValue[unbondingValue.length - 1].amount = parseFloat(unbondingValue[unbondingValue.length - 1].amount) + parseFloat(entry.balance);
                            this.setState({
                                unbonding: unbondingValue,
                            }), this
                        })
                    }, this)


                    let totalValue = cloneDeep(this.state.total);

                    this.state.unbonding.forEach((unbond, i) => {
                        totalValue.forEach((el, i) => {
                            if (el.denom === unbond.denom) {
                                el.amount = parseFloat(el.amount) + parseFloat(unbond.amount)
                            }
                        })

                    })

                    this.setState({
                        total: totalValue,
                    })

                }

                else {
                    let totalValue = cloneDeep(this.state.total);
                    for (let v in totalValue) {
                        for (let c in this.state.unbonding) {
                            if (totalValue[v].denom === this.state.unbonding[c].denom) {
                                totalValue[v].amount = parseFloat(totalValue[v].amount) + parseFloat(this.state.unbonding[c].amount)
                            }
                        }

                    }
                    this.setState({
                        total: totalValue,
                    })
                }

                if (result.total_rewards && result.total_rewards.length > 0) {
                    const totalRewards = cloneDeep(result.total_rewards);
                    this.setState({
                        rewards: totalRewards,
                    })

                    if (this.state.rewards.length > 0) {

                        if (this.state.rewards.length > 1) {
                            let totalValue = cloneDeep(this.state.total);
                            this.state.rewards.forEach((rewards, i) => {
                                totalValue.forEach((el, i) => {
                                    if (rewards.denom === el.denom) {
                                        el.amount = parseFloat(el.amount) + parseFloat(rewards.amount)
                                    }
                                })
                            }, this)
                            this.setState({
                                total: totalValue,
                            })
                        } else {
                            let totalValue = cloneDeep(this.state.total);
                            for (let v in totalValue) {
                                for (let c in this.state.rewards) {
                                    if (totalValue[v].denom === this.state.rewards[c].denom) {
                                        totalValue[v].amount = parseFloat(totalValue[v].amount) + parseFloat(this.state.rewards[c].amount)
                                    }
                                }
                            }
                            this.setState({
                                total: totalValue,
                            })
                        }
                    }

                }


                if (result.rewards && result.rewards.length > 0) {
                    let opAddress = "";

                    for (let c = 0; c < result.rewards.length; c++) {
                        if (result.rewards[c].reward != null) {
                            numRewards[result.rewards[c]["validator_address"]] = result.rewards[c].reward;
                        }
                        opAddress = result.rewards[c]["validator_address"];
                    }
                    for (let e in numRewards) {
                        for (let f in numRewards[e]) {
                            if (this.state.denom === numRewards[e][f].denom) {
                                this.setState({
                                    rewardDenomType: numRewards[e][f].denom,
                                    rewardsForEachDel: numRewards,
                                    operatorAddress: opAddress,
                                })
                            }

                        }
                    }
                }


                if (result.commission && result.commission.length > 0) {
                    const totalCommissions = cloneDeep(result.commission);

                    this.setState({
                        commission: totalCommissions,
                    })

                    if (this.state.commission.length > 0) {
                        if (this.state.commission.length > 1) {
                            let totalValue = cloneDeep(this.state.total);
                            this.state.commission.forEach((commission, i) => {
                                totalValue.forEach((el, i) => {
                                    if (commission.denom === el.denom) {
                                        el.amount = parseFloat(el.amount) + parseFloat(commission.amount)
                                    }
                                })
                            }, this)

                            this.setState({
                                total: totalValue,
                            })
                        } else {
                            let totalValue = cloneDeep(this.state.total);
                            let totalCommission = cloneDeep(this.state.commission);
                            for (let v in totalValue) {
                                if (totalValue[v].denom === Meteor.settings.public.bondDenom) {
                                    totalValue[v].amount = parseFloat(totalValue[v].amount) + parseFloat(totalCommission[0].amount)
                                }
                            }

                            this.setState({
                                total: totalValue,
                            })
                        }
                    }

                }

                let calculateKavaInUSD = this.findValue(this.state.total, coin1) * this.state.price;
                let calculateBNBInUSD = this.findValue(this.state.total, coin2) * this.state.BNB_USD_Price;
                let calculateUSDXInUSD = this.findValue(this.state.total, coin3) * this.state.USDX_Price
                let calculateHARDInUSD = this.findValue(this.state.total, coin4) * this.state.HARD_USD_Price
                let calculateTotalValueInUSD = calculateKavaInUSD + calculateBNBInUSD + calculateUSDXInUSD;

                this.setState({
                    loading: false,
                    accountExists: true,
                    totalKavaInUSD: calculateKavaInUSD,
                    totalBNBInUSD: calculateBNBInUSD,
                    totalUSDXInUSD: calculateUSDXInUSD,
                    totalHARDInUSD: calculateHARDInUSD,
                    totalValueInUSD: calculateTotalValueInUSD,
                })

            }
        });

        Meteor.call('cdp.price', 'bnb:usd', (error, result) => {
            if (error) {
                console.warn(error);
                this.setState({
                    loading: false
                })
            }

            if (result) {
                this.setState({
                    BNB_USD_Price: result
                })
            }

        });
        Meteor.call('cdp.price', 'bnb:usd:30', (error, result) => {
            if (error) {
                console.warn(error);
                this.setState({
                    loading: false
                })
            }

            if (result) {
                this.setState({
                    BNB_USD_30_Price: result
                })
            }

        });
        

        Meteor.call('cdp.price', 'hard:usd', (error, result) => {
            if (error) {
                console.warn(error);
                this.setState({
                    loading: false
                })
            }

            if (result) {
                this.setState({
                    HARD_USD_Price: result
                })
            }

        });

        Meteor.call('accounts.getRedelegations', this.props.match.params.address, (error, result) => {
            if (error) {
                console.warn(error);
                this.setState({
                    loading: false
                })
            }

            if (result) {
                this.setState({
                    redelegations: result
                })
            }

        });


        Meteor.call('hard.fetchIncentive', (error, result) => {
            if (error) {
                console.warn(error);
                this.setState({
                    loading: false,
                    hasIncentive: false
                })
            }
            if (result) {
                for (let d = 0; d < result.hard_claims.length; d++) {
                    if (result.hard_claims[d].base_claim.owner === this.props.match.params.address){
                        this.setState({
                            hasIncentive: true,
                        })
                    }
                };

                for (let e = 0; e < result.usdx_minting_claims.length; e++) {
                    if (result.usdx_minting_claims[e].base_claim.owner === this.props.match.params.address) {
                        this.setState({
                            hasIncentive: true,
                        })
                    }
                }
            };
        })

    }


    componentDidMount() {
        this.getBalance();
        this.checkIfCDPIsActive();
        this.updateDeposits();
        this.updateBorrows();
        timer = Meteor.setInterval(() => {
            this.getBalance();
        }, 10000)
    }

    componentDidUpdate(prevProps) {
        if (this.props.match.params.address !== prevProps.match.params.address) {
            this.setState({
                address: this.props.match.params.address,
                loading: true,
                accountExists: false,
                available: [],
                delegated: 0,
                unbonding: 0,
                commission: [],
                rewards: [],
                total: [],
                price: 0,
                reward: [],
                denom: '',
                rewardsForEachDel: {},
                rewardDenomType: [],
                cdpID: 0,
                debtParams: [],
                cdpOwner: '',
                cdpCollateral: [],
                cdpPrincipal: [],
                cdpAccumulatedFees: [],
                cdpFeesUpdated: 0,
                cdpCollateralValue: 0,
                cdpCollateralizationRatio: 0,
                BNB_USD_Price: 0,
                totalKavaInUSD: 0,
                totalBNBInUSD: 0,
                totalUSDXInUSD: 0,
                totalValueInUSD: 0,
                redelegations: [],
                hasIncentive: false,
                operatorAddress: "",
                hasActiveCDP: false,
                hasHARDDeposit: false,
                hasHARDBorrows: false,
                HARDDeposits: undefined,
                HARDBorrows: undefined,
                collateralParams: []
            }, () => {
                this.getBalance();
            })
        }
    }

    handleCoinSwitch = (type, e) => {
        e.preventDefault();
        switch (type) {
        case type:
            this.setState({
                denom: type
            })
            break;
        }
    }

    renderShareLink() {
        let primaryLink = `/account/${this.state.address}`
        let otherLinks = [
            { label: 'Transfer', url: `${primaryLink}/send` }
        ]
        return <LinkIcon link={primaryLink} otherLinks={otherLinks} />
    }



    findCoin(coins, requestedDenom) {
        if (coins && coins.length > 1 && requestedDenom) {
            let finder = (coins).find(({ denom }) => denom === requestedDenom);
            let coinFinder = finder ? new Coin(finder.amount, finder.denom).stakeString(4) : new Coin(parseFloat('0.00'), requestedDenom).stakeString(4)
            return coinFinder
        }
        if (coins.length === 1) {
            for (let c in coins) {
                if (coins[c].denom === requestedDenom) {
                    return new Coin(parseFloat(coins[c].amount), requestedDenom).stakeString(4)
                }
                else {
                    return new Coin(parseFloat('0.00'), requestedDenom).stakeString(4)
                }

            }
        }
        else {
            return new Coin(parseFloat('0.00'), requestedDenom).stakeString(4)
        }

    }

    findValue(params, requestedDenom) {
        let currentTotal = 0;
        let denomType = "";
        let denomFraction = 1;
        let stakingTotal = 0

        if (requestedDenom) {
            denomType = Meteor.settings.public.coins.find(({ denom }) => denom === requestedDenom);
            denomFraction = denomType ? denomType.fraction : null
        }

        if (params && params.length > 1) {
            let current = (params).find(({ denom }) => denom === requestedDenom);
            currentTotal = current ? current.amount : '0.0000';

            stakingTotal = currentTotal / denomFraction

            return stakingTotal
        }

        else {
            for (let p in params) {
                if (params[p].denom === requestedDenom) {
                    currentTotal = params[p].amount;
                    stakingTotal = currentTotal / denomFraction
                    return stakingTotal
                }
                else {
                    currentTotal = 0
                    stakingTotal = 0
                    return stakingTotal
                }
            }

        }

    }

    toggleBond = (tab) => {
        if (this.state.bondActiveTab !== tab) {
            this.setState({
                bondActiveTab: tab
            });
        }
    }

    toggleCDP = (tab) => {
        if (this.state.cdpActiveTab !== tab) {
            this.setState({
                cdpActiveTab: tab
            });
        }
    }

    toggleCDPSutab = (tab, denomName, denomType) => {
        if (this.state.activeSubtab !== tab) {
            this.setState({
                activeSubtab: tab,
                activeSubtabDenom: denomName,
                activeSubtabDenomType: denomType
            });
        }
    }

    toggleHARDTab = (tab) => {
        if (this.state.activeHARDTab !== tab) {
            this.setState({
                activeHARDTab: tab
            });
        }
    }
    

    toggleHARDSubtab = (tab) => {
        if (this.state.activeHARDSubtab !== tab) {
            this.setState({
                activeHARDSubtab: tab
            });
        }
    }

    toggleIncentiveSutab = (tab) => {
        if (this.state.activeIncentiveSubtab !== tab) {
            this.setState({
                activeIncentiveSubtab: tab
            });
        }
    }

    checkIfCDPIsActive() {
        Meteor.call('cdp.fetchParameters', (error, result) => {
            if (error) {
                console.warn(error);
                this.setState({
                    loading: false
                })
            }

            if (result) {
                this.setState({
                    debtParams: result.debt_param
                });
                let collateralParams = [];
                for (let c in result.collateral_params) {
                    let counter = 0;
                    Meteor.call('cdp.fetchAccount', this.state.address, result.collateral_params[c].type, (err, res) => {
                        if (err) {
                            this.setState({
                                loading: true,
                                hasActiveCDP: false
                            })
                        }
                        else if (res) {
                            this.setState({
                                hasActiveCDP: true,
                            });
                            collateralParams[counter] = result.collateral_params[c];
                            counter++;
                        }
                    })
                }
                this.setState({
                    collateralParams: collateralParams
                })
            }
        })

     
    };

    updateDeposits() {
        Meteor.call('hard.findDepositor', this.state.address, (error, result) => {
            if (error) {
                console.warn(error);
                this.setState({
                    loading: true,
                    HARDDeposits: undefined
                })
            }
            else if (result) {
                this.setState({
                    HARDDeposits: result,
                    loading: false,
                    hasHARDDeposit: true
                })
            }
        })
    }

    updateBorrows() {
        Meteor.call('hard.findBorrower', this.state.address, (error, result) => {
            if (error) {
                console.warn(error);
                this.setState({
                    loading: true,
                    HARDBorrows: undefined
                })
            }
            else if (result) {
                this.setState({
                    HARDBorrows: result,
                    loading: false,
                    hasHARDBorrows: true
                })
            }
        })
    }

    render() {
        if (this.state.loading) {
            return <div id="account">
                <h1 className="d-none d-lg-block"><T>accounts.accountDetails</T></h1>
                <Spinner type="grow" color="primary" />
            </div>
        }
        else if (this.state.accountExists) {
            return <div id="account">
                <Helmet>
                    <title>Account Details of {this.state.address} | The Big Dipper</title>
                    <meta name="description" content={"Account Details of " + this.state.address} />
                </Helmet>
                <SentryBoundary>
                    <Row>
                        <Col md={3} xs={12}><h1 className="d-none d-lg-block"><T>accounts.accountDetails</T></h1></Col>
                        <Col md={9} xs={12} className="text-md-right"><ChainStates denom={this.state.denom} /></Col>
                    </Row>
                    <Row>
                        <Col><h3 className="text-primary"><AccountCopy address={this.state.address} /></h3></Col>
                    </Row>
                </SentryBoundary>
                <SentryBoundary><Row>
                    <Col><Card>
                        <CardHeader>
                            Balance
                            <div className="shareLink float-right">{this.renderShareLink()}</div>
                        </CardHeader>
                        <CardBody><br />
                            <Row className="account-distributions">
                                <Col xs={12}>
                                    <Progress multi>
                                        <Progress bar className="available" value={this.findValue(this.state.available, coin1) * this.state.price / this.state.totalValueInUSD * 100} />
                                        <Progress bar className="delegated" value={this.findValue(this.state.delegated, coin1) * this.state.price / this.state.totalValueInUSD * 100} />
                                        <Progress bar className="unbonding" value={this.findValue(this.state.unbonding, coin1) * this.state.price / this.state.totalValueInUSD * 100} />
                                        <Progress bar className="rewards" value={this.findValue(this.state.rewards, coin1) * this.state.price / this.state.totalValueInUSD * 100} />
                                        <Progress bar className="commission" value={this.findValue(this.state.commission, coin1) * this.state.price / this.state.totalValueInUSD * 100} />
                                        <Progress bar className="available_2nd" value={this.findValue(this.state.available, coin2) * this.state.BNB_USD_Price / this.state.totalValueInUSD * 100} />
                                        <Progress bar className="rewards_2nd" value={this.findValue(this.state.rewards, coin2) * this.state.BNB_USD_Price / this.state.totalValueInUSD * 100} />
                                        <Progress bar className="commission_2nd" value={this.findValue(this.state.commission, coin2) * this.state.BNB_USD_Price / this.state.totalValueInUSD * 100} />
                                        <Progress bar className="available_3rd" value={this.findValue(this.state.available, coin3) * this.state.USDX_Price / this.state.totalValueInUSD * 100} />
                                        <Progress bar className="rewards_3rd" value={this.findValue(this.state.rewards, coin3) * this.state.USDX_Price / this.state.totalValueInUSD * 100} />
                                        <Progress bar className="commission_3rd" value={this.findValue(this.state.commission, coin3) * this.state.USDX_Price / this.state.totalValueInUSD * 100} />
                                        <Progress bar className="available_4th" value={this.findValue(this.state.available, coin4) * this.state.HARD_USD_Price / this.state.totalValueInUSD * 100} />
                                        <Progress bar className="rewards_4th" value={this.findValue(this.state.rewards, coin4) * this.state.HARD_USD_Price / this.state.totalValueInUSD * 100} />
                                        <Progress bar className="commission_4th" value={this.findValue(this.state.commission, coin4) * this.state.HARD_USD_Price / this.state.totalValueInUSD * 100} />
                                    </Progress>
                                </Col>
                            </Row>
                            <Row>
                                <Col xs={2} md={1} >
                                    <Row>
                                        <Col xs={12} className="label text-nowrap"><T>accounts.available</T></Col>
                                    </Row>
                                    <Row>
                                        <Col xs={12} className="label text-nowrap"><T>accounts.delegated</T></Col>
                                    </Row>
                                    <Row>
                                        <Col xs={12} className="label text-nowrap"><T>accounts.unbonding</T></Col>
                                    </Row>
                                    <Row>
                                        <Col xs={12} className="label text-nowrap"><T>accounts.rewards</T></Col>
                                    </Row>
                                    {this.state.commission ? <Row>
                                        <Col xs={12} className="label text-nowrap"><T>validators.commission</T></Col>
                                    </Row> : null}
                                </Col>
                                <Col xs={3} md={2}>
                                    <Row>
                                        <Col xs={12} className="value text-left "> <div className="available infinity" />{this.findCoin(this.state.available, coin1)}</Col>
                                    </Row>
                                    <Row>
                                        <Col xs={12} className="value text-left"><div className="delegated infinity" />{this.findCoin(this.state.delegated, coin1)}</Col>
                                    </Row>
                                    <Row>
                                        <Col xs={12} className="value text-left"><div className="unbonding infinity" />{this.findCoin(this.state.unbonding, coin1)}</Col>
                                    </Row>
                                    <Row>
                                        <Col xs={12} className="value text-left"><div className="rewards infinity" />{this.findCoin(this.state.rewards, coin1)}</Col>
                                    </Row>
                                    {this.state.commission ? <Row>
                                        <Col xs={12} className="value text-left"><div className="commission infinity" />{this.findCoin(this.state.commission, coin1)}</Col>
                                    </Row> : null}
                                </Col>
                                <Col xs={3} md={2}>

                                    <Row>
                                        <Col xs={12} className="value text-left"> <div className="available_2nd infinity" />{this.findCoin(this.state.available, coin2)}</Col>
                                    </Row>
                                    <Row>
                                        <Col xs={12} className="value text-left"><div className="infinity" />{'  '}</Col>
                                    </Row>
                                    <Row>
                                        <Col xs={12} className="value text-left"><div className="infinity" />{' '}</Col>
                                    </Row>
                                    <Row>
                                        <Col xs={12} className="value text-left"><div className="rewards_2nd infinity" />{this.findCoin(this.state.rewards, coin2)}</Col>
                                    </Row>
                                    {this.state.commission ? <Row>
                                        <Col xs={12} className="value text-left"><div className="commission_2nd infinity" />{this.findCoin(this.state.commission, coin2)}</Col>
                                    </Row> : null}
                                </Col>
                                <Col xs={3} md={2} >

                                    <Row>
                                        <Col xs={12} className="value text-left"> <div className="available_3rd infinity" />{this.findCoin(this.state.available, coin3)}</Col>
                                    </Row>
                                    <Row>
                                        <Col xs={12} className="value text-left"><div className="infinity" />{'  '}</Col>
                                    </Row>
                                    <Row>
                                        <Col xs={12} className="value text-left"><div className="infinity" />{'  '}</Col>
                                    </Row>
                                    <Row>
                                        <Col xs={12} className="value text-left"><div className="rewards_3rd infinity" />{this.findCoin(this.state.rewards, coin3)}</Col>
                                    </Row>
                                    {this.state.commission ? <Row>
                                        <Col xs={12} className="value text-left
                                        "><div className="commission_3rd infinity" />{this.findCoin(this.state.commission, coin3)}</Col>
                                    </Row> : null}
                                </Col>

                                <Col xs={3} md={2} >

                                    <Row>
                                        <Col xs={12} className="value text-left"> <div className="available_4th infinity" />{this.findCoin(this.state.available, coin4)}</Col>
                                    </Row>
                                    <Row>
                                        <Col xs={12} className="value text-left"><div className="infinity" />{'  '}</Col>
                                    </Row>
                                    <Row>
                                        <Col xs={12} className="value text-left"><div className="infinity" />{'  '}</Col>
                                    </Row>
                                    <Row>
                                        <Col xs={12} className="value text-left"><div className="rewards_4th infinity" />{this.findCoin(this.state.rewards, coin4)}</Col>
                                    </Row>
                                    {this.state.commission ? <Row>
                                        <Col xs={12} className="value text-left
                                        "><div className="commission_4th infinity" />{this.findCoin(this.state.commission, coin4)}</Col>
                                    </Row> : null}
                                </Col>

                                <Col xs={3} className="total d-flex flex-column justify-content-end">
                                    <Row >
                                        <Col xs={12} className="label  text-right"><div className="infinity" /><T>accounts.total</T></Col>
                                    </Row>
                                    <Row>
                                        <Col xs={12} className="value text-right">{this.findCoin(this.state.total, coin1)}</Col>
                                        <Col xs={12} className="dollar-value text-right text-secondary">~{numbro((this.findValue(this.state.total, coin1)) * this.state.price).format("$0,0.0000a")} ({numbro(this.state.price).format("$0,0.00")}/{Meteor.settings.public.coins[0].displayName})</Col>
                                    </Row>
                                    <Row>
                                        <Col xs={12} className="value-2 text-right">{this.findCoin(this.state.total, coin2)}</Col>
                                        <Col xs={12} className="dollar-value-2 text-right text-secondary">~{numbro((this.findValue(this.state.total, coin2)) * this.state.BNB_USD_Price).format("$0,0.0000a")} ({numbro(this.state.BNB_USD_Price).format("$0,0.00")}/{Meteor.settings.public.coins[1].displayName})</Col>
                                    </Row>
                                    <Row>
                                        <Col xs={12} className="value-3 text-right">{this.findCoin(this.state.total, coin4)}</Col>
                                        <Col xs={12} className="dollar-value-3 text-right text-secondary">~{numbro((this.findValue(this.state.total, coin4)) * this.state.HARD_USD_Price).format("$0,0.0000a")} ({numbro(this.state.HARD_USD_Price).format("$0,0.00")}/{Meteor.settings.public.coins[8].displayName})</Col>
                                    </Row>
                                    <Row>
                                        <Col xs={12} className="value-4 text-right">{this.findCoin(this.state.total, coin3)}</Col>
                                        <Col xs={12} className="dollar-value-4 text-right text-secondary">~{numbro((this.findValue(this.state.total, coin3)) * this.state.USDX_Price).format("$0,0.0000a")} ({numbro(this.state.USDX_Price).format("$0,0.00")}/{Meteor.settings.public.coins[5].displayName})</Col>
                                    </Row>
                                   
                                </Col>
                                <Col xs={12} className="total d-flex flex-column justify-content-end text-nowrap pt-3">
                                    {this.state.user ? <Row>
                                        <Col xs={12} >
                                            {this.state.user === this.state.address ? <ClaimSwapButton validator={this.props.validator} address={this.state.operatorAddress} /> : null}
                                            {this.state.user === this.state.address ? <WithdrawButton rewards={this.state.rewards} commission={this.state.commission} address={this.state.operatorAddress} denom={this.state.denom} /> : null}
                                            <TransferButton address={this.state.address} denom={this.state.denom} total={this.state.total} /></Col>
                                    </Row> : null}
                                </Col>
                            </Row>

                        </CardBody>
                    </Card></Col>
                </Row></SentryBoundary>
                <Row>
                    <SentryBoundary><Col md={6}>
                        <Card>
                            <CardHeader>
                                Staking
                            </CardHeader>
                            <CardBody>
                                <Nav tabs className="mb-2">
                                    <NavItem>
                                        <NavLink
                                            className={classnames({ active: this.state.bondActiveTab === 'delegations' })}
                                            onClick={() => { this.toggleBond('delegations'); }}
                                        >
                                            Delegations
                                        </NavLink>
                                    </NavItem>
                                    <NavItem>
                                        <NavLink
                                            className={classnames({ active: this.state.bondActiveTab === 'unbondings' })}
                                            onClick={() => { this.toggleBond('unbondings'); }}
                                        >
                                            Unbondings
                                        </NavLink>
                                    </NavItem>
                                    <NavItem>
                                        <NavLink
                                            className={classnames({ active: this.state.bondActiveTab === 'redelegations' })}
                                            onClick={() => { this.toggleBond('redelegations'); }}
                                        >
                                            Redelegations
                                        </NavLink>
                                    </NavItem>
                                </Nav>
                                <TabContent activeTab={this.state.bondActiveTab}>
                                    <TabPane tabId="delegations">
                                        <Delegations
                                            address={this.state.address}
                                            delegations={this.state.delegations}
                                            reward={this.state.reward}
                                            denom={this.state.denom}
                                            rewardsForEachDel={this.state.rewardsForEachDel}
                                        />
                                    </TabPane>
                                    <TabPane tabId="unbondings">
                                        <Unbondings
                                            address={this.state.address}
                                            unbonding={this.state.unbondingDelegations}
                                        />
                                    </TabPane>
                                    <TabPane tabId="redelegations">
                                        <Redelegations
                                            address={this.state.address}
                                            redelegations={this.state.redelegations}
                                        />
                                    </TabPane>
                                </TabContent>
                            </CardBody>
                        </Card>
                    </Col></SentryBoundary>
                    <SentryBoundary><Col md={6}>
                        <Card>
                            <CardHeader>CDP</CardHeader>
                            <CardBody className="cdp-body">
                                <Nav tabs className="mb-2">
                                    <NavItem>
                                        <NavLink
                                            className={classnames({ active: this.state.cdpActiveTab === 'cdp-create' })}
                                            onClick={() => { this.toggleCDP('cdp-create'); }}
                                        >
                                            <span className="cdp-logo">Create CDP</span>
                                        </NavLink>
                                    </NavItem>
                                    {this.state.hasActiveCDP ?
                                        <NavItem>
                                            <NavLink
                                                className={classnames({ active: this.state.cdpActiveTab === 'cdp-active' })}
                                                onClick={() => { this.toggleCDP('cdp-active'); }}
                                            >
                                                <span className="cdp-logo ">
                                                   CDPs </span>
                                            </NavLink>
                                        </NavItem> : null}
                                    {this.state.hasHARDBorrows || this.state.hasHARDDeposit ?
                                        <NavItem>
                                            <NavLink
                                                className={classnames({ active: this.state.cdpActiveTab === 'cdp-hard' })}
                                                onClick={() => { this.toggleCDP('cdp-hard'); }}
                                            >
                                                <span className="cdp-logo ">
                                                    HARD </span>
                                            </NavLink>
                                        </NavItem> : null}
                                    {this.state.hasIncentive ?
                                        <NavItem>
                                            <NavLink
                                                className={classnames({ active: this.state.cdpActiveTab === 'cdp-incentive' })}
                                                onClick={() => { this.toggleCDP('cdp-incentive'); }}
                                            >
                                                <span className="cdp-logo ">
                                                    Incentive  <i className="material-icons">
                                                        redeem
                                                    </i></span>
                                            </NavLink>
                                        </NavItem> : null}
                                </Nav>
                                <TabContent activeTab={this.state.cdpActiveTab}>
                                    <TabPane tabId="cdp-create">
                                        <CDP
                                            owner={this.state.address}
                                            collateralType={this.state.activeSubtabDenomType}
                                            collateralDenom={this.state.activeSubtabDenom}
                                            collateralParams={this.state.collateralParams}
                                            debtParams={this.state.debtParams} 
                                            user={this.state.user}
                                            createCDP={true}
                                            BNB_USD_Price={this.state.BNB_USD_Price}
                                            BNB_USD_30_Price={this.state.BNB_USD_30_Price}
                                            HARD_USD_Price={this.state.HARD_USD_Price}
                                        />
                                    </TabPane>


                                    <TabPane tabId="cdp-active">
                                        <Row className="denom-list">
                                            {this.state.hasActiveCDP ?
                                                this.state.collateralParams.map((denom, index) => {
                                                    return (   
                                                        <Nav tabs className="mb-2" key={index}>

                                                            <NavItem key={index} style={{listStyle: "none", display: "flex", flexWrap: "wrap"}} >
                                                                <NavLink
                                                                    className={classnames({ active: this.state.activeSubtab === `cdp-${denom.type}` })}
                                                                    onClick={() => { this.toggleCDPSutab(`cdp-${denom.type}`, denom.denom, denom.type); }}
                                                                >
                                                                    {denom.denom === 'ukava' ? <span className="cdp-logo denom"><img src="/img/KAVA-symbol.svg" className="cdp-logo-image"/> {denom.type.toUpperCase()} </span> : null}
                                                                    {denom.denom === 'xrpb' ? <span className="cdp-logo denom"><img src="/img/XRP-symbol.svg" className="cdp-logo-image" /> {denom.type.toUpperCase()} </span> : null}
                                                                    {denom.denom != 'ukava' && denom.denom != 'xrpb' ? <span className="cdp-logo denom"><img src={`/img/${denom.denom.toUpperCase()}-symbol.svg`} className="cdp-logo-image" /> {denom.type.toUpperCase()} </span> : null}
                                                                </NavLink>
                                                            </NavItem>
                                                        </Nav>) }) : null}
                                        </Row>
                                        {this.state.hasActiveCDP ?
                                            this.state.collateralParams.map((denom, index )=> {
                                                return (  
                                                    <TabContent activeTab={this.state.activeSubtab} key={index}>
                                                        <TabPane tabId={`cdp-${denom.type}`}>
                                                            <CDP
                                                                owner={this.state.address}
                                                                collateralType={this.state.activeSubtabDenomType}
                                                                collateralDenom={this.state.activeSubtabDenom}
                                                                collateralParams={this.state.collateralParams} 
                                                                debtParams={this.state.debtParams} 
                                                                user={this.state.user}
                                                                createCDP={false}
                                                            />
                                                        </TabPane>
                                                    </TabContent>) 
                                            }) : null}
                                    </TabPane>

                                    <TabPane tabId="cdp-hard">
                                        <Nav tabs className="mb-2">
                                            <NavItem>
                                                <NavLink
                                                    className={classnames({ active: this.state.activeHARDTab === 'hard-deposits' })}
                                                    onClick={() => { this.toggleHARDTab('hard-deposits'); }}
                                                >
                                                    <span className="cdp-logo"><img src="/img/HARD-symbol.svg" className="cdp-logo-image"/> Deposits</span>
                                                </NavLink>
                                            </NavItem>
                                            <NavItem>
                                                <NavLink
                                                    className={classnames({ active: this.state.activeHARDTab === 'hard-borrows' })}
                                                    onClick={() => { this.toggleHARDTab('hard-borrows'); }}
                                                >
                                                    <span className="cdp-logo"><img src="/img/HARD-symbol.svg" className="cdp-logo-image"/> Borrows</span>
                                                </NavLink>
                                            </NavItem>
                                        </Nav>
                                        <TabContent activeTab={this.state.activeHARDTab} >
                                            <TabPane tabId={`${this.state.activeHARDTab}`}>
                                                {this.state.activeHARDTab === 'hard-deposits' ? 
                                                // HARD Deposit list
                                                <>
                                                        <Row className="hard-deposit-list">
                                                            {this.state.hasHARDDeposit && this.state.HARDDeposits ?
                                                                this.state.HARDDeposits?.amount.map((denom, index) => {
                                                                    return (
                                                                        <Nav tabs className="mb-2" key={index}>

                                                                            <NavItem key={index} style={{ listStyle: "none", display: "flex", flexWrap: "wrap" }} >
                                                                                <NavLink
                                                                                    className={classnames({ active: this.state.activeHARDSubtab === `${denom.denom}` })}
                                                                                    onClick={() => { this.toggleHARDSubtab(`${denom.denom}`); }}
                                                                                >
                                                                                    {denom.denom === 'ukava' ? <span className="cdp-logo denom"><img src="/img/KAVA-symbol.svg" className="cdp-logo-image" /> {denom.denom.toUpperCase()} </span> : null}
                                                                                    {denom.denom === 'xrpb' ? <span className="cdp-logo denom"><img src="/img/XRP-symbol.svg" className="cdp-logo-image" /> {denom.denom.toUpperCase()} </span> : null}
                                                                                    {denom.denom != 'ukava' && denom.denom != 'xrpb' ? <span className="cdp-logo denom"><img src={`/img/${denom.denom.toUpperCase()}-symbol.svg`} className="cdp-logo-image" /> {denom.denom.toUpperCase()} </span> : null}
                                                                                </NavLink>
                                                                            </NavItem>
                                                                        </Nav>)
                                                                }) : null}
                                                        </Row>

                                                        {this.state.hasHARDDeposit && this.state.HARDDeposits ?
                                                             this.state.HARDDeposits?.amount.map((denom, index) => {
                                                                 return (
                                                                     <TabContent activeTab={this.state.activeHARDSubtab} key={index}>
                                                                         <TabPane tabId={`${denom.denom}`}>
                                                                             <HARD
                                                                                 address={this.state.address}
                                                                                 collateralDenom={this.state.activeHARDSubtab}
                                                                                 user={this.state.user}
                                                                                 activeTab={this.state.activeHARDTab}
                                                                             />
                                                                         </TabPane>
                                                                     </TabContent>)
                                                             }) : <HARD
                                                                 address={this.state.address}
                                                                 collateralDenom={this.state.activeHARDSubtab}
                                                                 user={this.state.user}
                                                                 activeTab={this.state.activeHARDTab}
                                                             /> }
                                                    </>
                                                    : null }
                                                {this.state.activeHARDTab === 'hard-borrows' ?
                                                    // HARD Borrows List
                                                    <>
                                                        <Row className="hard-borrow-list">
                                                            {this.state.hasHARDBorrows === true && this.state.HARDBorrows ?
                                                                this.state.HARDBorrows?.amount.map((denom, index) => {
                                                                    return (
                                                                        <Nav tabs className="mb-2" key={index}>

                                                                            <NavItem key={index} style={{ listStyle: "none", display: "flex", flexWrap: "wrap" }} >
                                                                                <NavLink
                                                                                    className={classnames({ active: this.state.activeHARDSubtab === `${denom.denom}` })}
                                                                                    onClick={() => { this.toggleHARDSubtab(`${denom.denom}`); }}
                                                                                >
                                                                                    {denom.denom === 'ukava' ? <span className="cdp-logo denom"><img src="/img/KAVA-symbol.svg" className="cdp-logo-image" /> {denom.denom.toUpperCase()} </span> : null}
                                                                                    {denom.denom === 'xrpb' ? <span className="cdp-logo denom"><img src="/img/XRP-symbol.svg" className="cdp-logo-image" /> {denom.denom.toUpperCase()} </span> : null}
                                                                                    {denom.denom != 'ukava' && denom.denom != 'xrpb' ? <span className="cdp-logo denom"><img src={`/img/${denom.denom.toUpperCase()}-symbol.svg`} className="cdp-logo-image" /> {denom.denom.toUpperCase()} </span> : null}
                                                                                </NavLink>
                                                                            </NavItem>
                                                                        </Nav>)
                                                                }) : null}
                                                        </Row>

                                                        {this.state.hasHARDBorrows === true && this.state.HARDBorrows ?
                                                            this.state.HARDBorrows?.amount.map((denom, index) => {
                                                                return (
                                                                    <TabContent activeTab={this.state.activeHARDSubtab} key={index}>
                                                                        <TabPane tabId={`${denom.denom}`}>
                                                                            <HARD
                                                                                address={this.state.address}
                                                                                collateralDenom={this.state.activeHARDSubtab}
                                                                                user={this.state.user}
                                                                                activeTab={this.state.activeHARDTab}
                                                                            />
                                                                        </TabPane>
                                                                    </TabContent>)
                                                            }) : <HARD
                                                                address={this.state.address}
                                                                collateralDenom={this.state.activeHARDSubtab}
                                                                user={this.state.user}
                                                                activeTab={this.state.activeHARDTab}

                                                            />}
                                                    </> : null}
                                            </TabPane>
                                        </TabContent>

                                    </TabPane>

                                    <TabPane tabId="cdp-incentive">
                                        <Row className="incentive-list">
                                            {this.state.hasIncentive ?
                                                  <>
                                                        <Nav tabs className="mb-2">
                                                            <NavItem style={{ listStyle: "none", display: "flex", flexWrap: "wrap" }} >
                                                                <NavLink
                                                                    className={classnames({ active: this.state.activeIncentiveSubtab === `incentive-hard` })}
                                                                    onClick={() => { this.toggleIncentiveSutab(`incentive-hard`); }}
                                                                >
                                                                    <span className="cdp-logo denom"><img src="/img/HARD-symbol.svg" className="cdp-logo-image"/>HARD </span>
                                                                </NavLink>
                                                            </NavItem>
                                                        </Nav>
                                                        <Nav tabs className="mb-2">

                                                            <NavItem style={{ listStyle: "none", display: "flex", flexWrap: "wrap" }} >
                                                                <NavLink
                                                                    className={classnames({ active: this.state.activeIncentiveSubtab === `incentive-usdx-minting` })}
                                                                    onClick={() => { this.toggleIncentiveSutab(`incentive-usdx-minting`); }}
                                                                >
                                                                    <span className="cdp-logo denom"><img src="/img/USDX-symbol.svg" className="cdp-logo-image"/>  USDX Minting </span>
                                                                </NavLink>
                                                            </NavItem>
                                                        </Nav>
                                                        </>
                                                : null}
                                        </Row>

                                        <TabContent activeTab={this.state.activeIncentiveSubtab} >
                                            <TabPane tabId={`${this.state.activeIncentiveSubtab}`}>
                                                <Incentive
                                                    owner={this.state.address}
                                                    user={this.state.user}
                                                    incentiveType={this.state.activeIncentiveSubtab}
                                                />
                                            </TabPane>
                                        </TabContent>
                                    </TabPane>
                                    
                                </TabContent>
                            </CardBody>
                        </Card>

                    </Col></SentryBoundary>
                </Row>
                <Row>
                    <SentryBoundary>
                        <Col>
                            <AccountTransactions delegator={this.state.address} denom={this.state.denom} limit={100} />
                        </Col>
                    </SentryBoundary>
                </Row>
            </div>
        }

        else {
            return <SentryBoundary ><div id="account">
                <h1 className="d-none d-lg-block"><T>accounts.accountDetails</T></h1>
                <p><T>acounts.notFound</T></p>
            </div>
            </SentryBoundary>
        }
    }

}