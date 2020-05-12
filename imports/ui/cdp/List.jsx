import React, { Component } from 'react';
import { Table, Spinner } from 'reactstrap';
import { Link } from 'react-router-dom';
import numbro from 'numbro';
import i18n from 'meteor/universe:i18n';
import TimeStamp from '../components/TimeStamp.jsx';
import Coin from '/both/utils/coins.js'

const T = i18n.createComponent();



const CDPRow = (props) => {
    
    return <tr>
        <th className="d-none d-sm-table-cell counter ">{props.cdpList.cdp.id}</th>
            <td className="owner"><Link to={"/account/"+props.cdpList.cdp.owner}>{props.cdpList.cdp.owner}</Link></td>
            <td className="value ">{numbro(parseFloat(props.cdpList.collateralization_ratio)).format('0.000000')}</td>
            <td className="accumulated-fees">{props.cdpList.cdp.accumulated_fees?props.cdpList.cdp.accumulated_fees.map((deposit, i) => {
            return <div key={i}>{new Coin(deposit.amount, deposit.denom).toString()}</div>
        }):'0 usdx'}</td>
            <td className="fees-updated"><TimeStamp time={props.cdpList.cdp.fees_updated}/></td>
            
         </tr>
}

export default class List extends Component{

        constructor(props){
            super(props);
            this.state = {
                cdpList: [],
            }
        
        }
       
    getCDPList = () => {
            Meteor.call('cdp.getCDPList',  (error, result) => {
                if (result){
                    this.setState({
                       cdpList: result.map((cdpList, i) => {
                        return <CDPRow key={i} index={i} cdpList={cdpList} />
                    })
                })
                }
            });
         } 
         
 

    render(){
        if (this.props.loading){
            return <Spinner type="grow" color="primary" />
        }
        else{
            return (
                <div>
                    {this.getCDPList()}
                    <Table striped className="cdp-list">
                        <thead>
                            <tr>
                            <th className="d-none d-sm-table-cell counter "><i className="material-icons">sort</i> <T>cdp.cdpID</T></th>
                                <th className="d-none d-sm-table-cell owner"><i className="material-icons">account_circle</i> <span className="d-none d-sm-inline"><T>cdp.owner</T></span></th>
                                <th className="value "><i className="material-icons">attach_money</i> <span className="d-none d-sm-inline"><T>cdp.collateralizationRatio</T></span></th>
                                <th className="accumulated-fees"><i className="material-icons">attach_money</i> <span className="d-none d-sm-inline"><T>cdp.accumulatedFees</T></span></th>
                                <th className="fees-updated"><i className="material-icons">update</i> <span className="d-none d-sm-inline"><T>cdp.cdpFeesUpdated</T> (UTC)</span></th>
                               
                            </tr>
                        </thead>
                        <tbody>{this.state.cdpList}</tbody>
                    </Table>
                </div>
            )
        }
    }
}