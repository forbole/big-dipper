import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Table, Row, Col, Nav, NavItem, NavLink, Spinner, Card } from 'reactstrap';
import moment from 'moment';
import { Meteor } from 'meteor/meteor';
import { Helmet } from 'react-helmet';
import i18n from 'meteor/universe:i18n';
import { MissedBlocksTable } from './MissedRecords.jsx';

const T = i18n.createComponent();
export default class MissedBlocks extends Component{
    constructor(props){
        super(props);

        this.state = {
            missedBlocksList: "",
            totalMissed: 0
        }
    }

    componentDidUpdate(prevProps){
        if (this.props.missedBlocks != prevProps.missedBlocks){
            if (this.props.missedBlocks.length > 0){
                let totalCount = 0;
                this.setState({
                    missedBlocksList: this.props.missedBlocks.map((block,i) => {
                        totalCount += block.count;
                        return <tr key={i}>
                            <td>{i+1}</td>
                            <td><Link to={"/validator/"+((this.props.match.path.indexOf("/missed/blocks")>0)?block.proposer:block.voter)}>{(this.props.match.path.indexOf("/missed/blocks")>0)?block.proposerMoniker():block.voterMoniker()}</Link></td>
                            <td>{block.count}</td>
                        </tr>
                    })
                }, (err, result) => {
                    if (!err){
                        this.setState({totalMissed:totalCount});
                    }
                });


            }

        }
    }

    render() {
        if (this.props.loading){
            return <Spinner type="grow" color="primary" />
        }
        else{
            if (this.props.validatorExist){
                return <div>
                    <Helmet>
                        <title>{ this.props.validator.description.moniker } - Missed Blocks | The Big Dipper</title>
                        <meta name="description" content={"The missed blocks and precommits of "+this.props.validator.description.moniker} />
                    </Helmet>
                    <Link to={"/validator/"+this.props.validator.address} className="btn btn-link"><i className="fas fa-caret-left"></i> <T>validators.backToValidator</T></Link>
                    <h2><T moniker={this.props.validator.description.moniker}>validators.missedBlocksTitle</T></h2>
                    <Nav pills>
                        <NavItem>
                            <NavLink tag={Link} to={"/validator/"+this.props.validator.address+"/missed/blocks"} active={this.props.match.path.indexOf("/missed/blocks")>0}><T>validators.missedBlocks</T></NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink tag={Link} to={"/validator/"+this.props.validator.address+"/missed/precommits"} active={this.props.match.path.indexOf("/missed/precommits")>0}><T>validators.missedPrecommits</T></NavLink>
                        </NavItem>
                    </Nav>
                    {(this.props.missedBlocks&&this.props.missedBlocks.length>0)?
                        <div className="mt-3">
                            <p className="lead"><T>validators.totalMissed</T> {(this.props.match.path.indexOf("/missed/blocks")>0)?<T>validators.blocks</T>:<T>validators.precommits</T>}: {this.state.totalMissed}</p>
                            <Card>
                                <MissedBlocksTable missedRecords={this.props.missedRecords}/>
                            </Card>
                            <Card>

                            </Card>
                            <Table striped className="missed-table">
                                <thead>
                                    <tr>
                                        <th></th>
                                        <th><T>validators.block</T> {(this.props.match.path.indexOf("/missed/blocks")>0)?<T>blocks.proposer</T>:<T>common.voter</T>}</th>
                                        <th><T>validators.missedCount</T></th>
                                    </tr>
                                </thead>
                                <tbody>{this.state.missedBlocksList}</tbody>
                            </Table></div>:<div><T>validators.iDontMiss</T>{(this.props.match.path.indexOf("/missed/blocks")>0)?<T>common.block</T>:<T>common.precommit</T>}.</div>}
                    {this.props.statusExist?<div><em><T>validators.lastSyncTime</T>: {moment.utc(this.props.status.lastMissedBlockTime).format("D MMM YYYY, h:mm:ssa")}</em></div>:''}
                </div>
            }
            else return <div><T>validators.validatorNotExists</T></div>
        }

    }
}