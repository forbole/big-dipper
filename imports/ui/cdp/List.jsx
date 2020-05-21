import React, { Component } from 'react';
import { Table, Spinner } from 'reactstrap';
import { Link } from 'react-router-dom';
import numbro from 'numbro';
import i18n from 'meteor/universe:i18n';
import TimeStamp from '../components/TimeStamp.jsx';
import Coin from '/both/utils/coins.js'
import { Pagination, PaginationItem, PaginationLink } from 'reactstrap';

const T = i18n.createComponent();



const CDPRow = (props) => {
    return <tr>
        <th className="d-none d-sm-table-cell counter ">{(props.cdpList.cdp.id)}</th>
            <td className="owner"><Link to={"/account/"+props.cdpList.cdp.owner}>{props.cdpList.cdp.owner}</Link></td>
            <td className="collateral-deposited">{props.cdpList.collateral_value?
             <div>{new Coin(props.cdpList.collateral_value.amount, props.cdpList.collateral_value.denom).toString(4)}</div>
        :'0 usdx'}</td>
        <td className="principal-drawn">{props.cdpList.cdp.principal?props.cdpList.cdp.principal.map((deposit, i) => {
            return <div key={i}>{new Coin(deposit.amount, deposit.denom).toString()}</div>
        }):'0 usdx'}</td>
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
                currentPage: 0,
                pageSize: 15,
                pagesCount: 0,
            }

        }
       
    getCDPList = () => {
            Meteor.call('cdp.getCDPList',  (error, result) => {
                if (result && result > 0){
                    this.setState({
                       cdpList: result.map((cdpList, i) => {
                        return <CDPRow key={i} index={i} cdpList={cdpList} />
                    }),
                    pagesCount: Math.ceil(this.state.cdpList.length / this.state.pageSize),

                })
            }
                else{
                    this.setState({
                        cdpList: undefined,
                        pagesCount: 0,
                
                    })
                }
            }
        )} 

    handleClick(e, index) {

        e.preventDefault();

        this.setState({
            currentPage: index
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
      
                <div className="pagination-wrapper">
                    <Table striped className="cdp-list" >
                        <thead>
                            <tr>
                            <th className="d-none d-sm-table-cell counter "><i className="material-icons">sort</i> <T>cdp.cdpID</T></th>
                                <th className="d-none d-sm-table-cell owner"><i className="material-icons">account_circle</i> <span className="d-none d-sm-inline"><T>cdp.owner</T></span></th>
                                <th className="collateral-deposited "><i className="material-icons">attach_money</i> <span className="d-none d-sm-inline"><T>cdp.collateralDeposited</T></span></th>
                                <th className="principal-drawn"><i className="material-icons">attach_money</i> <span className="d-none d-sm-inline"><T>cdp.principal</T></span></th>
                                <th className="value "><i className="material-icons">attach_money</i> <span className="d-none d-sm-inline"><T>cdp.collateralizationRatio</T></span></th>
                                <th className="accumulated-fees"><i className="material-icons">attach_money</i> <span className="d-none d-sm-inline"><T>cdp.accumulatedFees</T></span></th>
                                <th className="fees-updated"><i className="material-icons">update</i> <span className="d-none d-sm-inline"><T>cdp.cdpFeesUpdated</T> (UTC)</span></th>
                               
                            </tr>
                        </thead>
                        <tbody>
                            {this.state.cdpList? this.state.cdpList.slice(this.state.currentPage * this.state.pageSize,(this.state.currentPage + 1) * this.state.pageSize) : null}
                        </tbody>
                    </Table>
                    </div>
                    <Pagination aria-label="Page navigation example" >
          
                    <PaginationItem disabled={this.state.currentPage <= 0}>
                        
                        <PaginationLink
                        onClick={e => this.handleClick(e, this.state.currentPage - 1)}
                        previous
                        href="#"
                        
                        />
                        
                    </PaginationItem>
                
                    {[...Array(this.state.pagesCount)].map((page, i) => 
                        <PaginationItem active={i === this.state.currentPage} key={i}>
                        <PaginationLink onClick={e => this.handleClick(e, i)} href="#">
                            {i + 1}
                        </PaginationLink>
                        </PaginationItem>
                    )}
                
                    <PaginationItem disabled={this.state.currentPage >= this.state.pagesCount - 1}>
                        
                        <PaginationLink
                        onClick={e => this.handleClick(e, currentPage + 1)}
                        next
                        href="#"
                        />
                        
                    </PaginationItem>
                    
                    </Pagination>
            </div>
            )
        }
    }
}