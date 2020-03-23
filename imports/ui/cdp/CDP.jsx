import React, { Component } from 'react';
import { Table, Button } from 'reactstrap';
import moment from 'moment';
import numbro from 'numbro';
import Account from '../components/Account.jsx';
import Coin from '/both/utils/coins.js'
import i18n from 'meteor/universe:i18n';
import PropTypes from 'prop-types';

const T = i18n.createComponent();

export default class CDP extends Component{
    constructor(props){
        super(props);
    }

    render(){
        if (this.props.id) {
            return <div className="cdp-content">
                <Table>
                    <tbody>
                        <tr>
                            <th scope="row" className="w-25 text-muted"><T>cdp.id</T></th>
                            <td>{this.props.id}</td>
                        </tr>
                        {(this.props.owner)?<tr>
                            <th scope="row" className="w-25 text-muted"><T>cdp.owner</T></th>
                            <td><Account address={this.props.owner} /></td>
                        </tr>:''}
                        {(this.props.collateral&&(this.props.collateral.length>0))?<tr>
                            <th scope="row" className="w-25 text-muted"><T>cdp.collateral</T></th>
                            <td>{this.props.collateral.map((col, i) => <div key={i}>{new Coin(col.amount, col.denom).toString(6)}</div>)}</td>
                        </tr>:''}
                        {(this.props.principal&&(this.props.principal.length>0))?<tr>
                            <th scope="row" className="w-25 text-muted"><T>cdp.principal</T></th>
                            <td>{this.props.principal.map((prin, i) => <div key={i}>{new Coin(prin.amount, prin.denom).toString(6)}</div>)}</td>
                        </tr>:''}
                        {(this.props.accumulatedFees&&(this.props.accumulatedFees.length>0))?<tr>
                            <th scope="row" className="w-25 text-muted"><T>cdp.accumulatedFees</T></th>
                            <td>{this.props.accumulatedFees.map((fee, i) => <div key={i}>{new Coin(fee.amount, fee.denom).toString(6)}<br/><small>(<T>common.lastUpdated</T> {moment.utc(this.props.feesUpdated).fromNow()})</small></div>)}</td>
                        </tr>:''}
                        <tr>
                            <th scope="row" className="w-25 text-muted"><T>cdp.collateralValue</T></th>
                            <td>{new Coin(this.props.collateralValue.amount, this.props.collateralValue.denom).toString(6)}</td>
                        </tr>
                        <tr>
                            <th scope="row" className="w-25 text-muted"><T>cdp.collateralizationRatio</T></th>
                            <td className={this.props.collateralizationRatio>1.5?"text-success":"text-danger"}>{numbro(this.props.collateralizationRatio).format({mantissa:4})}</td>
                        </tr>
                    </tbody>
                </Table>
                <div>
                    <Button color="success" size="sm"><T>cdp.deposit</T></Button> <Button color="warning" size="sm"><T>cdp.withdraw</T></Button> <Button color="danger" size="sm"><T>cdp.draw</T></Button> <Button color="info" size="sm"><T>cdp.repay</T></Button>
                </div>
            </div>
        }
        else{
            return <div>
                <Button color="success" size="sm"><T>cdp.create</T></Button>
            </div>
        }

    }
}

CDP.propTypes = {
    id: PropTypes.number,
    owner: PropTypes.string,
    collateral: PropTypes.array,
    principal: PropTypes.array,
    accumulatedFees: PropTypes.array,
    feesUpdated: PropTypes.string,
    collateralValue: PropTypes.object,
    collateralizationRatio: PropTypes.number
}