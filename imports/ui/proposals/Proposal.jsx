import React, { Component } from 'react';
import moment from 'moment';
import { Row, Col } from 'reactstrap';
import { Link } from 'react-router-dom';
import { ProposalStatusIcon, VoteIcon } from '../components/Icons';
import Account from '../components/Account.jsx';
import numeral from 'numeral';
import { Markdown } from 'react-showdown';
import posed from 'react-pose';

const Result = posed.div({
    closed: { height: 0},
    open: { height: 'auto'}
});
export default class Proposal extends Component{
    constructor(props){
        super(props);

        let showdown  = require('showdown');
        showdown.setFlavor('github');
        this.state = {
            proposal: '',
            deposit: '',
            tallyDate: '',
            open: false
        }
    }

    componentDidUpdate(prevProps){
        if (this.props.proposal != prevProps.proposal){
            // console.log(this.props.proposal.value);
            this.setState({
                proposal: this.props.proposal.value,
                deposit: <div>{this.props.proposal.value.total_deposit?this.props.proposal.value.total_deposit.map((deposit, i) => {
                    return <div key={i}>{numeral(deposit.amount).format(0,0)} {deposit.denom}</div>
                }):''} </div>
            });

            let now = moment();
            let endVotingTime = moment(this.props.proposal.value.voting_end_time);
            if (now.diff(endVotingTime) < 0){
                // not reach end voting time yet
                // console.log(this.props.proposal);
                this.setState({
                    tally: this.props.proposal.tally,
                    tallyDate: moment.utc(this.props.proposal.updatedAt).format("D MMM YYYY, h:mm:ssa z")
                })
            }
            else{
                this.setState({
                    tally: this.props.proposal.value.final_tally_result,
                    tallyDate: 'final'
                })
            }
        }
    }

    handleClick = (i,e) => {
        e.preventDefault();

        this.setState({
            open: this.state.open === i ? false : i
        });
    }

