import React, { Component } from 'react';
import { Table, Spinner } from 'reactstrap';
import { Link } from 'react-router-dom';
import numbro from 'numbro';
import i18n from 'meteor/universe:i18n';
import TimeStamp from '../components/TimeStamp.jsx';
import Coin from '/both/utils/coins.js'
import { Pagination, PaginationItem, PaginationLink } from 'reactstrap';
import { AuctionBidButton } from '../ledger/LedgerActions.jsx';

const T = i18n.createComponent();

const AuctionRow = (props) => {
    if (!props.auctionList.auction.value) return null
    const rowItem = props.auctionList.auction.value
    return <tr>
        <th className="d-none d-sm-table-cell counter ">{(rowItem.base_auction.id)}</th>
        <td className="bidder"><Link to={"/account/" + rowItem.base_auction.bidder}>{rowItem.base_auction.bidder}</Link></td>
        <td className="lot-value bold-text">{rowItem.base_auction.lot ? <div>{new Coin(rowItem.base_auction.lot.amount, rowItem.base_auction.lot.denom).toString(4)}</div> : '0'}</td>
        <td className="bid-value bold-text">{rowItem.base_auction.bid ? <div>{new Coin(rowItem.base_auction.bid.amount, rowItem.base_auction.bid.denom).toString(4)}</div> : '0 usdx'}</td>
        <td className="bids-received">{rowItem.base_auction.has_received_bids ? <div> <i className="material-icons greenColor mx-1">check_circle_outline</i> <span className="d-none d-sm-inline">Yes</span> </div> : <div><i className="material-icons redColor mx-1 ">highlight_off</i><span className="d-none d-sm-inline">No</span> </div>}</td>
        <td className="end-time"><TimeStamp time={rowItem.base_auction.end_time} /></td>
        <td className="max-time"><TimeStamp time={rowItem.base_auction.max_end_time} /></td>
        <td className="bid-button"><AuctionBidButton auctionID={rowItem.base_auction.id} denom={rowItem.base_auction.bid.denom} currentBidAmount={rowItem.base_auction.bid ? rowItem.base_auction.bid.amount : 0} maxBid={rowItem.max_bid ? rowItem.max_bid.amount : 0} /></td>


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
                                <th className="loot-value"><i className="material-icons">attach_money</i> <span className="d-none d-sm-inline"><T>auction.lootValue</T></span></th>
                                <th className="bid-value"><i className="material-icons">attach_money</i> <span className="d-none d-sm-inline"><T>auction.bidValue</T></span></th>
                                <th className="bids-received"><i className="material-icons">attach_money</i> <span className="d-none d-sm-inline"><T>auction.bidsReceived</T></span></th>
                                <th className="end-time"><i className="material-icons">update</i> <span className="d-none d-sm-inline"><T>auction.endTime</T> (UTC)</span></th>
                                <th className="max-time"><i className="material-icons">update</i> <span className="d-none d-sm-inline"><T>auction.maxTime</T> (UTC)</span></th>
                                <th className="bid-button"><i className="material-icons"></i><span className="d-none d-sm-inline"><T>auction.bid</T> </span></th>


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