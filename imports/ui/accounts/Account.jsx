import React, { Component, useState } from 'react';
import { Spinner, 
    TabContent, TabPane, 
    Nav, NavItem, NavLink, 
    Row, Col, 
    Card, CardHeader, CardBody, 
    Progress, 
    UncontrolledDropdown, DropdownMenu, DropdownToggle, DropdownItem,
    Badge, Button 
} from 'reactstrap';
import classnames from 'classnames';
import numbro from 'numbro';
import AccountCopy from '../components/AccountCopy.jsx';
import LinkIcon from '../components/LinkIcon.jsx';
import Delegations from './Delegations.jsx';
import Unbondings from './Unbondings.jsx';
import AccountTransactions from '../components/TransactionsContainer.js';
import ChainStates from '../components/ChainStatesContainer.js'
import { Helmet } from 'react-helmet';
import { WithdrawButton, TransferButton, ClaimSwapButton} from '../ledger/LedgerActions.jsx';
import CDP from '../cdp/CDP.jsx';
import i18n from 'meteor/universe:i18n';
import Coin from '/both/utils/coins.js';

const T = i18n.createComponent();
let timer = 0;

const cloneDeep = require('lodash/cloneDeep');

export default class AccountDetails extends Component{
    constructor(props){
        super(props);
        this.state = {
            address: props.match.params.address,
            loading: true,
            accountExists: false,
            available: [],
            delegated: 0,
            unbonding: 0,
            rewards: [],
            reward: [],
            total: [],
            price: 0,
            user: localStorage.getItem(CURRENTUSERADDR),
            commission: [],
            denom: '',
            rewardsForEachDel: [],
            rewardDenomType: [],
            bondActiveTab: 'delegations',
            cdpActiveTab: 'cdp-bnb',
            cdpID: 0,
            cdpOwner: '',
            cdpCollateral: [],
            cdpPrincipal: [],
            cdpAccumulatedFees: [],
            cdpFeesUpdated: 0,
            cdpCollateralValue: 0,
            cdpCollateralizationRatio: 0
        }
    }

    static getDerivedStateFromProps(props, state) {
        if (state.user !== localStorage.getItem(CURRENTUSERADDR)) {
            return {user: localStorage.getItem(CURRENTUSERADDR)};
        }
        return null;
    }

