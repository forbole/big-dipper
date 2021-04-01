import React, { Component } from 'react';
import { Table, Spinner } from 'reactstrap';
import { Link } from 'react-router-dom';
import numbro from 'numbro';
import i18n from 'meteor/universe:i18n';
import Coin from '/both/utils/coins.js'
import Pagination from "react-js-pagination";

const T = i18n.createComponent();


const depositedAmount = (searchObject, HARDDenom) => {
    let findCoin = searchObject.find(({ denom }) => denom === HARDDenom);
    return findCoin ? new Coin(parseFloat(findCoin?.amount), findCoin?.denom).toString() :  ''
}

const indexValue = (searchObject, HARDDenom) => {
    let findIndex = searchObject.find(({ denom }) => denom === HARDDenom);
    return findIndex ? <h6>{numbro(findIndex.value).format('0.0000000000')}</h6> : ''
}

const HARDRow = (props) => {
    return <tr>
        <th className="d-none d-sm-table-cell counter ">{props.index}</th>
        <td className="account"><Link to={`/account/${props?.HARDDeposits?.depositor ?? props?.HARDBorrows?.borrower}`}>{props?.HARDDeposits?.depositor ?? props?.HARDBorrows?.borrower}</Link></td>
        <td className="hard-ukava">
            {props?.HARDDeposits?.amount ? 
                <span> <div className="bold-text">{depositedAmount(props?.HARDDeposits?.amount, 'ukava')}</div> <div className="text-success">{indexValue(props?.HARDDeposits?.index, 'ukava')}</div></span> : ' '}
            {props?.HARDBorrows?.amount ?
                <span> <div className="bold-text">{depositedAmount(props?.HARDBorrows?.amount, 'ukava')}</div> <div className="text-success">{indexValue(props?.HARDBorrows?.index, 'ukava')}</div></span> : ' '}
        </td>
        <td className="hard-bnb">
            {props?.HARDDeposits?.amount ? 
                <span> <div className="bold-text">{depositedAmount(props?.HARDDeposits?.amount, 'bnb')}</div> <div className="text-success">{indexValue(props?.HARDDeposits?.index, 'bnb')}</div></span> : ' '}
            {props?.HARDBorrows?.amount ?
                <span> <div className="bold-text">{depositedAmount(props?.HARDBorrows?.amount, 'bnb')}</div> <div className="text-success">{indexValue(props?.HARDBorrows?.index, 'bnb')}</div></span> : ' '}
        </td>
        <td className="hard-btcb">
            {props?.HARDDeposits?.amount ? 
                <span> <div className="bold-text">{depositedAmount(props?.HARDDeposits?.amount, 'btcb')}</div> <div className="text-success">{indexValue(props?.HARDDeposits?.index, 'btcb')}</div></span>: ' '}
            {props?.HARDBorrows?.amount ?
                <span> <div className="bold-text">{depositedAmount(props?.HARDBorrows?.amount, 'btcb')}</div> <div className="text-success">{indexValue(props?.HARDBorrows?.index, 'btcb')}</div></span> : ' '}
        </td>
        <td className="hard-busd">
            {props?.HARDDeposits?.amount ? 
                <span> <div className="bold-text">{depositedAmount(props?.HARDDeposits?.amount, 'busd')}</div> <div className="text-success">{indexValue(props?.HARDDeposits?.index, 'busd')}</div></span>: ' '}
            {props?.HARDBorrows?.amount ?
                <span> <div className="bold-text">{depositedAmount(props?.HARDBorrows?.amount, 'busd')}</div> <div className="text-success">{indexValue(props?.HARDBorrows?.index, 'busd')}</div></span> : ' '}
        </td>
        <td className="hard-hard">
            {props?.HARDDeposits?.amount ? 
                <span> <div className="bold-text">{depositedAmount(props?.HARDDeposits?.amount, 'hard')}</div> <div className="text-success">{indexValue(props?.HARDDeposits?.index, 'hard')}</div></span> : ' '}
            {props?.HARDBorrows?.amount ?
                <span> <div className="bold-text">{depositedAmount(props?.HARDBorrows?.amount, 'hard')}</div> <div className="text-success">{indexValue(props?.HARDBorrows?.index, 'hard')}</div></span> : ' '}
        </td>
        <td className="hard-usdx">
            {props?.HARDDeposits?.amount ? 
                <span> <div className="bold-text">{depositedAmount(props?.HARDDeposits?.amount, 'usdx')}</div> <div className="text-success">{indexValue(props?.HARDDeposits?.index, 'usdx')}</div></span> : ' '}
            {props?.HARDBorrows?.amount ?
                <span> <div className="bold-text">{depositedAmount(props?.HARDBorrows?.amount, 'usdx')}</div> <div className="text-success">{indexValue(props?.HARDBorrows?.index, 'usdx')}</div></span> : ' '}
        </td>
        <td className="hard-xrpb">
            {props?.HARDDeposits?.amount ? 
                <span> <div className="bold-text">{depositedAmount(props?.HARDDeposits?.amount, 'xrpb')}</div> <div className="text-success">{indexValue(props?.HARDDeposits?.index, 'xrpb')}</div></span>: ' '}
            {props?.HARDBorrows?.amount ?
                <span> <div className="bold-text">{depositedAmount(props?.HARDBorrows?.amount, 'xrpb')}</div> <div className="text-success">{indexValue(props?.HARDBorrows?.index, 'xrpb')}</div></span> : ' '}
        </td>
    </tr>
}

