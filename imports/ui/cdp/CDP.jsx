import React, { Component } from 'react';
import { Table, Badge } from 'reactstrap';
import moment from 'moment';
import numbro from 'numbro';
import Account from '../components/Account.jsx';
import Coin from '/both/utils/coins.js'
import i18n from 'meteor/universe:i18n';
import PropTypes from 'prop-types';
import { DepositCDPButton, WithdrawCDPButton, DrawDebtCDPButton, RepayDebtCDPButton, CreateCDPButton} from '../ledger/LedgerActions.jsx';


const T = i18n.createComponent();
let timer = 0;

export default class CDP extends Component{
    constructor(props){
        super(props);
        this.state = {
            modal: false,
            ratio: 0,
            collateral: 0,
            debt: 0,
            price: 0,
            collateralAmount: 0,
            debtAmount: 0,
            cdpParams: null,
            userCDP: null,
            denom: '',
            collateralizationRatio: 0,
            collateralDeposited: 0,
            principalDeposited: 0,
            cdpPrice: null
            

        }

    }

 

    updateCDP(){
        Meteor.call('accounts.getAccountCDP', this.props.owner, this.props.collateral, (error, result) => {
            if (error){
                console.warn(error);
                this.setState({
                    loading:false
                })
            }
    
            if (result){
                
                this.setState({
                    userCDP: result,
                    price: ((parseFloat(result.collateral_value.amount) / Meteor.settings.public.coins[5].fraction) / (parseFloat(result.cdp.collateral[0].amount) / Meteor.settings.public.coins[1].fraction))
                    
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
                    cdpPrice: result,
                })
            }
        }),

        
                
        this.updateCDP();
        timer = Meteor.setInterval(() => {
            this.updateCDP();
            this.render();
        },9000)
        
    }

    componentWillUnmount(){
        Meteor.clearInterval(timer);
    }

    findBNBValue(params){
        let value = (params).find(({denom}) => denom === 'bnb');
        let totalValue = value ? value.amount : null;
        return totalValue
    }
    

    
    render(){
        console.log("CDPPRICE " + JSON.stringify(this.state.cdpPrice))
        
        if (this.state.userCDP) {
            return <div className="cdp-content">
                <Table>
                <div className="mb-3"><Badge color="success">BNB:USD</Badge> <strong className="text-info">{ numbro(this.state.price).formatCurrency({mantissa:4})}</strong></div>
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
                            <td className={this.state.userCDP.collateralization_ratio>1.5?"text-success":"text-danger"}>{numbro(this.state.userCDP.collateralization_ratio).format({mantissa:4})}</td>
                        </tr>
                    </tbody>
                </Table>
                <div>
                <DepositCDPButton 
                    cdpParams={this.state.cdpParams?this.state.cdpParams.debt_params[0].debt_floor:null}  
                    collateral={this.props.collateral?this.props.collateral:null}
                    bnbTotalValue={this.props.total?this.findBNBValue(this.props.total):null}  
                /> 
                <WithdrawCDPButton
                cdpParams={this.state.cdpParams?this.state.cdpParams.debt_params[0].debt_floor:null}  
                collateral={this.props.collateral?this.props.collateral:null}
                collateralDeposited = {this.state.userCDP?this.state.userCDP.cdp.collateral[0].amount:null} 
                /> 
                <DrawDebtCDPButton
                cdpParams={this.state.cdpParams?this.state.cdpParams.debt_params[0].debt_floor:null}  
                collateral={this.state.cdpParams?this.state.cdpParams.collateral_params[0].denom:null}
                principalDeposited={this.state.userCDP?this.state.userCDP.cdp.principal[0].amount:null}
                principalDenom={this.state.userCDP?this.state.userCDP.cdp.principal[0].denom:null}  
                /> 
                <RepayDebtCDPButton
                cdpParams={this.state.cdpParams?this.state.cdpParams.debt_params[0].debt_floor:null}  
                collateral={this.state.cdpParams?this.state.cdpParams.collateral_params[0].denom:null}
                principalDeposited={this.state.userCDP?this.state.userCDP.cdp.principal[0].amount:null}
                principalDenom={this.state.userCDP?this.state.userCDP.cdp.principal[0].denom:null}    
                /> 
                 <CreateCDPButton 
                    cdpParams={this.state.cdpParams?this.state.cdpParams.debt_params[0].debt_floor:null} 
                    collateralizationRatio={this.state.cdpParams?parseInt(this.state.cdpParams.collateral_params[0].liquidation_ratio):null}
                    price={this.state.cdpPrice?this.state.cdpPrice:null} 
                    />  
                </div>
                
            </div>
        }
    
        else{
            return <div>
            <br></br>
            {/* <div className="mb-3"><Badge color="success">BNB:USD</Badge> <strong className="text-info">{ numbro(this.state.price).formatCurrency({mantissa:4})}</strong></div> */}
             <CreateCDPButton 
                    cdpParams={this.state.cdpParams?this.state.cdpParams.debt_params[0].debt_floor:null} 
                    collateralizationRatio={this.state.cdpParams?parseInt(this.state.cdpParams.collateral_params[0].liquidation_ratio):null}
                    price={this.state.cdpPrice?this.state.cdpPrice:null} 
                    />  
            <br></br>
            </div>
        }
    
    }

}




CDP.propTypes = {
    owner: PropTypes.string,
    collateral: PropTypes.string,
    total: PropTypes.array,
    
}
