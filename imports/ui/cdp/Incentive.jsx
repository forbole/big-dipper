import React, { Component } from 'react';
import { Table, Badge } from 'reactstrap';
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

        Meteor.call('hard.fetchIncentive',  (error, result) => {
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
        if (this.props.incentiveType === 'incentive-usdx-minting' && this.state.incentiveUSDX.length > 0) {
            return <> {this.state.incentiveUSDX ? <div className="incentive-usdx-minting">
                <Table >
                    <tbody>
                        
                        {(this.props.owner) ? <tr>
                            <th scope="row" className="w-25 text-muted"><T>incentive.owner</T></th>
                            <td><Account address={this.state.incentiveUSDX[0]?.base_claim?.owner} /></td>
                        </tr> : ''}
                        <tr>
                            <th scope="row" className="w-25 text-muted"><T>incentive.collateralType</T></th>
                            <td>{this.state.incentiveUSDX[0]?.reward_indexes ? this.state.incentiveUSDX[0]?.reward_indexes[0]?.collateral_type : null}</td>
                        </tr>
                        <tr>
                            <th scope="row" className="w-25 text-muted"><T>incentive.rewardFactor</T></th>
                            <td>{this.state.incentiveUSDX[0]?.reward_indexes ? this.state.incentiveUSDX[0]?.reward_indexes[0]?.reward_factor : null}</td>
                        </tr>
                        <tr>
                            <th scope="row" className="w-25 text-muted"><T>incentive.rewards</T></th>
                            <td className="vertical-aligned"><div >{this.state.incentiveUSDX[0]?.base_claim?.reward ? new Coin(this.state.incentiveUSDX[0]?.base_claim?.reward?.amount, this.state.incentiveUSDX[0]?.base_claim?.reward?.denom).toString(6) : 0}</div></td>

                        </tr>
                    </tbody>
                </Table>
                {
                    this.props.owner === this.props.user ? 
                        (this.state.incentiveUSDX[0]?.base_claim?.reward?.amount > 0) ? <div className="mt-n3"><WithdrawIncentiveRewards rewards={this.state.incentiveUSDX[0]?.base_claim?.reward}
                            incentiveType="USDX"/></div> : null
                        : null
                }
            </div> : null}
            </>
        }
        else if (this.props.incentiveType === 'incentive-hard' && this.state.incentiveHARD.length > 0){
            return <>{
                this.state.incentiveHARD ? <div className="incentive-hard">
                    <Table >
                        <tbody>

                            {(this.props.owner) ? <tr>
                                <th scope="row" className="w-25 text-muted"><T>incentive.owner</T></th>
                                <td><Account address={this.state.incentiveHARD[0]?.base_claim?.owner} /></td>
                            </tr> : ''}
                            <tr>
                                <th scope="row" className="w-25 text-muted"><T>incentive.rewards</T></th>

                                <td>{this.state.incentiveHARD[0]?.base_claim?.reward.length > 1 ? this.state.incentiveHARD[0]?.base_claim?.reward.map((col, i) => <div key={i}>{new Coin(col?.amount, col?.denom).toString(6)}</div>) : <div>{new Coin(this.state.incentiveHARD[0]?.base_claim?.reward[0]?.amount, this.state.incentiveHARD[0]?.base_claim?.reward[0]?.denom).toString(4)}</div>}</td>



                            </tr>
                        </tbody>
                    </Table>
                    {this.props.owner === this.props.user ?
                        (this.state.incentiveHARD[0]?.base_claim?.reward) ? <div className="mt-n3"><WithdrawIncentiveRewards rewards={this.state.incentiveHARD[0]?.base_claim?.reward}
                            incentiveType="HARD"/></div> : null : null}
                          
                </div> 
                    : null
            }</>
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
