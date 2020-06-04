import React, { Component, useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Table, Pagination, PaginationItem, PaginationLink  } from 'reactstrap';
import i18n from 'meteor/universe:i18n';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { AuctionBidButton } from '../ledger/LedgerActions.jsx';


const T = i18n.createComponent();
let auctionList = [];

function AuctionList(props) {
    const [modal, setModal] = useState(false);

    const toggle = () => setModal(!modal);

    

    return (
        <div> <span className={"ledger-buttons-cdp"}>
            <Button color="info" size="sm" onClick={toggle} >{"View Auctions"}</Button>
        </span>
            <Modal isOpen={modal} toggle={toggle} className={"modal-auction text-center"} size={"lg"}>
                <ModalHeader toggle={toggle} justify="center" >List of Auctions</ModalHeader>
                <ModalBody className={"modal-auction-body"}>
                    <div className="pagination-wrapper">
                        <Table striped>
                            <thead>
                                <tr>
                                    <th>Auction ID</th>
                                    <th>Value</th>
                                    <th>Expiry Time</th>
                                    <th>Bid</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <th scope="row">1</th>
                                    <td>12 BNB</td>
                                    <td>June-08-2020 11:22:08 UTC(14 seconds ago)</td>
                                    {/* <td><AuctionBidButton /></td> */}
                                    <td><AuctionBidButton auctionID={1} amount={amount = 11, denom = 'usdx'} /></td>
                                </tr>
                                <tr>
                                    <th scope="row">2</th>
                                    <td>15 BNB</td>
                                    <td>June-08-2020 11:22:08 UTC(14 seconds ago)</td>
                                    <td><AuctionBidButton /></td>
                                </tr>
                                <tr>
                                    <th scope="row">3</th>
                                    <td>17854 BNB</td>
                                    <td>June-08-2020 11:22:08 UTC(14 seconds ago)</td>
                                    <td><AuctionBidButton /></td>
                                </tr>
                                <tr>
                                    <th scope="row">2</th>
                                    <td>15 BNB</td>
                                    <td>June-08-2020 11:22:08 UTC(14 seconds ago)</td>
                                    <td><AuctionBidButton /></td>
                                </tr>
                                <tr>
                                    <th scope="row">3</th>
                                    <td>17854 BNB</td>
                                    <td>June-08-2020 11:22:08 UTC(14 seconds ago)</td>
                                    <td><AuctionBidButton /></td>
                                </tr>
                                <tr>
                                    <th scope="row">2</th>
                                    <td>15 BNB</td>
                                    <td>June-08-2020 11:22:08 UTC(14 seconds ago)</td>
                                    <td><AuctionBidButton /></td>
                                </tr>
                                <tr>
                                    <th scope="row">3</th>
                                    <td>17854 BNB</td>
                                    <td>June-08-2020 11:22:08 UTC(14 seconds ago)</td>
                                    <td><AuctionBidButton /></td>
                                </tr>
                                <tr>
                                    <th scope="row">2</th>
                                    <td>15 BNB</td>
                                    <td>June-08-2020 11:22:08 UTC(14 seconds ago)</td>
                                    <td><AuctionBidButton /></td>
                                </tr>
                                <tr>
                                    <th scope="row">3</th>
                                    <td>17854 BNB</td>
                                    <td>June-08-2020 11:22:08 UTC(14 seconds ago)</td>
                                    <td><AuctionBidButton /></td>
                                </tr>
                                <tr>
                                    <th scope="row">2</th>
                                    <td>15 BNB</td>
                                    <td>June-08-2020 11:22:08 UTC(14 seconds ago)</td>
                                    <td><AuctionBidButton /></td>
                                </tr>
                                <tr>
                                    <th scope="row">3</th>
                                    <td>17854 BNB</td>
                                    <td>June-08-2020 11:22:08 UTC(14 seconds ago)</td>
                                    <td><AuctionBidButton /></td>
                                </tr>
                                <tr>
                                    <th scope="row">2</th>
                                    <td>15 BNB</td>
                                    <td>June-08-2020 11:22:08 UTC(14 seconds ago)</td>
                                    <td><AuctionBidButton /></td>
                                </tr>
                                <tr>
                                    <th scope="row">3</th>
                                    <td>17854 BNB</td>
                                    <td>June-08-2020 11:22:08 UTC(14 seconds ago)</td>
                                    <td><AuctionBidButton /></td>
                                </tr>
                                <tr>
                                    <th scope="row">2</th>
                                    <td>15 BNB</td>
                                    <td>June-08-2020 11:22:08 UTC(14 seconds ago)</td>
                                    <td><AuctionBidButton /></td>
                                </tr>
                                <tr>
                                    <th scope="row">3</th>
                                    <td>17854 BNB</td>
                                    <td>June-08-2020 11:22:08 UTC(14 seconds ago)</td>
                                    <td><AuctionBidButton /></td>
                                </tr>
                                <tr>
                                    <th scope="row">2</th>
                                    <td>15 BNB</td>
                                    <td>June-08-2020 11:22:08 UTC(14 seconds ago)</td>
                                    <td><AuctionBidButton /></td>
                                </tr>
                                <tr>
                                    <th scope="row">3</th>
                                    <td>17854 BNB</td>
                                    <td>June-08-2020 11:22:08 UTC(14 seconds ago)</td>
                                    <td><AuctionBidButton /></td>
                                </tr>
                                <tr>
                                    <th scope="row">2</th>
                                    <td>15 BNB</td>
                                    <td>June-08-2020 11:22:08 UTC(14 seconds ago)</td>
                                    <td><AuctionBidButton /></td>
                                </tr>
                                <tr>
                                    <th scope="row">3</th>
                                    <td>17854 BNB</td>
                                    <td>June-08-2020 11:22:08 UTC(14 seconds ago)</td>
                                    <td><AuctionBidButton /></td>
                                </tr>
                                <tr>
                                    <th scope="row">2</th>
                                    <td>15 BNB</td>
                                    <td>June-08-2020 11:22:08 UTC(14 seconds ago)</td>
                                    <td><AuctionBidButton /></td>
                                </tr>
                                <tr>
                                    <th scope="row">3</th>
                                    <td>17854 BNB</td>
                                    <td>June-08-2020 11:22:08 UTC(14 seconds ago)</td>
                                    <td><AuctionBidButton /></td>
                                </tr>
                                <tr>
                                    <th scope="row">2</th>
                                    <td>15 BNB</td>
                                    <td>June-08-2020 11:22:08 UTC(14 seconds ago)</td>
                                    <td><AuctionBidButton /></td>
                                </tr>
                                <tr>
                                    <th scope="row">3</th>
                                    <td>17854 BNB</td>
                                    <td>June-08-2020 11:22:08 UTC(14 seconds ago)</td>
                                    <td><AuctionBidButton /></td>
                                </tr>
                                <tr>
                                    <th scope="row">2</th>
                                    <td>15 BNB</td>
                                    <td>June-08-2020 11:22:08 UTC(14 seconds ago)</td>
                                    <td><AuctionBidButton /></td>
                                </tr>
                                <tr>
                                    <th scope="row">3</th>
                                    <td>17854 BNB</td>
                                    <td>June-08-2020 11:22:08 UTC(14 seconds ago)</td>
                                    <td><AuctionBidButton /></td>
                                </tr>
                                <tr>
                                    <th scope="row">2</th>
                                    <td>15 BNB</td>
                                    <td>June-08-2020 11:22:08 UTC(14 seconds ago)</td>
                                    <td><AuctionBidButton /></td>
                                </tr>
                                <tr>
                                    <th scope="row">3</th>
                                    <td>17854 BNB</td>
                                    <td>June-08-2020 11:22:08 UTC(14 seconds ago)</td>
                                    <td><AuctionBidButton /></td>
                                </tr>
                                <tr>
                                    <th scope="row">2</th>
                                    <td>15 BNB</td>
                                    <td>June-08-2020 11:22:08 UTC(14 seconds ago)</td>
                                    <td><AuctionBidButton /></td>
                                </tr>
                                <tr>
                                    <th scope="row">3</th>
                                    <td>17854 BNB</td>
                                    <td>June-08-2020 11:22:08 UTC(14 seconds ago)</td>
                                    <td><AuctionBidButton /></td>
                                </tr>
                                
                                {/* {this.state.cdpList ? this.state.cdpList.slice(this.state.currentPage * this.state.pageSize, (this.state.currentPage + 1) * this.state.pageSize) : null} */}
                            </tbody>
                        </Table>
                    </div>
                    {/* <Pagination aria-label="Auction List Pagination" >
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
                    </Pagination> */}

                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={toggle}>Cancel</Button>
                </ModalFooter>
            </Modal>
        </div>
    );
}




export default class Auction extends Component {
    constructor(props) {
        super(props);
        this.state = {
            auctions: [],
            currentPage: 0,
            pageSize: 15,
            pagesCount: 0,
            denom: 'usdx',
            amount: 22,
        }

    }




    getAuctionList() {
        Meteor.call('account.auction', (error, result) => {
            if (error) {
                console.warn(error);
                this.setState({
                    loading: false,
                    auctions: null
                })
            }

            if (result) {
                result.forEach((el, i) => {
                    auctionList[i] = el.value
                })
                this.setState({
                    auctions: auctionList,
                })
            }
        })
    }


    componentDidMount() {
        this.getAuctionList();
    }

    handleClick(e, index) {
        e.preventDefault();
        this.setState({
            currentPage: index
        });
    };

    render() {

        
        if (!(this.state.auctions && this.state.auctions.length > 0)) {
            return (
                <div><AuctionList /></div>  
            );

        }

        else {
            return null
        }
    }
}
