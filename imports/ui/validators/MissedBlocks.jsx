import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Table, Badge, Row, Col, Nav, NavItem, NavLink } from 'reactstrap';
import moment from 'moment';

export default class MissedBlocks extends Component{
    constructor(props){
        super(props);

        this.state = {
            missedBlocksList: "",

        }
    }

    componentDidUpdate(prevProps){
        if (this.props.missedBlocks != prevProps.missedBlocks){
            if (this.props.missedBlocks.length > 0){
                this.setState({
                    missedBlocksList: this.props.missedBlocks.map((block,i) => {
                        return <tr key={i}>
                            <td>{i+1}</td>
                            <td><Link to={"/validator/"+(this.props.match.path.indexOf("/missed/blocks")>0)?block.proposer:block.voter}>{(this.props.match.path.indexOf("/missed/blocks")>0)?block.proposerMoniker():block.voterMoniker()}</Link></td>
                            <td>{block.count}</td>
                        </tr>
                    })
                })
            }
            
        }
    }

    render() {
        if (this.props.loading){
            return <div>Loading</div>
        }
        else{
            if (this.props.validatorExist){
                return <div>
                    <Link to={"/validator/"+this.props.validator.address} className="btn btn-link"><i className="fas fa-caret-left"></i> Back to Validator</Link>
                    <h2>Missed blocks of {this.props.validator.description.moniker}</h2>
                    <Nav pills>
                        <NavItem>
                            <NavLink tag={Link} to={"/validator/"+this.props.validator.address+"/missed/blocks"} active={this.props.match.path.indexOf("/missed/blocks")>0}>Missed Blocks</NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink tag={Link} to={"/validator/"+this.props.validator.address+"/missed/precommits"} active={this.props.match.path.indexOf("/missed/precommits")>0}>Missed Precommits</NavLink>
                        </NavItem>
                    </Nav>
                    {(this.props.missedBlocks&&this.props.missedBlocks.length>0)?
                    <Table striped className="missed-table">
                        <thead>
                            <tr>
                                <th></th>
                                <th>Block {(this.props.match.path.indexOf("/missed/blocks")>0)?'Proposer':'Voter'}</th>
                                <th>Miss Count</th>
                            </tr>
                        </thead>
                        <tbody>{this.state.missedBlocksList}</tbody>
                    </Table>:<div>I don't miss {(this.props.match.path.indexOf("/missed/blocks")>0)?'block':'precommit'}.</div>}
                    {this.props.statusExist?<div><em>Last sync time: {moment.utc(this.props.status.lastMissedBlockTime).format("D MMM YYYY, h:mm:ssa")}</em></div>:''}
                </div>
            }
            else return <div>Validator doesn't exist.</div>
        }
        
    }
}