import React, { Component } from 'react';
import { Table } from 'reactstrap';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { Meteor } from 'meteor/meteor';


const ProposalRow = (props) => {
    // console.log(props.proposal);
    // let moniker = (props.proposal.description.moniker)?props.validator.description.moniker:props.validator.address;
    // return <tr><th scope="row" className="d-none d-sm-block counter">{props.index+1}</th><td><Link to="#">{moniker}</Link></td><td>{props.validator.voting_power}</td><td className="uptime"><Progress animated value={props.validator.uptime}>{props.validator.uptime?props.validator.uptime.toFixed(2):0}%</Progress></td><td>{(props.validator.lastSeen)?moment.utc(props.validator.lastSeen).format("D MMM YYYY, h:mm:ssa z"):''}</td></tr>
    return <tr>
    <th className="d-none d-sm-table-cell counter">{props.proposal.proposalId}</th>
    <td className="title">{props.proposal.value.title}</td>
    <td className="status">{props.proposal.value.proposal_status}</td>
    <td className="submit-block">{props.proposal.value.submit_block}</td>
    <td className="voting-start">{props.proposal.value.voting_start_block}</td>
    <td className="deposit">{props.proposal.value.total_deposit[0].amount+" "+props.proposal.value.total_deposit[0].denom}</td>
</tr>
}

export default class List extends Component{
    constructor(props){
        super(props);
        this.state = {
            proposals: ""
        }
    }

    componentDidUpdate(prevState){
        if (this.props.proposals != prevState.proposals){
            if (this.props.proposals.length > 0){
                this.setState({
                    proposals: this.props.proposals.map((proposal, i) => {
                        return <ProposalRow key={i} index={i} proposal={proposal} />
                    })
                })    
            }
        }
    }

    render(){
        if (this.props.loading){
            return <div>Loading</div>
        }
        else{
            return (
                <Table striped className="proposal-list">
                    <thead>
                        <tr>
                            <th className="d-none d-sm-table-cell counter"><i className="fas fa-hashtag"></i> Proposal ID</th>
                            <th className="title"><i className="material-icons">view_headline</i> <span className="d-none d-sm-inline">Title</span></th>
                            <th className="status"><i class="fas fa-toggle-on"></i> <span className="d-none d-sm-inline">Proposal Status</span></th>
                            <th className="submit-block"><i class="fas fa-box"></i> <span className="d-none d-sm-inline">Submit Block</span></th>
                            <th className="voting-start"><i class="fas fa-box-open"></i> <span className="d-none d-sm-inline">Voting Start Block</span></th>
                            <th className="deposit"><i className="material-icons">attach_money</i> <span className="d-none d-sm-inline">Total Deposit</span></th>
                        </tr>
                    </thead>
                    <tbody>{this.state.proposals}</tbody>
                </Table>
            )    
        }
    }
}