    render(){
        if (this.props.loading){
            return <div>Loading</div>
        }
        else{
            return <div>
                <div className="proposal bg-light">
                    <Row className="mb-2 border-top border-secondary">
                        <Col md={3} className="label">Proposal ID</Col>
                        <Col md={9} className="value">{this.state.proposal.proposal_id}</Col>
                    </Row>
                    <Row className="mb-2 border-top border-secondary">
                        <Col md={3} className="label">Proposer</Col>
                        <Col md={9} className="value"><Account address={this.props.proposal.proposer} /></Col>
                    </Row>
                    <Row className="mb-2 border-top border-secondary">
                        <Col md={3} className="label">Title</Col>
                        <Col md={9} className="value">{this.state.proposal.title}</Col>
                    </Row>
                    <Row className="mb-2 border-top border-secondary">
                        <Col md={3} className="label">Description</Col>
                        <Col md={9} className="value"><Markdown markup={this.state.proposal.description} /></Col>
                    </Row>
                    <Row className="mb-2 border-top border-secondary">
                        <Col md={3} className="label">Proposal Type</Col>
                        <Col md={9} className="value">{this.state.proposal.proposal_type}</Col>
                    </Row>
                    <Row className="mb-2 border-top border-secondary">
                        <Col md={3} className="label">Proposal Status</Col>
                        <Col md={9} className="value"><ProposalStatusIcon status={this.state.proposal.proposal_status} /> {(this.state.proposal.proposal_status)?this.state.proposal.proposal_status.match(/[A-Z]+[^A-Z]*|[^A-Z]+/g).join(" "):''}</Col>
                    </Row>
                    <Row className="mb-2 border-top border-secondary">
                        <Col md={3} className="label">Deposit</Col>
                        <Col xs={10} md={8} className="value">{this.state.deposit}</Col>
                        <Col xs={2} md={1} onClick={(e) => this.handleClick(5,e)}><i className="material-icons">{this.state.open === 5 ? 'arrow_drop_down' : 'arrow_left'}</i></Col>
                        <Col xs={12}>
                            <Result className="tally-result-detail" pose={this.state.open === 5 ? 'open' : 'closed'}>
                                <ol>
                                    {this.props.proposal.deposits?this.props.proposal.deposits.map((deposit,i)=>{
                                        return <li key={i}>
                                            <Account address={deposit.depositor} />
                                            {deposit.amount.map((amount, j) => {
                                                return <div key={j}>{numeral(amount.amount).format("0,0")} {amount.denom}</div>
                                            })}
                                        </li>
                                    }):''}
                                </ol>
                            </Result>
                        </Col>
                    </Row>
                    <Row className="mb-2 border-top border-secondary tally-result">
                        <Col md={3} className="label">Tally Result <em>({this.state.tallyDate})</em></Col>
                        <Col md={9} className="value">
                            <Row>
                                <Col xs={6} sm={5} md={4}><VoteIcon vote="yes" /> Yes</Col>
                                <Col xs={5} sm={6} md={7} className="tally-result-value">{this.state.tally?numeral(this.state.tally.yes).format("0,0"):''}</Col>
                                <Col xs={1} onClick={(e) => this.handleClick(1,e)}><i className="material-icons">{this.state.open === 1 ? 'arrow_drop_down' : 'arrow_left'}</i></Col>
                                <Col xs={12}>
                                    <Result className="tally-result-detail" pose={this.state.open === 1 ? 'open' : 'closed'}>
                                            <ol>
                                                {this.props.proposal.votes?this.props.proposal.votes.map((vote,i)=>{
                                                    if (vote.option == 'Yes'){
                                                        return <li key={i}><Account address={vote.voter} /></li>
                                                    }
                                                    else return ''
                                                }):''}
                                            </ol>
                                    </Result>
                                </Col>
                            </Row>
                            <Row>
                                <Col xs={6} sm={5} md={4}><VoteIcon vote="abstain" /> Abstain</Col>
                                <Col xs={5} sm={6} md={7} className="tally-result-value">{this.state.tally?numeral(this.state.tally.abstain).format("0,0"):''}</Col>
                                <Col xs={1} onClick={(e) => this.handleClick(2,e)}><i className="material-icons">{this.state.open === 2 ? 'arrow_drop_down' : 'arrow_left'}</i></Col>
                                <Col xs={12}>
                                    <Result className="tally-result-detail" pose={this.state.open === 2 ? 'open' : 'closed'}>
                                            <ol>
                                                {this.props.proposal.votes?this.props.proposal.votes.map((vote,i)=>{
                                                    if (vote.option == 'Abstain'){
                                                        return <li key={i}><Account address={vote.voter} /></li>
                                                    }
                                                    else return ''
                                                }):''}
                                            </ol>
                                    </Result>
                                </Col>
                            </Row>
                            <Row>
                                <Col xs={6} sm={5} md={4}><VoteIcon vote="no" /> No</Col>
                                <Col xs={5} sm={6} md={7} className="tally-result-value">{this.state.tally?numeral(this.state.tally.no).format("0,0"):''}</Col>
                                <Col xs={1} onClick={(e) => this.handleClick(3,e)}><i className="material-icons">{this.state.open === 3 ? 'arrow_drop_down' : 'arrow_left'}</i></Col>
                                <Col xs={12}>
                                    <Result className="tally-result-detail" pose={this.state.open === 3 ? 'open' : 'closed'}>
                                            <ol>
                                                {this.props.proposal.votes?this.props.proposal.votes.map((vote,i)=>{
                                                    if (vote.option == 'No'){
                                                        return <li key={i}><Account address={vote.voter} /></li>
                                                    }
                                                    else return ''
                                                }):''}
                                            </ol>
                                    </Result>
                                </Col>
                            </Row>
                            <Row>
                                <Col xs={6} sm={5} md={4}><VoteIcon vote="no_with_veto" /> No with Veto</Col>
                                <Col xs={5} sm={6} md={7} className="tally-result-value">{this.state.tally?numeral(this.state.tally.no_with_veto).format("0,0"):''}</Col>
                                <Col xs={1} onClick={(e) => this.handleClick(4,e)}><i className="material-icons">{this.state.open === 4 ? 'arrow_drop_down' : 'arrow_left'}</i></Col>
                                <Col xs={12}>
                                    <Result className="tally-result-detail" pose={this.state.open === 4 ? 'open' : 'closed'}>
                                            <ol>
                                                {this.props.proposal.votes?this.props.proposal.votes.map((vote,i)=>{
                                                    if (vote.option == 'NoWithVeto'){
                                                        return <li key={i}><Account address={vote.voter} /></li>
                                                    }
                                                    else return ''
                                                }):''}
                                            </ol>
                                    </Result>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                    <Row className="mb-2 border-top border-secondary">
                        <Col md={3} className="label">Submit Time</Col>
                        <Col md={9} className="value">{moment.utc(this.state.proposal.submit_time).format("D MMM YYYY, h:mm:ssa z")}</Col>
                    </Row>
                    <Row className="mb-2 border-top border-secondary">
                        <Col md={3} className="label">Deposit End Time</Col>
                        <Col md={9} className="value">{moment.utc(this.state.proposal.deposit_end_time).format("D MMM YYYY, h:mm:ssa z")}</Col>
                    </Row>
                    <Row className="mb-2 border-top border-secondary">
                        <Col md={3} className="label">Start Voting Time</Col>
                        <Col md={9} className="value">{moment.utc(this.state.proposal.voting_start_time).format("D MMM YYYY, h:mm:ssa z")}</Col>
                    </Row>
                    <Row className="mb-2 border-top border-secondary">
                        <Col md={3} className="label">End Voting Time</Col>
                        <Col md={9} className="value">{moment.utc(this.state.proposal.voting_end_time).format("D MMM YYYY, h:mm:ssa z")}</Col>
                    </Row>
                </div>
                <Link to="/proposals" className="btn btn-primary"><i className="fas fa-caret-left"></i> Back to list</Link>
            </div>
        }
    }
}