import React, { Component } from 'react';
import { Table, Spinner } from 'reactstrap';
import { Link } from 'react-router-dom';
import numbro from 'numbro';
import i18n from 'meteor/universe:i18n';
import TimeStamp from '../components/TimeStamp.jsx';
import Coin from '/both/utils/coins.js'
import { Pagination, PaginationItem, PaginationLink } from 'reactstrap';

const T = i18n.createComponent();

const AuctionRow = (props) => {
    const rowItem = props.auctionList.auction.value.base_auction
    return <tr>
        <th className="d-none d-sm-table-cell counter ">{(rowItem.id)}</th>
        <td className="bidder"><Link to={"/account/" + rowItem.bidder}>{rowItem.bidder}</Link></td>
        <td className="bid">{rowItem.bid ? <div>{new Coin(rowItem.bid.amount, rowItem.bid.denom).toString(4)}</div> : '0 usdx'}</td>
        <td className="bids-received">{rowItem.has_received_bids ? <div> <i className="material-icons mx-1" colour="primary">check_circle_outline</i> <span className="d-none d-sm-inline">Yes</span> </div> : <div><i className="material-icons mx-1" >highlight_off</i><span className="d-none d-sm-inline">No</span> </div>}</td>
        <td className="endtime"><TimeStamp time={rowItem.end_time} /></td>
    </tr>
}

export default class List extends Component {

    constructor(props) {
        super(props);
        this.state = {
            auctionList: [],
            currentPage: 0,
            pageSize: 15,
            pagesCount: 0,

        }
    }

    componentDidMount() {
        this.getCDPList();
    }

    getCDPList = () => {
        Meteor.call('account.auction', (error, result) => {
            if (result && result.length > 0) {
                this.setState({
                    auctionList: result.map((list, i) => {
                        return <AuctionRow key={i} index={i} auctionList={list} />
                    }),
                    pagesCount: Math.ceil(result.length / this.state.pageSize),

                })
            }
            else {
                this.setState({
                    auctionList: undefined,
                    pagesCount: 0,

                })
            }
        })
    }



    handleClick(e, index) {
        e.preventDefault();
        this.setState({
            currentPage: index
        });
    }

    render() {

        if (this.props.loading) {
            return <Spinner type="grow" color="primary" />
        }
        else {
            return (<div>
                <div className="pagination-wrapper">
                    <Table striped className="auction-list" >
                        <thead>
                            <tr>
                                <th className="d-none d-sm-table-cell counter "><i className="material-icons">sort</i> <T>auction.auctionID</T></th>
                                <th className="d-none d-sm-table-cell bidder"><i className="material-icons">account_circle</i> <span className="d-none d-sm-inline"><T>auction.bidder</T></span></th>
                                <th className="bid "><i className="material-icons">attach_money</i> <span className="d-none d-sm-inline"><T>auction.value</T></span></th>
                                <th className="bids-received"><i className="material-icons">attach_money</i> <span className="d-none d-sm-inline"><T>auction.bidsReceived</T></span></th>
                                <th className="endtime"><i className="material-icons">update</i> <span className="d-none d-sm-inline"><T>auction.endTime</T> (UTC)</span></th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.state.auctionList ? this.state.auctionList.slice(this.state.currentPage * this.state.pageSize, (this.state.currentPage + 1) * this.state.pageSize) : null}
                        </tbody>
                    </Table>
                </div>
                <Pagination aria-label="Auction List Pagination" >
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
            </div>)
        }
    }
}