    getBalance(){

        let numRewards = new Object();
        
        Meteor.call('coinStats.getStats', (error, result) => {
            if (result){
                this.setState({
                    price: result.usd
                })
            }
        });
        Meteor.call('accounts.getBalance', this.props.match.params.address, (error, result) => {
            if (error){
                console.warn(error);
                this.setState({
                    loading:false
                })
            }

            if (result){

                if (result.available && result.available.length > 0){

                    this.setState({
                        available: cloneDeep(result.available),
                        denom: Coin.StakingCoin.denom,
                        total: cloneDeep(result.available)
                        
                    })
                    
                }

                else{
                    
                    let avail = [{denom:"ukava",amount:"0"}]
                    this.setState({
                        available: avail,
                        denom: Coin.StakingCoin.denom,
                        total: avail
                        
                    })
                }

                this.setState({delegations: result.delegations || []})
                if (result.delegations && result.delegations.length > 0){
                    result.delegations.forEach((delegation, i) => {
                        const amount = delegation.balance.amount || delegation.balance;
                        this.setState({
                            delegated: this.state.delegated+parseFloat(delegation.balance.amount),
                            //total: this.state.total+parseFloat(delegation.balance.amount)
                        })
                    }, this)

                    this.state.total.forEach((total, i) => {
                    if(total.denom === Meteor.settings.public.bondDenom )
                        this.state.total[i].amount = parseFloat(this.state.total[i].amount) + parseFloat(this.state.delegated);
                    }, this)

                    this.setState({
                             total: [...this.state.total]
                         })

                }
    
                this.setState({unbondingDelegations: result.unbonding || []})
                if (result.unbonding && result.unbonding.length > 0){
                    result.unbonding.forEach((unbond, i) => {
                        unbond.entries.forEach((entry, j) => {
                            this.setState({
                                unbonding: this.state.unbonding+parseFloat(entry.balance),
                            })
                            , this})
                    }, this)

                    this.state.total.forEach((total, i) => {
                        if(total.denom === Meteor.settings.public.bondDenom )
                            this.state.total[i].amount = parseFloat(this.state.total[i].amount) + parseFloat(this.state.unbonding);
                                        
            }, this)

                 this.setState({
                         total: [...this.state.total]
                     })

            }


                if(result.total_rewards && result.total_rewards.length > 0)
                {
                    const totalRewards  = cloneDeep(result.total_rewards);
                    totalRewards > 0 ?
                    totalRewards.forEach((rewardNum, i) => {
                       if(rewardNum.denom === this.state.total[i].denom)
                        this.state.total[i].amount = parseFloat(this.state.total[i].amount) + parseFloat(rewardNum.amount);                       
                    }, this) : null 
                    this.setState({
                        rewards: [...totalRewards],
                        total: [...this.state.total]
                    })
    
            }
 

                if (result.rewards && result.rewards.length > 0){
                    
                    for(let c = 0; c < result.rewards.length; c++){
                        if(result.rewards[c].reward != null){
                            numRewards[result.rewards[c]["validator_address"]] = result.rewards[c].reward;
                        }
                    }
                        for(let e in numRewards){
                            for(let f in numRewards[e]){
                                 if(this.state.denom === numRewards[e][f].denom){
                                    this.setState({
                                        rewardDenomType: numRewards[e][f].denom,
                                        rewardsForEachDel: numRewards,
                                    })
                                }
                                
                            }
                        }   
                }
 
                if (result.commission){                   
                    result.commission.forEach((commissions, i) => {
                        const commissionAmount = commissions;
                        this.state.total[i].denom ?
                        (commissions.denom === this.state.total[i].denom) ?
                            this.state.total[i].amount = parseFloat(this.state.total[i].amount) + parseFloat(commissions.amount) : this.state.total[i].amount = [...commissionAmount] : null
                        
                        
                            
                        

                        this.setState({
                            operator_address: result.operator_address,
                            commission: [...this.state.commission, commissionAmount],
                            total: [...this.state.total]
                        })
                    }, this) 

                }


                this.setState({
                    loading:false,
                    accountExists: true
                })
            }
        })
    

     }

    componentDidMount(){
        this.getBalance();

        timer = Meteor.setInterval(() => {
            this.getBalance();
        },10000)
    }

