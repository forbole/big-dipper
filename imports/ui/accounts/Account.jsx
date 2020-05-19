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
import Redelegations from './Redelegations.jsx';
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
            denom: Coin.StakingCoin.denom,
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
            cdpCollateralizationRatio: 0,
            bnbPrice: 0,
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

                        //Reset the values to display only the latest data from the chain 
                        let getAvailableValue = [];
                        let getTotalValue = [];

                        getAvailableValue = cloneDeep(result.available)
                        getTotalValue = cloneDeep(result.available)


                        this.setState({
                        available: getAvailableValue,
                        total: getTotalValue
                        })    
                }
                
                

                else{
                    let setZeroAmount = [{denom:"ukava",amount: "0.00"}]
                    this.setState({
                        available: cloneDeep(setZeroAmount),
                        denom: Coin.StakingCoin.denom,
                        total: cloneDeep(setZeroAmount)
                        
                    })
                }


                this.setState({delegations: result.delegations || []})
                if (result.delegations && result.delegations.length > 0){
                    let delegatedValue = [{denom: "ukava", amount: "0.00"}];

                    result.delegations.forEach((unbond, i) => {
                        delegatedValue.forEach((entry, j) => {
                            delegatedValue[j].amount = parseFloat(delegatedValue[j].amount) +  parseFloat(unbond.balance.amount);
                            this.setState({
                                delegated: delegatedValue,
                            })

                            , this})
                    }, this)



                    
                    // for(let i in result.delegations){

                    //     result.delegations?
                    //     delegatedValue[i].amount = 0 :
                    //     delegatedValue[i].amount = 0
                    // }
                    // result.delegations.forEach((delegation, i) => {
                    //     delegatedValue[i].amount = parseFloat(delegatedValue[i].amount) +  parseFloat(delegation.balance.amount);
                    // }, this)
                    // this.setState({
                    //     delegated: delegatedValue,
                    // })
                    

                    if(this.state.total && this.state.total.length > 1){
                    let totalValue = cloneDeep(this.state.total);


                    this.state.delegated.forEach((delegated, i) => {
                        totalValue.forEach((el, i) => {
                        if(el.denom === delegated.denom  ){
                            el.amount = parseFloat(el.amount) + parseFloat(delegated.amount)
                        }

                        // else{
                        //     
                        //     totalValue[1] = rewards
                            
                        // }
                        this})
                }, this)

                this.setState({
                    total: totalValue,
                })
            }


                else{
                    let totalValue = cloneDeep(this.state.total);
                    for(let v in totalValue){
                        totalValue[v].amount = parseFloat(totalValue[v].amount) + parseFloat(this.state.delegated[v].amount)
                    }
                    this.setState({
                        total: totalValue,
                    })
                }                    
            }
                    

    
                this.setState({unbondingDelegations: result.unbonding || []})
                if (result.unbonding && result.unbonding.length > 0){
                    let unbondingValue = [{denom: "ukava", amount: "0.00"}];
                    result.unbonding.forEach((unbond, i) => {
                        unbond.entries.forEach((entry, j) => {
                            unbondingValue[i].amount = parseFloat(unbondingValue[i].amount) +  parseFloat(entry.balance);
                            this.setState({
                                unbonding: unbondingValue,
                            })
                            , this})
                    }, this)



                    if(this.state.total && this.state.total.length > 1){
                        let totalValue = cloneDeep(this.state.total);
    
                        this.state.unbonding.forEach((unbond, i) => {
                            totalValue.forEach((el, i) => {
                            if(el.denom === unbond.denom  ){
                                el.amount = parseFloat(el.amount) + parseFloat(unbond.amount)
                            }
    
                            // else{
                            //     totalValue[1] = rewards
                                
                            // }
                            this})
                    }, this)

                    this.setState({
                       total: totalValue,
                    })
                }
            }
            


                if(result.total_rewards && result.total_rewards.length > 0)
                {
                    const totalRewards  = cloneDeep(result.total_rewards);
                    console.log(totalRewards)
                    this.setState({
                        rewards: totalRewards,
                    })

                    if(this.state.rewards.length > 0){

                        if(this.state.rewards.length > 1){
                            let totalValue = cloneDeep(this.state.total);
                            this.state.rewards.forEach((rewards, i) => {
                                totalValue.forEach((el, i) => {
                                if(rewards.denom === el.denom){
                                    el.amount = parseFloat(el.amount) + parseFloat(rewards.amount)
                                }
                                this})
                        }, this)
                       // console.log(totalValue)
                        this.setState({
                            total: totalValue,
                        })
                        }

                        else{
                            let totalValue = cloneDeep(this.state.total);
                            for(let v in totalValue){
                                for(let c in this.state.rewards){

                            //   console.log(this.state.rewards)
                                totalValue[v].amount = parseFloat(totalValue[v].amount) + parseFloat(this.state.rewards[c].amount)
                            }
                        }
                            this.setState({
                                total: totalValue,
                            })
                           // console.log(totalValue)
                        }
                        
                    }               
    
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


                if(result.commission && result.commission.length > 0)
                {
                    const totalCommissions  = cloneDeep(result.commission);

                    this.setState({
                        commission: totalCommissions,
                    })

                    if(this.state.commission.length > 0){
                        if(this.state.commission.length > 1){
                            let totalValue = cloneDeep(this.state.total);
                            this.state.commission.forEach((commission, i) => {
                                totalValue.forEach((el, i) => {
                                if(commission.denom === el.denom){
                                    el.amount = parseFloat(el.amount) + parseFloat(commission.amount)
                                }
                                this})
                        }, this)

                        this.setState({
                            total: totalValue,
                        })
                        }

                        else{
                            let totalValue = cloneDeep(this.state.total);
                            for(let v in totalValue){
                               
                                totalValue[v].amount = parseFloat(totalValue[v].amount) + parseFloat(this.state.commission)
                            }
                            this.setState({
                                total: totalValue,
                            })
                        }
                    }
    
            }

                this.setState({
                    loading:false,
                    accountExists: true
                })
            
            }
        })

        Meteor.call('cdp.getCDPPrice',   (error, result) => {
            if (error){
                console.warn(error);
                this.setState({
                    loading:false
                })
            }
    
            if (result){
                this.setState({
                    bnbPrice: result
                })
            }

        })
     
    console.log(this.state.bnbPrice)
        
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
                cdpCollateralizationRatio: 0,
                bnbPrice: 0,
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

 
    renderShareLink() {
        let primaryLink = `/account/${this.state.address}`
        let otherLinks = [
            {label: 'Transfer', url: `${primaryLink}/send`}
        ]
        return <LinkIcon link={primaryLink} otherLinks={otherLinks} />
    }



    findCoin(coins, requestedDenom){
      //  console.log(coins)
           if(coins && coins.length > 1 && requestedDenom){
                let finder = (coins).find(({denom}) => denom === requestedDenom);
                let coinFinder = finder ? new Coin(finder.amount, finder.denom).toString(4) : '0.0000 ' ;
                return coinFinder
            }
            if(coins.length === 1 ){
                for(let c in coins){
                    if(coins[c].denom === requestedDenom){
                        return new Coin(parseFloat(coins[c].amount), requestedDenom).toString(4)
                    }
                    else{
                        return '0.0000 ' + requestedDenom;
                    }

                }
            }
            else{
                     return '0.0000 ' + requestedDenom;
                
            }
            
    }
    

    findValue(params, requestedDenom){
       // console.log(params)
        if(params && params.length > 1){
            let current = (params).find(({denom}) => denom === requestedDenom);
            let currentTotal = current ? current.amount : '0.0000';
            return currentTotal
        }
        else{
            let currentTotal = 0;
            for(let p in params){
                currentTotal = params[p].amount;
            }
            return currentTotal
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
    
    findFraction(){
        let findCurrentCoin = "";
        let currentCoinFraction = 1;

        if(this.state.total && this.state.total.length > 1){
            findCurrentCoin = this.state.total.find(({denom}) => denom === this.state.denom)
            currentCoinFraction = findCurrentCoin ? findCurrentCoin.amount : '0.0000';
            return currentCoinFraction 
        }
        else{
            for(let t in this.state.total){
                currentCoinFraction = this.state.total[t].amount
            }
            return currentCoinFraction
        }
        
    }
    


    render(){
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
                        </CardHeader>
                        <CardBody><br/> 
                            <Row className="account-distributions">
                                <Col xs={12}>
                                    <Progress multi>
                                        <Progress bar className="available" value={this.findValue(this.state.available)/this.findFraction()  * 100} />
                                        <Progress bar className="delegated" value={this.findValue(this.state.delegated)/this.findFraction() * 100} />
                                        <Progress bar className="unbonding" value={this.findValue(this.state.unbonding)/this.findFraction() * 100} />
                                        <Progress bar className="rewards" value={this.findValue(this.state.rewards)/this.findFraction() * 100} />
                                        <Progress bar className="commission" value={this.findValue(this.state.commission)/this.findFraction() * 100} />
                                    </Progress>
                                </Col>
                            </Row>
                            <Row>
                            <Col md={1} lg={2}>
                                   
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
                                    {this.state.commission?<Row>
                                        <Col xs={12} className="label text-nowrap"><T>validators.commission</T></Col>
                                    </Row>:null}
                                </Col>
                            <Col md={3} lg={2}>
                              
                                    <Row>
                                        <Col xs={12} className="value text-left"> <div className="available infinity" />{this.findCoin(this.state.available, 'ukava')}</Col>
                                    </Row>
                                    <Row>
                                        <Col xs={12} className="value text-left"><div className="delegated infinity" />{this.findCoin(this.state.delegated, 'ukava')}</Col>
                                    </Row>
                                    <Row>
                                        <Col xs={12} className="value text-left"><div className="unbonding infinity" />{this.findCoin(this.state.unbonding, 'ukava')}</Col>
                                    </Row>
                                    <Row>
                                        <Col xs={12} className="value text-left"><div className="rewards infinity" />{this.findCoin(this.state.rewards, 'ukava')}</Col>
                                    </Row>
                                    {this.state.commission?<Row>
                                        <Col xs={12} className="value text-left"><div className="commission infinity" />{this.findCoin(this.state.commission, 'ukava')}</Col>
                                    </Row>:null}
                                </Col>
                                <Col md={3} lg={2}>
                                    
                                    <Row>
                                        <Col xs={12} className="value text-left"> <div className="available_2nd infinity" />{this.findCoin(this.state.available, 'bnb')}</Col>
                                    </Row>
                                    <Row>
                                        <Col xs={12} className="value text-left"><div className="infinity" />{'  '}</Col>
                                    </Row>
                                    <Row>
                                        <Col xs={12} className="value text-left"><div className="infinity" />{' '}</Col>
                                    </Row>
                                    <Row>
                                        <Col xs={12} className="value text-left"><div className="rewards_2nd infinity" />{this.findCoin(this.state.rewards, 'bnb')}</Col>
                                    </Row>
                                    {this.state.commission?<Row>
                                        <Col xs={12} className="value text-left"><div className="commission_2nd infinity" />{this.findCoin(this.state.commission, 'bnb')}</Col>
                                    </Row>:null}
                                </Col>
                                <Col md={3} lg={2} >
                                    
                                    <Row>
                                        <Col xs={12} className="value text-left"> <div className="available_3rd infinity" />{this.findCoin(this.state.available, 'usdx')}</Col>
                                    </Row>
                                    <Row>
                                        <Col xs={12} className="value text-left"><div className="infinity" />{'  '}</Col>
                                    </Row>
                                    <Row>
                                        <Col xs={12} className="value text-left"><div className="infinity" />{'  '}</Col>
                                    </Row>
                                    
                                </Col>
                                <Col md={1} lg={4} className="total d-flex flex-column justify-content-end">
                                    {this.state.user?<Row>
                                        <Col xs={12}><TransferButton history={this.props.history} address={this.state.address} denom={this.state.denom}/></Col>
                                        {this.state.user===this.state.address?<Col xs={12}><WithdrawButton  history={this.props.history} rewards={this.state.rewards} commission={this.state.commission} address={this.state.operator_address} denom={this.state.denom}/></Col>:null}
                                        {this.state.user===this.state.address?<Col xs={12}><ClaimSwapButton validator={this.props.validator} address={this.state.operator_address} history={this.props.history}/></Col>:null}
                                    </Row>:null}
                                    </Col>
                                    <Col md={12}  className="total d-flex flex-column justify-content-end">
                                    <Row>
                                    <div/>
                                    <Col xs={12} className="label  text-right"><div className="infinity" /><T>accounts.total</T></Col>
                                    </Row>
                                    </Col>
                                    <Col md={12}  className="total d-flex flex-column justify-content-end">
                                    <Row>
                                        <Col xs={12} className="value text-right">{this.findCoin(this.state.total, 'ukava')}</Col>
                                        <Col xs={12} className="dollar-value text-right text-secondary">~{numbro((this.findValue(this.state.total, 'ukava'))/Meteor.settings.public.coins[0].fraction*this.state.price).format("$0,0.0000a")} ({numbro(this.state.price).format("$0,0.00")}/{Meteor.settings.public.coins[0].displayName})</Col>
                                    </Row>
                                    </Col>
                                    <Col md={12}  className="total d-flex flex-column justify-content-end">
                                    <Row>
                                        <Col xs={12} className="value-2 text-right">{this.findCoin(this.state.total, 'bnb')}</Col>
                                        <Col xs={12} className="dollar-value-2 text-right text-secondary">~{numbro((this.findValue(this.state.total, 'bnb'))/Meteor.settings.public.coins[1].fraction*this.state.bnbPrice).format("$0,0.0000a")} ({numbro(this.state.bnbPrice).format("$0,0.00")}/{Meteor.settings.public.coins[1].displayName})</Col>
                                    </Row>
                                    </Col>
                                    <Col md={12}  className="total d-flex flex-column justify-content-end">
                                    <Row>
                                        <Col xs={12} className="value-3 text-right">{this.findCoin(this.state.total, 'usdx')}</Col>
                                        <Col xs={12} className="dollar-value-3 text-right text-secondary">~{numbro((this.findValue(this.state.total, 'usdx'))/Meteor.settings.public.coins[5].fraction).format("$0,0.0000a")} ({numbro("1").format("$0,0.00")}/{Meteor.settings.public.coins[5].displayName})</Col>
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
                                        <Redelegations 
                                            address={this.state.address} 
                                            redelegations={this.state.unbondingDelegations}
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