export default class List extends Component {

    constructor(props) {
        super(props);
        this.state = {
            HARDDeposits: [],
            HARDBorrows: [],
            currentPage: 1,
            pageSize: 15,
            pagesCount: 0,
            loading: true,
            noActiveDeposits: false,
            noActiveBorrows: false

        }
    }

    componentDidMount() {
        this.getHARDBorrows();
        this.getHARDDeposits();
    }

    componentDidUpdate(prevProps) {
        if (!_.isEqual(prevProps.activeTab, this.props.activeTab)) {
            this.setState({
                loading: true
            })
            if (this.props.activeTab === 'hard-deposits'){
                this.getHARDDeposits();
            }
            else if (this.props.activeTab === 'hard-borrows') {
                this.getHARDBorrows();
            }
        }

    }

    getHARDDeposits = () => {
        Meteor.call('hard.deposits', (error, result) => {
            if (result) {
                this.setState({
                    HARDDeposits: result?.length > 1 ? result.map((HARDDeposits, i) => {
                        return <HARDRow key={i} index={i+1} HARDDeposits={HARDDeposits} />
                    }) : <HARDRow HARDDeposits={result[0]} />,
                    pagesCount: Math.ceil(result.length / this.state.pageSize),
                    HARDBorrows: null,
                    currentPage: 1,
                    loading: false,
                    noActiveDeposits: false
                })
            }
            if (result === null) {
                this.setState({
                    HARDDeposits: null,
                    pagesCount: 0,
                    loading: false,
                    noActiveDeposits: true
                })
            }
            if (error) {
                this.setState({
                    HARDDeposits: undefined,
                    pagesCount: 0,
                    loading: true,
                    noActiveDeposits: true
                })
            }
        })
    }

    getHARDBorrows = () => {
        Meteor.call('hard.borrows', (error, result) => {
            if (result) {
                this.setState({
                    HARDBorrows: result?.length > 1 ? result.map((HARDBorrows, i) => {
                        return <HARDRow key={i} index={i+1} HARDBorrows={HARDBorrows} />
                    }) : <HARDRow HARDBorrows={result[0]} />,
                    HARDDeposits: null,
                    pagesCount: Math.ceil(result.length / this.state.pageSize),
                    currentPage: 1,
                    loading: false,
                    noActiveBorrows: false
                })
            }
            if (result === null) {
                this.setState({
                    HARDBorrows: null,
                    pagesCount: 0,
                    loading: false,
                    noActiveBorrows: true
                })
            }
            if (error) {
                this.setState({
                    HARDBorrows: undefined,
                    pagesCount: 0,
                    loading: true,
                    noActiveBorrows: true
                })
            }
        })
    }