    componentDidUpdate(prevProps){
        if (this.props.match.params.address !== prevProps.match.params.address){
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
                rewardsForEachDel: [],
                rewardDenomType: [],
                cdpID: 0,
                cdpOwner: '',
                cdpCollateral: [],
                cdpPrincipal: [],
                cdpAccumulatedFees: [],
                cdpFeesUpdated: 0,
                cdpCollateralValue: 0,
                cdpCollateralizationRatio: 0
            }, () => {
                this.getBalance();
            })
        }
    }

    handleCoinSwitch = (type,e) => {
        e.preventDefault();
        switch (type){
        case type:
            this.setState({
                denom: type
            })
            break;
        }
    }
   
    displayStakingDenom(denomType){
        let findCoinType = Meteor.settings.public.coins.find(({denom}) => denom === denomType);
        let currentCoinType = findCoinType ? findCoinType.displayName : null;
        return currentCoinType
    }

    renderDropDown() {
        return <UncontrolledDropdown direction='down' size="sm" className='account-dropdown'>
             <DropdownToggle caret>
             &nbsp;{this.displayStakingDenom(this.state.denom)}
             </DropdownToggle>
             <DropdownMenu>
             {this.state.available.map((option, k) => (
                <DropdownItem key={k} onClick={(e) => this.handleCoinSwitch(option.denom, e)}>{this.displayStakingDenom(option.denom)}</DropdownItem>
                ))}
             </DropdownMenu>
         </UncontrolledDropdown>
     }
 
    renderShareLink() {
        let primaryLink = `/account/${this.state.address}`
        let otherLinks = [
            {label: 'Transfer', url: `${primaryLink}/send`}
        ]
        return <LinkIcon link={primaryLink} otherLinks={otherLinks} />
    }



    findCoin(coins){
        let finder = (coins).find(({denom}) => denom === this.state.denom);
        let coinFinder = finder ? new Coin(finder.amount, finder.denom).toString(4) : '0.0000 ' + this.state.denom;
        return coinFinder
    }

    findValue(params){
        let current = (params).find(({denom}) => denom === this.state.denom);
        let currentTotal = current ? current.amount : null;
        return currentTotal
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

    createCDP = (callback) =>{
 
            Meteor.call('create.cdp', {from: this.state.user}, this.getPath(), (err, res) =>{
                if (res){
                    if (this.props.address) {
                        res.value.msg.push({
                            type: 'cosmos-sdk/MsgWithdrawValidatorCommission',
                            value: { validator_address: this.props.address }
                        })
                    }
                    callback(res, res)
                }
                else {
                    this.setState({
                        loading: false,
                        simulating: false,
                        errorMessage: 'something went wrong'
                    })
                }
            })
        }
    
    


    render(){


        let findCurrentCoin = this.state.total.find(({denom}) => denom === this.state.denom)
        let currentCoinTotal = findCurrentCoin ? findCurrentCoin.amount : null;
          
        if (this.state.loading){
            return <div id="account">
                <h1 className="d-none d-lg-block"><T>accounts.accountDetails</T></h1>
                <Spinner type="grow" color="primary" />
            </div>
        }
        else if (this.state.accountExists){
            return <div id="account">
                <Helmet>
                    <title>Account Details of {this.state.address} on Cosmos Hub | The Big Dipper</title>
                    <meta name="description" content={"Account Details of "+this.state.address+" on Cosmos Hub"} />
                </Helmet>
                <Row>
                    <Col md={3} xs={12}><h1 className="d-none d-lg-block"><T>accounts.accountDetails</T></h1></Col>
                    <Col md={9} xs={12} className="text-md-right"><ChainStates denom ={this.state.denom} /></Col>
                </Row>
                <Row>
                    <Col><h3 className="text-primary"><AccountCopy address={this.state.address} /></h3></Col>
                </Row>
                <Row>
                    <Col><Card>
                        <CardHeader>
                            Balance
                            <div className="shareLink float-right">{this.renderShareLink()}</div>
                           {(this.state.available.length > 1) ? <div className="coin-dropdown float-right"><h5>Select Coin:</h5> {this.renderDropDown()}</div> : null}
                        </CardHeader>
                        <CardBody><br/> 
                            <Row className="account-distributions">
                                <Col xs={12}>
                                    <Progress multi>
                                        <Progress bar className="available" value={this.findValue(this.state.available)/currentCoinTotal*100} />
                                        <Progress bar className="delegated" value={this.state.delegated/currentCoinTotal*100} />
                                        <Progress bar className="unbonding" value={this.state.unbonding/currentCoinTotal*100} />
                                        <Progress bar className="rewards" value={this.findValue(this.state.rewards)/currentCoinTotal*100} />
                                        <Progress bar className="commission" value={this.findValue(this.state.commission)/currentCoinTotal*100} />
                                    </Progress>
                                </Col>
                            </Row>
                            <Row>
                                <Col md={6} lg={8}>
                                    <Row>
                                        <Col xs={4} className="label text-nowrap"><div className="available infinity" /><T>accounts.available</T></Col>
                                        <Col xs={8} className="value text-right">{this.findCoin(this.state.available)}</Col>
                                    </Row>
                                    <Row>
                                        <Col xs={4} className="label text-nowrap"><div className="delegated infinity" /><T>accounts.delegated</T></Col>
                                        <Col xs={8} className="value text-right">{new Coin(this.state.delegated).toString(4)}</Col>
                                    </Row>
                                    <Row>
                                        <Col xs={4} className="label text-nowrap"><div className="unbonding infinity" /><T>accounts.unbonding</T></Col>
                                        <Col xs={8} className="value text-right">{new Coin(this.state.unbonding).toString(4)}</Col>
                                    </Row>
                                    <Row>
                                        <Col xs={4} className="label text-nowrap"><div className="rewards infinity" /><T>accounts.rewards</T></Col>
                                        <Col xs={8} className="value text-right">{this.findCoin(this.state.rewards)}</Col>
                                    </Row>
                                    {this.state.commission?<Row>
                                        <Col xs={4} className="label text-nowrap"><div className="commission infinity" /><T>validators.commission</T></Col>
                                        <Col xs={8} className="value text-right">{this.findCoin(this.state.commission)}</Col>
                                    </Row>:null}
                                </Col>
                                <Col md={6} lg={4} className="total d-flex flex-column justify-content-end">
                                    {this.state.user?<Row>
                                        <Col xs={12}><TransferButton history={this.props.history} address={this.state.address} denom={this.state.denom}/></Col>
                                        {this.state.user===this.state.address?<Col xs={12}><WithdrawButton  history={this.props.history} rewards={this.state.rewards} commission={this.state.commission} address={this.state.operator_address} denom={this.state.denom}/></Col>:null}
                                        {this.state.user===this.state.address?<Col xs={12}><ClaimSwapButton validator={this.props.validator} address={this.state.operator_address} history={this.props.history}/></Col>:null}
                                    </Row>:null}
                                    <Row>
                                        <Col xs={4} className="label d-flex align-self-end"><div className="infinity" /><T>accounts.total</T></Col>
                                        <Col xs={8} className="value text-right">{this.findCoin(this.state.total)}</Col>
                                        <Col xs={12} className="dollar-value text-right text-secondary">~{numbro((this.findValue(this.state.total))/Coin.StakingCoin.fraction*this.state.price).format("$0,0.0000a")} ({numbro(this.state.price).format("$0,0.00")}/{Coin.StakingCoin.displayName})</Col>
                                    </Row>
                                </Col>
                            </Row>
                        </CardBody>
                    </Card></Col>
                </Row>
                <Row>
                    <Col md={6}>
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
                                        <Unbondings 
                                            address={this.state.address} 
                                            unbonding={this.state.unbondingDelegations}
                                        />
                                    </TabPane>
                                </TabContent>
                            </CardBody>
                        </Card>
                        
                    </Col>
                    <Col md={6}>
                        <Card>
                            <CardHeader>CDP</CardHeader>
                            <CardBody className="cdp-body">
                                <Nav tabs className="mb-2">
                                    <NavItem>
                                        <NavLink
                                            className={classnames({ active: this.state.cdpActiveTab === 'cdp-bnb' })}
                                            onClick={() => { this.toggleCDP('cdp-bnb'); }}
                                        >
                                            <span className="cdp-logo bnb">BNB</span>
                                        </NavLink>
                                    </NavItem>
                                </Nav> 
                                <TabContent activeTab={this.state.cdpActiveTab}>
                                    <TabPane tabId="cdp-bnb">
                                        <CDP 
                                            owner={this.state.address} 
                                            collateral='bnb' 
                                            total={this.state.total} 
                                            user={this.state.user}
                                        />
                                    </TabPane>
                                </TabContent>
                            </CardBody>
                        </Card>
                        
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <AccountTransactions delegator={this.state.address} denom={this.state.denom} limit={100}/>
                    </Col>
                </Row>
            </div>
        }
        else{
            return <div id="account">
                <h1 className="d-none d-lg-block"><T>accounts.accountDetails</T></h1>
                <p><T>acounts.notFound</T></p>
            </div>
        }
    }
}

