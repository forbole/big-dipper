import React, { Component } from 'react';
import moment from 'moment';
import { Row, Col, Progress, Card, Spinner } from 'reactstrap';
import { Link } from 'react-router-dom';
import { ProposalStatusIcon, VoteIcon } from '../components/Icons';
import Account from '../components/Account.jsx';
import numbro from 'numbro';
import { Markdown } from 'react-showdown';
import posed from 'react-pose';
import i18n from 'meteor/universe:i18n';

const T = i18n.createComponent();

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
            tallyDate: 'not started',
            voteStarted: false,
            totalVotes: 0,
            open: false,
            yesPercent: 0,
            abstainPercent: 0,
            noPercent: 0,
            noWithVetoPercent: 0,
            proposalValid: false,
            orderDir: -1
        }
    }

    componentDidUpdate(prevProps){
        if (this.props.proposal != prevProps.proposal){
            // console.log(this.props.proposal.value);
            this.setState({
                proposal: this.props.proposal,
                deposit: <div>{this.props.proposal.total_deposit?this.props.proposal.total_deposit.map((deposit, i) => {
                    return <div key={i}>{numbro(deposit.amount).format(0,0)} {deposit.denom}</div>
                }):''} </div>
            });

            let now = moment();
            if (this.props.proposal.voting_start_time != '0001-01-01T00:00:00Z'){
                if (now.diff(moment(this.props.proposal.voting_start_time)) > 0){
                    let endVotingTime = moment(this.props.proposal.voting_end_time);
                    if (now.diff(endVotingTime) < 0){
                        // not reach end voting time yet
                        let totalVotes = 0;
                        for (let i in this.props.proposal.tally){
                            totalVotes += parseInt(this.props.proposal.tally[i]);
                        }

                        this.setState({
                            tally: this.props.proposal.tally,
                            tallyDate: moment.utc(this.props.proposal.updatedAt).format("D MMM YYYY, h:mm:ssa z"),
                            voteStarted: true,
                            voteEnded: false,
                            totalVotes: totalVotes,
                            yesPercent: (totalVotes>0)?parseInt(this.props.proposal.tally.yes)/totalVotes*100:0,
                            abstainPercent: (totalVotes>0)?parseInt(this.props.proposal.tally.abstain)/totalVotes*100:0,
                            noPercent: (totalVotes>0)?parseInt(this.props.proposal.tally.no)/totalVotes*100:0,
                            noWithVetoPercent: (totalVotes>0)?parseInt(this.props.proposal.tally.no_with_veto)/totalVotes*100:0,
                            proposalValid: (this.state.totalVotes/this.props.chain.totalVotingPower > parseFloat(this.props.chain.gov.tallyParams.quorum))?true:false
                        })
                    }
                    else{
                        let totalVotes = 0;
                        for (let i in this.props.proposal.final_tally_result){
                            totalVotes += parseInt(this.props.proposal.final_tally_result[i]);
                        }

                        this.setState({
                            tally: this.props.proposal.final_tally_result,
                            tallyDate: 'final',
                            voteStarted: true,
                            voteEnded: true,
                            totalVotes: totalVotes,
                            yesPercent: (totalVotes>0)?parseInt(this.props.proposal.final_tally_result.yes)/totalVotes*100:0,
                            abstainPercent: (totalVotes>0)?parseInt(this.props.proposal.final_tally_result.abstain)/totalVotes*100:0,
                            noPercent: (totalVotes>0)?parseInt(this.props.proposal.final_tally_result.no)/totalVotes*100:0,
                            noWithVetoPercent: (totalVotes>0)?parseInt(this.props.proposal.final_tally_result.no_with_veto)/totalVotes*100:0,
                            proposalValid: (this.state.totalVotes/this.props.chain.totalVotingPower > parseFloat(this.props.chain.gov.tallyParams.quorum))?true:false
                        })
                    }
                }
            }
        }
    }

    handleClick = (i,e) => {
        e.preventDefault();

        this.setState({
            open: this.state.open === i ? false : i
        });
    }

    toggleDir(e) {
        e.preventDefault();
        this.setState({
            orderDir: this.state.orderDir * -1
        });
    }

    renderTallyResultDetail(openState, option) {
        let votes = this.props.proposal.votes?this.props.proposal.votes.filter((vote) => vote.option == option):[];
        let orderDir = this.state.orderDir;
        votes = votes.sort((vote1, vote2) => (vote1['votingPower'] - vote2['votingPower']) * orderDir);

        return <Result className="tally-result-detail" pose={this.state.open === openState ? 'open' : 'closed'}>
                <Card className='tally-result-table'>
                    {(votes.length)?<Card body><Row className="header text-nowrap">
                        <Col className="d-none d-md-block counter" md={1}>&nbsp;</Col>
                        <Col className="moniker" md={4}>
                            <i className="material-icons">perm_contact_calendar</i>
                            <span className="d-inline-block d-md-none d-lg-inline-block"><T>common.voter</T></span>
                        </Col>
                        <Col className="voting-power" md={4} onClick={(e) => this.toggleDir(e)}>
                            <i className="material-icons">power</i>
                            <span className="d-inline-block d-md-none d-lg-inline-block"><T>common.votingPower</T></span>
                            <i className="material-icons"> {(this.state.orderDir == 1)?'arrow_drop_up':'arrow_drop_down'}</i>
                        </Col>
                        <Col className="voting-power-percent" md={3}>
                            <i className="material-icons">equalizer</i>
                            <span className="d-inline-block d-md-none d-lg-inline-block"><T>common.votingPower</T> %</span>
                        </Col>
                    </Row></Card>:""}
                    {votes.map((vote, i) =>
                        <Card body key={i}><Row className='voter-info'>
                            <Col className="d-none d-md-block counter data" md={1}>{i+1}</Col>
                            <Col className="moniker data" md={4}>
                                <Account address={vote.voter} />
                            </Col>
                            <Col className="voting-power data" md={4}>
                                <i className="material-icons d-md-none">power</i>
                                {(vote.votingPower!==undefined)?numbro(vote.votingPower).format('0,0.00'):""}
                            </Col>
                            <Col className="voting-power-percent data" md={3}>
                                <i className="material-icons d-md-none">equalizer</i>
                                {(vote.votingPower!==undefined)?numbro(vote.votingPower/this.state.totalVotes).format('0,0.00%'):""}
                            </Col>
                        </Row></Card>
                    )}
                </Card>
            </Result>
    }

    render(){
        if (this.props.loading){
            return <Spinner type="grow" color="primary" />
        }
        else{
            if (this.props.proposalExist && this.state.proposal != ''){
                // console.log(this.state.proposal);
                return <div>
                    <div className="proposal bg-light">
                        <Row className="mb-2 border-top">
                            <Col md={3} className="label"><T>proposals.proposalID</T></Col>
                            <Col md={9} className="value">{this.props.proposal.proposal_id}</Col>
                        </Row>
                        <Row className="mb-2 border-top">
                            <Col md={3} className="label"><T>common.proposer</T></Col>
                            <Col md={9} className="value"><Account address={this.props.proposal.proposer} /></Col>
                        </Row>
                        <Row className="mb-2 border-top">
                            <Col md={3} className="label"><T>proposals.title</T></Col>
                            <Col md={9} className="value">{this.props.proposal.proposal_content.value.title}</Col>
                        </Row>
                        <Row className="mb-2 border-top">
                            <Col md={3} className="label"><T>proposals.description</T></Col>
                            <Col md={9} className="value"><Markdown markup={this.props.proposal.proposal_content.value.description} /></Col>
                        </Row>
                        <Row className="mb-2 border-top">
                            <Col md={3} className="label"><T>proposals.proposalType</T></Col>
                            <Col md={9} className="value">{this.props.proposal.proposal_content.type.substr(4).match(/[A-Z]+[^A-Z]*|[^A-Z]+/g).join(" ")}</Col>
                        </Row>
                        <Row className="mb-2 border-top">
                            <Col md={3} className="label"><T>proposals.proposalStatus</T></Col>
                            <Col md={9} className="value"><ProposalStatusIcon status={this.props.proposal.proposal_status} /> {(this.props.proposal.proposal_status)?this.props.proposal.proposal_status.match(/[A-Z]+[^A-Z]*|[^A-Z]+/g).join(" "):''}</Col>
                        </Row>
                        <Row className="mb-2 border-top">
                            <Col md={3} className="label"><T>proposals.deposit</T></Col>
                            <Col xs={10} md={8} className="value">{this.state.deposit}</Col>
                            <Col xs={2} md={1} onClick={(e) => this.handleClick(5,e)}><i className="material-icons">{this.state.open === 5 ? 'arrow_drop_down' : 'arrow_left'}</i></Col>
                            <Col xs={12}>
                                <Result className="tally-result-detail" pose={this.state.open === 5 ? 'open' : 'closed'}>
                                    <ol>
                                        {this.props.proposal.deposits?this.props.proposal.deposits.map((deposit,i)=>{
                                            return <li key={i}>
                                                <Account address={deposit.depositor} />
                                                {deposit.amount.map((amount, j) => {
                                                    return <div key={j}>{numbro(amount.amount).format("0,0")} {amount.denom}</div>
                                                })}
                                            </li>
                                        }):''}
                                    </ol>
                                </Result>
                            </Col>
                        </Row>
                        <Row className="mb-2 border-top tally-result">
                            <Col md={3} className="label"><T>proposals.tallyResult</T> <em>({this.state.tallyDate})</em></Col>
                            <Col md={9} className="value">
                                <Row>
                                    <Col xs={6} sm={5} md={4}><VoteIcon vote="yes" /> Yes</Col>
                                    <Col xs={5} sm={6} md={7} className="tally-result-value">{this.state.tally?numbro(this.state.tally.yes).format("0,0"):''}</Col>
                                    <Col xs={1} onClick={(e) => this.handleClick(1,e)}><i className="material-icons">{this.state.open === 1 ? 'arrow_drop_down' : 'arrow_left'}</i></Col>
                                    <Col xs={12}>
                                        {this.renderTallyResultDetail(1, 'Yes')}
                                    </Col>
                                </Row>
                                <Row>
                                    <Col xs={6} sm={5} md={4}><VoteIcon vote="abstain" /> Abstain</Col>
                                    <Col xs={5} sm={6} md={7} className="tally-result-value">{this.state.tally?numbro(this.state.tally.abstain).format("0,0"):''}</Col>
                                    <Col xs={1} onClick={(e) => this.handleClick(2,e)}><i className="material-icons">{this.state.open === 2 ? 'arrow_drop_down' : 'arrow_left'}</i></Col>
                                    <Col xs={12}>
                                        {this.renderTallyResultDetail(2, 'Abstain')}
                                    </Col>
                                </Row>
                                <Row>
                                    <Col xs={6} sm={5} md={4}><VoteIcon vote="no" /> No</Col>
                                    <Col xs={5} sm={6} md={7} className="tally-result-value">{this.state.tally?numbro(this.state.tally.no).format("0,0"):''}</Col>
                                    <Col xs={1} onClick={(e) => this.handleClick(3,e)}><i className="material-icons">{this.state.open === 3 ? 'arrow_drop_down' : 'arrow_left'}</i></Col>
                                    <Col xs={12}>
                                        {this.renderTallyResultDetail(3, 'No')}
                                    </Col>
                                </Row>
                                <Row>
                                    <Col xs={6} sm={5} md={4}><VoteIcon vote="no_with_veto" /> No with Veto</Col>
                                    <Col xs={5} sm={6} md={7} className="tally-result-value">{this.state.tally?numbro(this.state.tally.no_with_veto).format("0,0"):''}</Col>
                                    <Col xs={1} onClick={(e) => this.handleClick(4,e)}><i className="material-icons">{this.state.open === 4 ? 'arrow_drop_down' : 'arrow_left'}</i></Col>
                                    <Col xs={12}>
                                        {this.renderTallyResultDetail(4, 'NoWithVeto')}
                                    </Col>
                                </Row>
                                {this.state.voteStarted?<Row>
                                    <Col xs={12}>
                                        <Progress multi>
                                            <Progress bar animated color="success" value={this.state.yesPercent}><T>proposals.yes</T> {numbro(this.state.yesPercent).format("0.00")}%</Progress>
                                            <Progress bar animated color="warning" value={this.state.abstainPercent}><T>proposals.abstain</T> {numbro(this.state.abstainPercent).format("0.00")}%</Progress>
                                            <Progress bar animated color="danger" value={this.state.noPercent}><T>proposals.no</T> {numbro(this.state.noPercent).format("0.00")}%</Progress>
                                            <Progress bar animated color="info" value={this.state.noWithVetoPercent}><T>proposals.noWithVeto</T> {numbro(this.state.noWithVetoPercent).format("0.00")}%</Progress>
                                        </Progress>
                                    </Col>
                                    <Col xs={12}>
                                        <Card body className="tally-info">
                                            <em>
                                                <T _purify={false} percent={numbro(this.state.totalVotes/this.props.chain.totalVotingPower).format("0.00%")}>proposals.percentageVoted</T><br/>
                                                {this.state.proposalValid?<T _props={{className:'text-success'}} tentative={(!this.state.voteEnded)?'(tentatively) ':''}>proposals.validMessage</T>:(this.state.voteEnded)?<T _props={{className:'text-danger'}} quorum={numbro(this.props.chain.gov.tallyParams.quorum).format("0.00%")} _purify={false}>proposals.invalidMessage</T>:<T moreVotes={numbro(this.props.chain.totalVotingPower*this.props.chain.gov.tallyParams.quorum-this.state.totalVotes).format("0,0")} _purify={false}>proposals.moreVoteMessage</T>}
                                            </em>
                                        </Card>
                                    </Col>
                                </Row>:'Voting not started yet.'}
                            </Col>
                        </Row>
                        <Row className="mb-2 border-top">
                            <Col md={3} className="label"><T>proposals.submitTime</T></Col>
                            <Col md={9} className="value">{moment.utc(this.state.proposal.submit_time).format("D MMM YYYY, h:mm:ssa z")}</Col>
                        </Row>
                        <Row className="mb-2 border-top">
                            <Col md={3} className="label"><T>proposals.depositEndTime</T></Col>
                            <Col md={9} className="value">{moment.utc(this.state.proposal.deposit_end_time).format("D MMM YYYY, h:mm:ssa z")}</Col>
                        </Row>
                        <Row className="mb-2 border-top">
                            <Col md={3} className="label"><T>proposals.votingStartTime</T></Col>
                            <Col md={9} className="value">{(this.state.proposal.voting_start_time != '0001-01-01T00:00:00Z')?moment.utc(this.state.proposal.voting_start_time).format("D MMM YYYY, h:mm:ssa z"):'-'}</Col>
                        </Row>
                        <Row className="mb-2 border-top">
                            <Col md={3} className="label"><T>proposals.votingEndTime</T></Col>
                            <Col md={9} className="value">{(this.state.proposal.voting_start_time != '0001-01-01T00:00:00Z')?moment.utc(this.state.proposal.voting_end_time).format("D MMM YYYY, h:mm:ssa z"):'-'}</Col>
                        </Row>
                    </div>
                    <Link to="/proposals" className="btn btn-primary"><i className="fas fa-caret-left"></i> <T>common.backToList</T></Link>
                </div>
            }
            else{
                return <div><T>proposals.notFound</T></div>
            }
        }
    }
}