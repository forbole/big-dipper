import React, { Component } from 'react';
import { Table, Badge } from 'reactstrap';
import moment from 'moment';
import numbro from 'numbro';
import Account from '../components/Account.jsx';
import Coin from '/both/utils/coins.js'
import i18n from 'meteor/universe:i18n';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { WithdrawIncentiveRewards } from '../ledger/LedgerActions.jsx';


const T = i18n.createComponent();
export default class Incentive extends Component {
    constructor(props) {
        super(props);
        this.state = {
            collateral: 0,
            denom: '',
            total: props.total,
            incentiveHARD: [],
            incentiveUSDX: [],
        }

    }

    getIncentive() {

        Meteor.call('account.getIncentive',  (error, result) => {
            if (error) {
                console.warn(error);
                this.setState({
                    loading: false,
                    incentive: null
                })
            }
            if (result) {
                let incentiveHARD = [];
                let incentiveUSDX = [];
                let counterHARD = 0;
                let counterUSDX = 0;

                for (let d = 0; d < result.hard_claims.length; d++) {
                    if (result.hard_claims[d].base_claim.owner === this.props.owner) {
                        incentiveHARD[counterHARD] = result.hard_claims[d];
                        counterHARD++;
                    }
                }

                for (let e = 0; e < result.usdx_minting_claims.length; e++) {
                    if (result.usdx_minting_claims[e].base_claim.owner === this.props.owner) {
                        incentiveUSDX[counterUSDX] = result.usdx_minting_claims[e];
                        counterUSDX++;
                    }
                }
              
                this.setState({
                    incentiveHARD: incentiveHARD,
                    incentiveUSDX: incentiveUSDX,
                })
            }
        })
    }



    componentDidMount() {
        this.getIncentive();
    }


    render() {
        if (this.state.incentiveUSDX.length > 0 || this.state.incentiveHARD > 0) {
            return <> {this.state.incentiveUSDX ? <div className="cdp-content">
                <Table >
                    <tbody>
                        
                        {(this.props.owner) ? <tr>
                            <th scope="row" className="w-25 text-muted"><T>cdp.owner</T></th>
                            <td><Account address={this.state.incentiveUSDX[0]?.base_claim?.owner} /></td>
                        </tr> : ''}
                        <tr>
                            <th scope="row" className="w-25 text-muted"><T>cdp.collateralType</T></th>
                            <td>{this.state.incentiveUSDX[0]?.reward_indexes ? this.state.incentiveUSDX[0]?.reward_indexes[0]?.collateral_type.toUpperCase() : null}</td>
                        </tr>
                        <tr>
                            <th scope="row" className="w-25 text-muted"><T>cdp.rewardFactor</T></th>
                            <td>{this.state.incentiveUSDX[0]?.reward_indexes ? this.state.incentiveUSDX[0]?.reward_indexes[0]?.reward_factor : null}</td>
                        </tr>
                        <tr>
                            <th scope="row" className="w-25 text-muted"><T>cdp.totalReward</T></th>
                            <td className="vertical-aligned"><div >{this.state.incentiveUSDX[0]?.base_claim?.reward ? new Coin(this.state.incentiveUSDX[0]?.base_claim?.reward?.amount, this.state.incentiveUSDX[0]?.base_claim?.reward?.denom).toString(6) : 0}</div></td>

                        </tr>
                    </tbody>
                </Table>
                {this.props.owner === this.props.user ? 
                    (this.state.incentiveUSDX[0]?.base_claim?.reward?.amount > 0) ? <div className="mt-n3"><WithdrawIncentiveRewards rewards={parseFloat(this.state.incentiveUSDX[0]?.base_claim?.reward?.amount)}
                        denom={this.state.incentiveUSDX[0]?.base_claim?.reward?.denom} /></div> : null : null}
            </div> : null}
            
             {this.state.incentiveHARD ? <div className="cdp-content">
                 <Table >
                     <tbody>

                         {(this.props.owner) ? <tr>
                             <th scope="row" className="w-25 text-muted"><T>cdp.owner</T></th>
                             <td><Account address={this.state.incentiveHARD[0]?.base_claim?.owner} /></td>
                         </tr> : ''}
                         <tr>
                             <th scope="row" className="w-25 text-muted"><T>cdp.totalReward</T></th>
                          
                             <td>{this.state.incentiveHARD[0]?.base_claim?.reward.length > 1 ? this.state.incentiveHARD[0]?.base_claim?.reward.map((col, i) => <div key={i}>{new Coin(col?.amount, col?.denom).toString(6)}</div>) : <div>{new Coin(this.state.incentiveHARD[0]?.base_claim?.reward[0]?.amount, this.state.incentiveHARD[0]?.base_claim?.reward[0]?.denom).toString(4)}</div>}</td>

                            

                         </tr>
                     </tbody>
                 </Table>
                 {this.props.owner === this.props.user ?
                     (this.state.incentiveHARD[0]?.base_claim?.reward) ? <div className="mt-n3"><WithdrawIncentiveRewards rewards={null}
                         denom={null} /></div> : null : null}
             </div> : null}
            </>
        }
        else {
            return null
        }


    }
}




Incentive.propTypes = {
    owner: PropTypes.string.isRequired,
    user: PropTypes.string.isRequired
}
