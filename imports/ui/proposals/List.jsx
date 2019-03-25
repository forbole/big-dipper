import React, { Component } from 'react';
import moment from 'moment';
import { Table } from 'reactstrap';
import { Link } from 'react-router-dom';
import { DenomSymbol, ProposalStatusIcon } from '../components/Icons.jsx';
import numeral from 'numeral';

const ProposalRow = (props) => {
    return <tr>
    <th className="d-none d-sm-table-cell counter">{props.proposal.proposalId}</th>
    <td className="title"><Link to={"/proposals/"+props.proposal.proposalId}>{props.proposal.value.title}</Link></td>
    <td className="status"><ProposalStatusIcon status={props.proposal.value.proposal_status}/><span className="d-none d-sm-inline"> {props.proposal.value.proposal_status.match(/[A-Z]+[^A-Z]*|[^A-Z]+/g).join(" ")}</span></td>
    <td className="submit-block">{moment.utc(props.proposal.value.submit_time).format("D MMM YYYY, h:mm:ssa")}</td>
    <td className="voting-start">{(props.proposal.value.voting_start_time != "0001-01-01T00:00:00Z")?moment.utc(props.proposal.value.voting_start_time).format("D MMM YYYY, h:mm:ssa"):'Not started'}</td>
    <td className="deposit text-right">{props.proposal.value.total_deposit?props.proposal.value.total_deposit.map((deposit, i) => {
        return <div key={i}>{numeral(deposit.amount).format('0,0')} {deposit.denom}</div>
    }):'0'} </td>
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
                            <th className="submit-block"><i className="fas fa-box"></i> <span className="d-none d-sm-inline">Submit Time (UTC)</span></th>
                            <th className="voting-start"><i className="fas fa-box-open"></i> <span className="d-none d-sm-inline">Voting Start Time (UTC)</span></th>
                            <th className="deposit text-right"><i className="material-icons">attach_money</i> <span className="d-none d-sm-inline">Total Deposit</span></th>
                        </tr>
                    </thead>
                    <tbody>{this.state.proposals}</tbody>
                </Table>
            )    
        }
    }
}