    handlePageChange(pageNumber) {
        this.setState({ currentPage: pageNumber });
    }

    render() {
        if (this.state.loading) {
            return <Spinner type="grow" color="primary" />
        }
        else {
            return (<div>
                <div className="pagination-wrapper">
                    <Table striped className="hard-list" >
                        <thead>
                            <tr>
                                <th className="d-none d-sm-table-cell counter "><i className="material-icons">sort</i> </th>
                                <th className="d-none d-sm-table-cell account"><i className="material-icons">account_circle</i> <span className="d-none d-sm-inline">{this.state.HARDDeposits ? <T>hard.depositor</T> : <T>hard.borrower</T>}</span></th>
                                <th className="hard-kava"><span className="cdp-logo"><img src="/img/KAVA-symbol.svg" className="symbol-img" /> </span> <span className="d-none d-sm-inline"><T>KAVA</T></span></th>
                                <th className="hard-bnb"><span className="cdp-logo"><img src="/img/BNB-symbol.svg" className="symbol-img" /> </span> <span className="d-none d-sm-inline"><T>BNB</T></span></th>
                                <th className="hard-btcb">  <span className="cdp-logo"><img src="/img/BTCB-symbol.svg" className="symbol-img" /> </span> <span className="d-none d-sm-inline"> <T>BTCB</T></span></th>
                                <th className="hard-busd"><span className="cdp-logo"><img src="/img/BUSD-symbol.svg" className="symbol-img" /> </span><span className="d-none d-sm-inline"><T>BUSD</T></span></th>
                                <th className="hard-hard"><span className="cdp-logo"><img src="/img/HARD-symbol.svg" className="symbol-img" /> </span><span className="d-none d-sm-inline"><T>HARD</T></span></th>
                                <th className="hard-usdx"><span className="cdp-logo"><img src="/img/USDX-symbol.svg" className="symbol-img" /> </span> <span className="d-none d-sm-inline"><T>USDX</T></span></th>
                                <th className="hard-xrpb"><span className="cdp-logo"><img src="/img/XRP-symbol.svg" className="symbol-img" /> </span> <span className="d-none d-sm-inline"><T>XRPB</T></span></th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.state.HARDBorrows ? (Object.keys(this.state.HARDBorrows).length > this.state.pageSize ? this.state.HARDBorrows.slice(this.state.currentPage * this.state.pageSize, (this.state.currentPage + 1) * this.state.pageSize) : this.state.HARDBorrows) : "  "}
                            {this.state.HARDDeposits ? (Object.keys(this.state.HARDDeposits).length > this.state.pageSize ? this.state.HARDDeposits.slice(this.state.currentPage * this.state.pageSize, (this.state.currentPage + 1) * this.state.pageSize) : this.state.HARDDeposits) : "  "}
                        </tbody>
                    </Table>
                </div>
                {this.state.HARDDeposits || this.state.HARDBorrows ?
                    <Pagination
                        firstPageText={<i className="material-icons">first_page</i>}
                        lastPageText={<i className="material-icons">last_page</i>}
                        prevPageText={<i className="material-icons">navigate_before</i>}
                        nextPageText={<i className="material-icons">navigate_next</i>}
                        activePage={this.state.currentPage}
                        itemsCountPerPage={this.state.pageSize}
                        totalItemsCount={this.state.HARDDeposits ? this.state.HARDDeposits.length - (this.state.HARDDeposits.length % this.state.pageSize) : this.state.HARDBorrows.length - (this.state.HARDBorrows.length % this.state.pageSize)}
                        pageRangeDisplayed={10}
                        // eslint-disable-next-line react/jsx-no-bind
                        onChange={this.handlePageChange.bind(this)}
                        itemClass="pagination-item"
                        activeClass="pagination-active"
                    /> : null}
            </div>)
        }
    }
}