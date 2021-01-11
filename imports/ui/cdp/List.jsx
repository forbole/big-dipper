import React, { Component } from 'react';
import { Table, Spinner } from 'reactstrap';
import { Link } from 'react-router-dom';
import numbro from 'numbro';
import i18n from 'meteor/universe:i18n';
import TimeStamp from '../components/TimeStamp.jsx';
import Coin from '/both/utils/coins.js'
import { Pagination, PaginationItem, PaginationLink } from 'reactstrap';

const T = i18n.createComponent();
let minCollateralRatio = 0;

const CDPRow = (props) => {
    return <tr>
        <th className="d-none d-sm-table-cell counter ">{(props.cdpList.cdp.id)}</th>
        <td className="owner"><Link to={"/account/" + props.cdpList.cdp.owner}>{props.cdpList.cdp.owner}</Link></td>
        <td className="collateral-deposited bold-text">{props.cdpList.cdp.collateral ? <div>{new Coin(props.cdpList.cdp.collateral.amount, props.cdpList.cdp.collateral.denom).toString()}</div> : '0 usdx'}</td>
        <td className="principal-drawn bold-text">{props.cdpList.cdp.principal ? <div>{new Coin(props.cdpList.cdp.principal.amount, props.cdpList.cdp.principal.denom).toString()}</div> : '0 usdx'}</td>
        <td className="value"> {parseFloat(props.cdpList.collateralization_ratio) > parseFloat(minCollateralRatio) ? <img src="/img/increase.svg" className="img-fluid collateral-ratio-icon pr-1 pb-1" /> : <img src="/img/reduce.svg" className="img-fluid collateral-ratio-icon pr-1 pb-1" />}{numbro(parseFloat(props.cdpList.collateralization_ratio)).format('0.000000')}</td>
        <td className="accumulated-fees">{props.cdpList.cdp.accumulated_fees ? <div>{new Coin(props.cdpList.cdp.accumulated_fees.amount, props.cdpList.cdp.accumulated_fees.denom).toString()}</div> : '0 usdx'}</td>
        <td className="fees-updated"><TimeStamp time={props.cdpList.cdp.fees_updated} /></td>
    </tr>
}

export default class List extends Component {

    constructor(props) {
        super(props);
        this.state = {
            cdpList: [],
            currentPage: 0,
            pageSize: 15,
            pagesCount: 0,
            minCollateralRatio: 0,
            collateralParams: [],
            loading: true,
        }
    }

    componentDidMount() {
        this.getMinCollateralRatio();
        this.getCDPList();
    }

    componentDidUpdate(prevProps) {
        if (!_.isEqual(prevProps.collateralType, this.props.collateralType)) {
            this.setState({
                loading: true
            })
            this.getCDPList();
        }
        
    }

    getCDPList = () => {
        Meteor.call('cdp.getCDPList', this.props.collateralType, (error, result) => {
            if(error){
                this.setState({
                    cdpList: undefined,
                    pagesCount: 0,
                    loading: true

                })
            }
            else {
                this.setState({
                    cdpList: result.map((cdpList, i) => {
                        return <CDPRow key={i} index={i} cdpList={cdpList} />
                    }),
                    pagesCount: Math.ceil(result.length / this.state.pageSize),
                    loading: false
                })
            }
        })
    }


    getMinCollateralRatio = () => {
        Meteor.call('cdp.getCDPParams', (error, result) => {
            if (error) {
                console.warn(error);
                this.setState({
                    collateralParams: undefined
                })
            }
            if (result) {
                minCollateralRatio = result.collateral_params[0].liquidation_ratio
                this.setState({
                    collateralParams: result.collateral_params[0]

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
        if (this.state.loading) {
            return <Spinner type="grow" color="primary" />
        }
        else {
            return (<div>
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
                            {this.state.cdpList ? this.state.cdpList.slice(this.state.currentPage * this.state.pageSize, (this.state.currentPage + 1) * this.state.pageSize) : null}
                        </tbody>
                    </Table>
                </div>
                <Pagination aria-label="CDP List Pagination" >
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