import React, { Component } from 'react';
import { Table, Badge } from 'reactstrap';
import moment from 'moment';
import numbro from 'numbro';
import Account from '../components/Account.jsx';
import Coin from '/both/utils/coins.js'
import i18n from 'meteor/universe:i18n';
import PropTypes from 'prop-types';
import { DepositCDPButton, WithdrawCDPButton, DrawDebtCDPButton, RepayDebtCDPButton, CreateCDPButton} from '../ledger/LedgerActions.jsx';
import _ from 'lodash';


const T = i18n.createComponent();
let timer = 0;


export default class CDP extends Component{
    constructor(props){
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
            total: props.total
            

        }

    }

 

    updateCDP(){
        Meteor.call('accounts.getAccountCDP', this.props.owner, this.props.collateral, (error, result) => {
            if (error){
                console.warn(error);
                this.setState({
                    loading:false,
                    userCDP: null
                })
            }
    
            if (result){
                
                this.setState({
                    userCDP: result
                    
                })  
            }
        })
    }

    componentDidMount(){

        Meteor.call('cdp.getCDPParams', (error, result) => {
            if (error){
                console.warn(error);
                this.setState({
                    loading:false
                })
            }
    
            if (result){
                this.setState({
                    cdpParams: result,

                })
            }
        }),

        Meteor.call('cdp.getCDPPrice',   (error, result) => {
            if (error){
                console.warn(error);
                this.setState({
                    loading:false
                })
            }
    
            if (result){
                this.setState({
                    cdpPrice: result
                })
            }
        }),        
        this.updateCDP();
        timer = Meteor.setInterval(() => {
            this.updateCDP();

        },9000)
        
    }

    componentWillUnmount(){
        Meteor.clearInterval(timer);
    }

    componentDidUpdate(prevProps){
        if (!_.isEqual(prevProps, this.props)){
            this.setState({
            total: this.props.total,    
            })
        }
    }

    findTotalValue(params, denomType){
        let value = (params).find(({denom}) => denom === denomType);
        let totalValue = value ? value.amount : null;
        return totalValue
    }
    

    
    render(){
       
        if (this.state.userCDP && this.state.userCDP.cdp) {
            return <div className="cdp-content">
                <Table>
                <div className="mb-3"><Badge color="success">BNB:USD</Badge> <strong className="text-info">{this.state.cdpPrice?numbro(this.state.cdpPrice).formatCurrency({mantissa:4}):0}</strong></div>
                    <tbody>
                        <tr>
                            <th scope="row" className="w-25 text-muted"><T>cdp.id</T></th>
                            <td>{this.state.userCDP.cdp.id}</td>
                        </tr>
                        {(this.props.owner)?<tr>
                            <th scope="row" className="w-25 text-muted"><T>cdp.owner</T></th>
                            <td><Account address={this.props.owner} /></td>
                        </tr>:''}
                        {(this.state.userCDP.cdp.collateral&&(this.state.userCDP.cdp.collateral.length>0))?<tr>
                            <th scope="row" className="w-25 text-muted"><T>cdp.collateralDeposited</T></th>
                            <td>{this.state.userCDP.cdp.collateral.map((col, i) => <div key={i}>{new Coin(col.amount, col.denom).toString(6)}</div>)}</td>
                        </tr>:''}
                        {(this.state.userCDP.cdp.principal&&(this.state.userCDP.cdp.principal.length>0))?<tr>
                            <th scope="row" className="w-25 text-muted"><T>cdp.principal</T></th>
                            <td>{this.state.userCDP.cdp.principal.map((prin, i) => <div key={i}>{new Coin(prin.amount, prin.denom).toString(6)}</div>)}</td>
                        </tr>:''}
                        <tr>
                            <th scope="row" className="w-25 text-muted"><T>cdp.accumulatedFees</T></th>
                            <td>{this.state.userCDP.cdp.accumulated_fees.map((fee, i) => <div key={i}>{new Coin(fee.amount, fee.denom).toString(6)}<br/>
                            <small>(<T>common.lastUpdated</T> {moment.utc(this.state.userCDP.cdp.fees_updated).fromNow()})</small></div>)}</td>
                        </tr>

                        {(this.state.userCDP.collateral_value&&(this.state.userCDP.collateral_value.length>0))?<tr>
                            <th scope="row" className="w-25 text-muted"><T>cdp.collateralValue</T></th>
                            <td>{this.state.userCDP.collateral_value.map((col, i) => <div key={i}>{new Coin(col.amount, col.denom).toString(6)}</div>)}</td>
                        </tr>:''}
                        <tr>
                            <th scope="row" className="w-25 text-muted"><T>cdp.collateralizationRatio</T></th>
                            <td className={this.state.userCDP.collateralization_ratio>2?"text-success":"text-danger"}>{numbro(this.state.userCDP.collateralization_ratio).format({mantissa:4})}</td>
                        </tr>
                    </tbody>
                </Table>
                <div>
                <DepositCDPButton 
                    cdpParams={this.state.cdpParams?this.state.cdpParams.debt_params[0].debt_floor:null}  
                    collateral={this.props.collateral?this.props.collateral:null}
                    bnbTotalValue={this.props.total?this.findTotalValue(this.props.total, 'bnb'):null}
                    principalDeposited={this.state.userCDP?this.state.userCDP.cdp.principal[0].amount:null}
                    principalDenom={this.state.userCDP?this.state.userCDP.cdp.principal[0].denom:null}
                    price={this.state.cdpPrice?this.state.cdpPrice:null}  
                    collateralDeposited = {this.state.userCDP?this.state.userCDP.cdp.collateral[0].amount:null}
                    collateralizationRatio={this.state.cdpParams?parseInt(this.state.cdpParams.collateral_params[0].liquidation_ratio):null}  
                /> 
                <WithdrawCDPButton
                    cdpParams={this.state.cdpParams?this.state.cdpParams.debt_params[0].debt_floor:null}  
                    collateral={this.props.collateral?this.props.collateral:null}
                    principalDeposited={this.state.userCDP?this.state.userCDP.cdp.principal[0].amount:null}
                    principalDenom={this.state.userCDP?this.state.userCDP.cdp.principal[0].denom:null}
                    price={this.state.cdpPrice?this.state.cdpPrice:0}  
                    collateralDeposited = {this.state.userCDP?this.state.userCDP.cdp.collateral[0].amount:null}
                    collateralizationRatio={this.state.cdpParams?parseInt(this.state.cdpParams.collateral_params[0].liquidation_ratio):null}
                /> 
                {(this.props.owner == this.props.user)?<DrawDebtCDPButton
                    cdpParams={this.state.cdpParams?this.state.cdpParams.debt_params[0].debt_floor:null}  
                    collateral={this.props.collateral?this.props.collateral:null}
                    principalDeposited={this.state.userCDP?this.state.userCDP.cdp.principal[0].amount:null}
                    principalDenom={this.state.userCDP?this.state.userCDP.cdp.principal[0].denom:null}
                    price={this.state.cdpPrice?this.state.cdpPrice:null}  
                    collateralDeposited = {this.state.userCDP?this.state.userCDP.cdp.collateral[0].amount:null}
                    collateralizationRatio={this.state.cdpParams?parseInt(this.state.cdpParams.collateral_params[0].liquidation_ratio):null}
                />:''}
                
                {(this.props.owner == this.props.user)?<RepayDebtCDPButton
                    cdpParams={this.state.cdpParams?this.state.cdpParams.debt_params[0].debt_floor:null}  
                    collateral={this.props.collateral?this.props.collateral:null}
                    usdxTotalValue={this.props.total?this.findTotalValue(this.props.total, 'usdx'):null}
                    principalDeposited={this.state.userCDP?this.state.userCDP.cdp.principal[0].amount:null}
                    principalDenom={this.state.userCDP?this.state.userCDP.cdp.principal[0].denom:null}
                    price={this.state.cdpPrice?this.state.cdpPrice:null}  
                    collateralDeposited = {this.state.userCDP?this.state.userCDP.cdp.collateral[0].amount:null}
                    collateralizationRatio={this.state.cdpParams?parseInt(this.state.cdpParams.collateral_params[0].liquidation_ratio):null}    
                    disabled={!this.state.cdpParams}
                />:''}
                </div>
                
            </div>
        }
    
        else{
            return <div>
            <br></br>
            <div className="mb-3"><Badge color="success">BNB:USD</Badge> <strong className="text-info">{this.state.cdpPrice?numbro(this.state.cdpPrice).formatCurrency({mantissa:4}):0}</strong></div>
             <CreateCDPButton 
                    cdpParams={this.state.cdpParams?this.state.cdpParams.debt_params[0].debt_floor:null} 
                    collateralizationRatio={this.state.cdpParams?parseInt(this.state.cdpParams.collateral_params[0].liquidation_ratio):null}
                    collateral={this.state.cdpParams?this.state.cdpParams.collateral_params[0].denom:null}
                    price={this.state.cdpPrice?this.state.cdpPrice:null} 
                    bnbTotalValue={this.props.total?this.findTotalValue(this.props.total, 'bnb'):null}
                    />  
            <br></br>
            </div>
        }
    
    }

}




CDP.propTypes = {
    owner: PropTypes.string.isRequired,
    collateral: PropTypes.string.isRequired,
    total: PropTypes.array.isRequired,
    user: PropTypes.string.isRequired
}
