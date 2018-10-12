import React, { Component } from 'react';
import { Table } from 'reactstrap';
import { Link } from 'react-router-dom';

const IconStatus = (status) => {
    switch (status){
        case 'Passed':
            return <i className="fas fa-check-circle text-success"></i>;
        case 'Rejected':
            return <i className="fas fa-times-circle text-danger"></i>;
        case 'Removed':
            return <i className="fas fa-trash-alt text-dark"></i>
        case 'DepositPeriod':
            return <i className="fas fa-battery-half text-warning"></i>;
        case 'VotingPeriod':
            return <i className="fas fa-hand-paper text-info"></i>;
    }
}

const ProposalRow = (props) => {
    return <tr>
    <th className="d-none d-sm-table-cell counter">{props.proposal.proposalId}</th>
    <td className="title"><Link to="#">{props.proposal.value.title}</Link></td>
    <td className="status">{IconStatus(props.proposal.value.proposal_status)}<span className="d-none d-sm-inline"> {props.proposal.value.proposal_status}</span></td>
    <td className="submit-block">{props.proposal.value.submit_block}</td>
    <td className="voting-start">{(props.proposal.value.voting_start_block > 0)?props.proposal.value.voting_start_block:'Not started'}</td>
    <td className="deposit">{props.proposal.value.total_deposit[0].amount+" "+denomSymbol(props.proposal.value.total_deposit[0].denom)}</td>
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
                            <th className="status"><i className="fas fa-toggle-on"></i> <span className="d-none d-sm-inline">Status</span></th>
                            <th className="submit-block"><i className="fas fa-box"></i> <span className="d-none d-sm-inline">Submit Block</span></th>
                            <th className="voting-start"><i className="fas fa-box-open"></i> <span className="d-none d-sm-inline">Voting Start Block</span></th>
                            <th className="deposit"><i className="material-icons">attach_money</i> <span className="d-none d-sm-inline">Total Deposit</span></th>
                        </tr>
                    </thead>
                    <tbody>{this.state.proposals}</tbody>
                </Table>
            )    
        }
    }
}