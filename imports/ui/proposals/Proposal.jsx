import React, { Component } from 'react';
import moment from 'moment';
import { Row, Col, Progress, Card, CardHeader, CardBody, Spinner,
    TabContent, TabPane, Nav, NavLink, NavItem, Table } from 'reactstrap';
import { Link } from 'react-router-dom';
import { ProposalStatusIcon, VoteIcon } from '../components/Icons';
import Account from '../components/Account.jsx';
import PChart from '../components/Chart.jsx';
import numbro from 'numbro';
import { Markdown } from 'react-showdown';
import { Helmet } from 'react-helmet';
import posed from 'react-pose';
import i18n from 'meteor/universe:i18n';
import { Meteor } from 'meteor/meteor';
import Coin from '/both/utils/coins.js';
import TimeStamp from '../components/TimeStamp.jsx';
import { ProposalActionButtons } from '../ledger/LedgerActions.jsx';
import voca from 'voca';
import BigNumber from 'bignumber.js';
import GlobalVariables from '../../../both/utils/global-variables.js';

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
            tallyDate: <T>proposals.notStarted</T>,
            voteStarted: false,
            totalVotes: new BigNumber(0),
            open: false,
            yesPower: new BigNumber(0),
            abstainPower: new BigNumber(0),
            noPower: new BigNumber(0),
            noWithVetoPower: new BigNumber(0),
            yesPercent: new BigNumber(0),
            abstainPercent: new BigNumber(0),
            noPercent: new BigNumber(0),
            noWithVetoPercent: new BigNumber(0),
            proposalValid: false,
            orderDir: -1,
            breakDownSelection: 'Bar',
            chartOptions : {
                'Bar':'Bar', 
                'All':'All', 
                'Yes': GlobalVariables.VOTE_TYPES.YES, 
                'Abstain': GlobalVariables.VOTE_TYPES.ABSTAIN, 
                'No': GlobalVariables.VOTE_TYPES.NO, 
                'No With Veto': GlobalVariables.VOTE_TYPES.NO_WITH_VETO
            }
        }

        if (Meteor.isServer){
            this.state.proposal = this.props.proposal;
        }
    }

    static getDerivedStateFromProps(props, state) {
        if (state.user !== localStorage.getItem(CURRENTUSERADDR)) {
            return {user: localStorage.getItem(CURRENTUSERADDR)};
        }
        return null;
    }

    proposalStarted(){
        return moment().diff(moment(this.props.proposal.voting_start_time)) > 0;
    }

    proposalEnded(){
        return moment().diff(moment(this.props.proposal.voting_end_time)) > 0
    }

    componentDidUpdate(prevProps){
        if (this.props.proposal != prevProps.proposal){
            this.setState({
                proposal: this.props.proposal,
                deposit: <div>{this.props.proposal.total_deposit ? this.props.proposal.total_deposit.map((deposit, i) => {
                    return <div key={i}>{new Coin(deposit.amount, deposit.denom).toString()}</div>
                }):''} </div>
            });

            let totalVotingPower = (new BigNumber(this.props.chain.activeVotingPower))
            if (this.props.proposal.voting_start_time != '0001-01-01T00:00:00Z'){
                if (this.proposalStarted()){
                    if (!this.proposalEnded()){
                        // not reach end voting time yet
                        let totalVotes = new BigNumber(0);
                        let votesYes = new BigNumber(0);
                        let votesAbstain = new BigNumber(0);
                        let votesNo = new BigNumber(0);
                        let votesNoWithVeto = new BigNumber(0);

                        for (let vote of this.props.proposal.votes){
                            totalVotes = totalVotes.plus(vote.votingPower);
                            
                            switch(vote.option){
                            case GlobalVariables.VOTE_TYPES.YES:
                                votesYes = votesYes.plus(vote.votingPower);
                                break;
                            case GlobalVariables.VOTE_TYPES.ABSTAIN:
                                votesAbstain = votesAbstain.plus(vote.votingPower);
                                break;
                            case GlobalVariables.VOTE_TYPES.NO:
                                votesNo = votesNo.plus(vote.votingPower);
                                break;
                            case GlobalVariables.VOTE_TYPES.NO_WITH_VETO:
                                votesNoWithVeto = votesNoWithVeto.plus(vote.votingPower);
                                break;
                            default:
                                break;
                            }
                        }

                        this.setState({
                            tally: this.props.proposal.tally,
                            tallyDate: <TimeStamp time={this.props.proposal.updatedAt}/>,
                            voteStarted: true,
                            voteEnded: false,
                            totalVotes: totalVotes,
                            yesPower: votesYes,
                            abstainPower: votesAbstain,
                            noPower: votesNo,
                            noWithVetoPower: votesNoWithVeto,
                            yesPercent: (totalVotes.comparedTo(0) == 1) ? votesYes.dividedBy(totalVotes).multipliedBy(100) : new BigNumber(0),
                            abstainPercent: (totalVotes.comparedTo(0) == 1) ? votesAbstain.dividedBy(totalVotes).multipliedBy(100) : new BigNumber(0),
                            noPercent: (totalVotes.comparedTo(0) == 1) ? votesNo.dividedBy(totalVotes).multipliedBy(100) : new BigNumber(0),
                            noWithVetoPercent: (totalVotes.comparedTo(0) == 1) ? votesNoWithVeto.dividedBy(totalVotes).multipliedBy(100) : new BigNumber(0),
                            proposalValid: totalVotes.dividedBy(totalVotingPower.multipliedBy(Meteor.settings.public.powerReduction)).comparedTo(this.props.chain.gov.tallyParams.quorum) == 1 ? true : false
                        })
                    }
                    else{
                        let finalTallyResult = this.props.proposal.final_tally_result;
                        let totalVotes = new BigNumber(0);
                        
                        for (let i in finalTallyResult){
                            totalVotes = totalVotes.plus(finalTallyResult[i]);
                        }

                        this.setState({
                            tally: this.props.proposal.final_tally_result,
                            tallyDate: <T>proposals.final</T>,
                            voteStarted: true,
                            voteEnded: true,
                            totalVotes: totalVotes,
                            yesPower: finalTallyResult.yes,
                            abstainPower: finalTallyResult.abstain,
                            noPower: finalTallyResult.no,
                            noWithVetoPower: finalTallyResult.no_with_veto,
                            yesPercent: (totalVotes.comparedTo(0) == 1) ? finalTallyResult.yes.dividedBy(totalVotes).multipliedBy(100) : new BigNumber(0),
                            abstainPercent: (totalVotes.comparedTo(0) == 1) ? finalTallyResult.abstain.dividedBy(totalVotes).multipliedBy(100) : new BigNumber(0),
                            noPercent: (totalVotes.comparedTo(0) == 1) ? finalTallyResult.no.dividedBy(totalVotes).multipliedBy(100) : new BigNumber(0),
                            noWithVetoPercent: (totalVotes.comparedTo(0) == 1) ? finalTallyResult.no_with_veto.dividedBy(totalVotes).multipliedBy(100) : new BigNumber(0),
                            proposalValid: totalVotes.dividedBy(totalVotingPower.multipliedBy(Meteor.settings.public.powerReduction)).comparedTo(this.props.chain.gov.tallyParams.quorum) == 1 ? true : false
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

    populateChartData() {
        const proposal = this.props.proposal;

        const optionOrder = {
            [GlobalVariables.VOTE_TYPES.YES]: 0, 
            [GlobalVariables.VOTE_TYPES.ABSTAIN]: 1, 
            [GlobalVariables.VOTE_TYPES.NO]: 2, 
            [GlobalVariables.VOTE_TYPES.NO_WITH_VETO]: 3
        };

        let emptyMaxVotingPower = {'N/A': new BigNumber(0)};
        let emptyTotalVotingPower = {'N/A': new BigNumber(1)};
        let emptyData = [{'votingPower': new BigNumber(0), option: 'N/A'}];
        let datasets = [];
        let isDataEmtpy = null;

        const votes = proposal.votes;
        if(!this.state.voteEnded){

            let maxVotingPower = emptyMaxVotingPower;
            let totalVotingPower = emptyTotalVotingPower;
            let votesByOptions = {
                'All': votes, 
                [GlobalVariables.VOTE_TYPES.YES]: [], 
                [GlobalVariables.VOTE_TYPES.ABSTAIN]: [], 
                [GlobalVariables.VOTE_TYPES.NO]: [], 
                [GlobalVariables.VOTE_TYPES.NO_WITH_VETO]: []
            };

            votes.sort((v1, v2) => v2['votingPower'] - v1['votingPower'])
                .sort((v1, v2) => optionOrder[v1.option] - optionOrder[v2.option])
                .forEach((vote) => votesByOptions[vote.option].push(vote));

            for (let option in votesByOptions) {
                let data = votesByOptions[option];

                if (data){
                    maxVotingPower[option] = BigNumber.max(null, data.map((vote) => vote.votingPower));
                    totalVotingPower[option] = data.reduce((s, x) => x.votingPower.plus(s), 0);
                    datasets.push({
                        datasetId: option,
                        data: data.length == 0 ? emptyData : data,
                        totalVotingPower: totalVotingPower,
                        maxVotingPower: maxVotingPower
                    })    
                }
            };   

            isDataEmtpy = votesByOptions[this.state.breakDownSelection] && votesByOptions[this.state.breakDownSelection].length == 0;
        } else {
            const finalTallyResult = proposal.final_tally_result;

            let totalVotingPower = finalTallyResult.yes.plus(finalTallyResult.abstain).plus(finalTallyResult.no).plus(finalTallyResult.no_with_veto).dividedBy(Meteor.settings.public.powerReduction);
            totalVotingPower = totalVotingPower.comparedTo(0) == 1 ? totalVotingPower : emptyTotalVotingPower;

            datasets.push({
                datasetId: 'All',
                data: totalVotingPower.comparedTo(0) == 1 ? [{'votingPower': totalVotingPower, option: 'All'}] : emptyData,
                totalVotingPower,
                maxVotingPower:totalVotingPower.comparedTo(0) == 1 ? BigNumber.max(finalTallyResult.yes, finalTallyResult.no, finalTallyResult.abstain, finalTallyResult.no_with_veto).dividedBy(Meteor.settings.public.powerReduction) : emptyMaxVotingPower,
            })

            datasets.push({
                datasetId: GlobalVariables.VOTE_TYPES.YES,
                data: finalTallyResult.yes.comparedTo(0) == 1 ? [{'votingPower': finalTallyResult.yes.dividedBy(Meteor.settings.public.powerReduction), option: GlobalVariables.VOTE_TYPES.YES}] : [{'votingPower': new BigNumber(0), option: GlobalVariables.VOTE_TYPES.YES}],
                totalVotingPower,
                maxVotingPower: finalTallyResult.yes.comparedTo(0) == 1 ? finalTallyResult.abstain.dividedBy(Meteor.settings.public.powerReduction) : emptyMaxVotingPower,
            })

            datasets.push({
                datasetId: GlobalVariables.VOTE_TYPES.ABSTAIN,
                data: finalTallyResult.abstain.comparedTo(0) == 1 ? [{'votingPower': finalTallyResult.abstain.dividedBy(Meteor.settings.public.powerReduction), option: GlobalVariables.VOTE_TYPES.ABSTAIN}] : [{'votingPower': new BigNumber(0), option: GlobalVariables.VOTE_TYPES.ABSTAIN}],
                totalVotingPower,
                maxVotingPower: finalTallyResult.abstain.comparedTo(0) == 1 ? finalTallyResult.abstain.dividedBy(Meteor.settings.public.powerReduction) : emptyMaxVotingPower,
            })

            datasets.push({
                datasetId: GlobalVariables.VOTE_TYPES.NO,
                data: finalTallyResult.no.comparedTo(0) == 1 ? [{'votingPower': finalTallyResult.no.dividedBy(Meteor.settings.public.powerReduction), option: GlobalVariables.VOTE_TYPES.NO}] : [{'votingPower': new BigNumber(0), option: GlobalVariables.VOTE_TYPES.NO}],
                totalVotingPower,
                maxVotingPower: finalTallyResult.abstain.comparedTo(0) == 1 ? finalTallyResult.no.dividedBy(Meteor.settings.public.powerReduction) : emptyMaxVotingPower,
            })

            datasets.push({
                datasetId: GlobalVariables.VOTE_TYPES.NO_WITH_VETO,
                data: finalTallyResult.no_with_veto.comparedTo(0) == 1 ? [{'votingPower': finalTallyResult.no_with_veto.dividedBy(Meteor.settings.public.powerReduction), option: GlobalVariables.VOTE_TYPES.NO_WITH_VETO}] : [{'votingPower': new BigNumber(0), option: GlobalVariables.VOTE_TYPES.NO_WITH_VETO}],
                totalVotingPower,
                maxVotingPower: finalTallyResult.abstain.comparedTo(0) == 1 ? finalTallyResult.no_with_veto.dividedBy(Meteor.settings.public.powerReduction) : emptyMaxVotingPower,
            })
        }

        let layout = [['piePlot']];
        let scales = [{
            scaleId: 'colorScale',
            type: 'Color',
            domain: [GlobalVariables.VOTE_TYPES.YES, GlobalVariables.VOTE_TYPES.ABSTAIN, GlobalVariables.VOTE_TYPES.NO, GlobalVariables.VOTE_TYPES.NO_WITH_VETO, 'N/A'],
            range: ['#4CAF50', '#ff9800', '#e51c23', '#9C27B0', '#BDBDBD']
        }];
        
        let tooltip = (component, point, data, ds) => {
            if(!this.state.voteEnded){
                let total = ds.metadata().totalVotingPower['All'];
                let optionTotal = ds.metadata().totalVotingPower[data.option];
                let percentage = numbro(data.votingPower.dividedBy(total)).format('0.00%');
                let optionPercentage = numbro(data.votingPower.dividedBy(optionTotal)).format('0.00%');
                return `<p>Voting Power: ${numbro(data.votingPower.dividedBy(Meteor.settings.public.powerReduction)).format('0,0.0')}</p>
                        <p>${percentage} out of all votes</p>
                        <p>${optionPercentage} out of all ${data.option} votes</p>`;
            } else {
                let total = ds.metadata().totalVotingPower;
                let percentage = numbro(data.votingPower.dividedBy(total)).format('0.00%');
                return `<p>Voting Power: ${numbro(data.votingPower.toString()).format('0,0.0')}</p>
                        <p>${percentage} out of all votes</p>`;
            }
        }

        let components = {
            plots: [{
                plotId: 'piePlot',
                type: 'Pie',
                sectorValue: {
                    value: (d, i, ds) => {return d.votingPower.comparedTo(0) == 1 ? d.votingPower.toNumber() : 1}
                },
                labelsEnabled: isDataEmtpy,
                labelFormatter: isDataEmtpy ? ((value) => 'N/A') : null,
                attrs: [{
                    attr: 'fill',
                    value: (d) => {return d.votingPower.comparedTo(0) == 1 ? d.option : 'N/A'},
                    scale: 'colorScale'
                }, {
                    attr: 'fill-opacity',
                    value: (d, i, ds) => BigNumber.max(0.1, new BigNumber(d.votingPower).dividedBy(ds.metadata().maxVotingPower[d.option]))
                }, {
                    attr: 'stroke',
                    value: 'white'
                }, {
                    attr: 'stroke-width',
                    value: '0.5'
                }],
                datasets: [this.state.breakDownSelection],
                tooltip: isDataEmtpy ? null : tooltip
            }]
        };
        let config = {
            height:'300px',
            width: '300px',
            margin: 'auto'
        }

        return {layout, datasets, scales, components, config};
    }

    renderPieChart() {
        if (this.state.breakDownSelection == 'Bar') {
            return;
        };
        return <PChart {...this.populateChartData()}/>
    }

    renderTallyResultDetail(openState, option) {
        let votes = this.props.proposal.votes ? this.props.proposal.votes.filter((vote) => vote.option == option) : [];
        let orderDir = this.state.orderDir;
        votes = votes.sort((vote1, vote2) => ((new BigNumber(vote1['votingPower'])).minus(vote2['votingPower'])).multipliedBy(orderDir));

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
                            {(vote.votingPower !== undefined) ? numbro((new BigNumber(vote.votingPower)).dividedBy(Meteor.settings.public.powerReduction)).format('0,0.000000') : ""}
                        </Col>
                        <Col className="voting-power-percent data" md={3}>
                            <i className="material-icons d-md-none">equalizer</i>
                            {(vote.votingPower !== undefined) ? numbro((new BigNumber(vote.votingPower)).dividedBy(this.state.totalVotes)).format('0,0.00%') : ""}
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
                const proposalId = Number(this.props.proposal.proposalId), maxProposalId = Number(this.props.proposalCount);
                let totalVotingPower = this.props.chain.activeVotingPower.multipliedBy(Meteor.settings.public.powerReduction);
                let proposalType = this.props.proposal.content["@type"].split('.');
                proposalType = proposalType[proposalType.length-1].match(/[A-Z]+[^A-Z]*|[^A-Z]+/g).join(" ");

                return <div>
                    <Helmet>
                        <title>{this.props.proposal.content.title} | CUDOS</title>
                        <meta name="description" content={this.props.proposal.content.description} />
                    </Helmet>

                    <div className="proposal bg-light">
                        <Row className="mb-2 border-top">
                            <Col md={3} className="label"><T>proposals.proposalId</T></Col>
                            <Col md={this.state.user?6:9} className="value">{this.props.proposal.proposalId}</Col>
                            {this.state.user?<Col md={3}><ProposalActionButtons voteStarted={this.state.voteStarted} history={this.props.history} proposalId={proposalId}/></Col>:null} 
                        </Row>
                        <Row className="mb-2 border-top">
                            <Col md={3} className="label"><T>proposals.proposer</T></Col>
                            <Col md={9} className="value"><Account address={this.props.proposal.deposits[0].depositor} /></Col>
                        </Row>
                        <Row className="mb-2 border-top">
                            <Col md={3} className="label"><T>proposals.title</T></Col>
                            <Col md={9} className="value">{this.props.proposal.content.title}</Col>
                        </Row>
                        <Row className="mb-2 border-top">
                            <Col md={3} className="label"><T>proposals.description</T></Col>
                            <Col md={9} className="value"><Markdown markup={this.props.proposal.content.description} /></Col>
                        </Row>
                        {/* Community Pool Spend Proposal */}
                        {(this.props.proposal.content.type === 'cosmos-sdk/CommunityPoolSpendProposal')?<Row className="mb-2 border-top">
                            <Col md={3} className="label"><T>proposals.recipient</T></Col>
                            <Col md={9} className="value"> <Account address={this.props.proposal.content.recipient}/></Col> 
                        </Row>:null}
                        {(this.props.proposal.content.type === 'cosmos-sdk/CommunityPoolSpendProposal')?<Row className="mb-2 border-top">
                            <Col md={3} className="label"><T>proposals.amount</T></Col>
                            <Col md={9} className="value"> {this.props.proposal.content.amount.map((amount, j) => {
                                return <div key={j}>{new Coin(amount.amount, amount.denom).toString()}</div>
                            })}</Col> 
                        </Row>:null}
                        <Row className="mb-2 border-top">
                            <Col md={3} className="label"><T>proposals.proposalType</T></Col>
                            <Col md={9} className="value">{proposalType}</Col>
                        </Row>
                        <Row className="mb-2 border-top">
                            <Col md={3} className="label"><T>proposals.proposalStatus</T></Col>
                            <Col md={9} className="value"><ProposalStatusIcon status={this.props.proposal.status} /> {(this.props.proposal.status)?voca.chain(this.props.proposal.status.substr(16)).replace('_', ' ').titleCase().value():''}</Col>
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
                                                    return <div key={j}>{new Coin(amount.amount, amount.denom).toString()}</div>
                                                })}
                                            </li>
                                        }):''}
                                    </ol>
                                </Result>
                            </Col>
                        </Row>
                        {/* Parameter Change Proposal */}
                        {(this.props.proposal.content["@type"] === '/cosmos.params.v1beta1.ParameterChangeProposal')?<Row className="mb-2 border-top">
                            <Col md={3} className="label"><T>proposals.changes</T></Col>
                            <Col md={6} className="value-table text-center">
                                <Table bordered responsive="sm">
                                    <thead>
                                        <tr bgcolor="#ededed">
                                            <th><T>proposals.subspace</T></th>
                                            <th><T>proposals.key</T></th>
                                            <th><T>proposals.value</T></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>{this.props.proposal.content.changes ? this.props.proposal.content.changes.map((changesItem, i) => {
                                                return <div key={i}>{changesItem.subspace.charAt(0).toUpperCase() + changesItem.subspace.slice(1)} </div> }): ''}</td>
                                            <td>{this.props.proposal.content.changes ? this.props.proposal.content.changes.map((changesItem, i) => {
                                                return <div key={i}>{changesItem.key.match(/[A-Z]+[^A-Z]*|[^A-Z]+/g).join(" ")}</div> }): ''}</td>
                                            <td> {this.props.proposal.content.changes ? this.props.proposal.content.changes.map((changesItem, i) => {
                                                return   parseFloat(changesItem.value.replace(/"/g, "")) ?  <div key={i}>{numbro(changesItem.value.replace(/"/g, "")).format("0,000")}</div> : <div key={i}>{changesItem.value.replace(/"|}|{/g, "")}</div>}): ''}</td>
                                        </tr>
                                    </tbody>
                                </Table>
                            </Col>
                        </Row>:null}
                        <Row className="mb-2 border-top tally-result">
                            <Col md={3} className="label"><T>proposals.tallyResult</T> <em>({this.state.tallyDate})</em></Col>
                            <Col md={9} className="value">
                                <Row>
                                    <Col xs={6} sm={5} md={4}><VoteIcon vote="yes" /> Yes</Col>
                                    <Col xs={5} sm={6} md={7} className="tally-result-value">{numbro(this.state.yesPower.dividedBy(Meteor.settings.public.powerReduction)).format("0,0.000000")}</Col>
                                    <Col xs={1} onClick={(e) => this.handleClick(1,e)}><i className="material-icons">{this.state.open === 1 ? 'arrow_drop_down' : 'arrow_left'}</i></Col>
                                    <Col xs={12}>
                                        {this.renderTallyResultDetail(1, GlobalVariables.VOTE_TYPES.YES)}
                                    </Col>
                                </Row>
                                <Row>
                                    <Col xs={6} sm={5} md={4}><VoteIcon vote="abstain" /> Abstain</Col>
                                    <Col xs={5} sm={6} md={7} className="tally-result-value">{numbro(this.state.abstainPower.dividedBy(Meteor.settings.public.powerReduction)).format("0,0.000000")}</Col>
                                    <Col xs={1} onClick={(e) => this.handleClick(2,e)}><i className="material-icons">{this.state.open === 2 ? 'arrow_drop_down' : 'arrow_left'}</i></Col>
                                    <Col xs={12}>
                                        {this.renderTallyResultDetail(2, GlobalVariables.VOTE_TYPES.ABSTAIN)}
                                    </Col>
                                </Row>
                                <Row>
                                    <Col xs={6} sm={5} md={4}><VoteIcon vote="no" /> No</Col>
                                    <Col xs={5} sm={6} md={7} className="tally-result-value">{numbro(this.state.noPower.dividedBy(Meteor.settings.public.powerReduction)).format("0,0.000000")}</Col>
                                    <Col xs={1} onClick={(e) => this.handleClick(3,e)}><i className="material-icons">{this.state.open === 3 ? 'arrow_drop_down' : 'arrow_left'}</i></Col>
                                    <Col xs={12}>
                                        {this.renderTallyResultDetail(3, GlobalVariables.VOTE_TYPES.NO)}
                                    </Col>
                                </Row>
                                <Row>
                                    <Col xs={6} sm={5} md={4}><VoteIcon vote="no_with_veto" /> No with Veto</Col>
                                    <Col xs={5} sm={6} md={7} className="tally-result-value">{numbro(this.state.noWithVetoPower.dividedBy(Meteor.settings.public.powerReduction)).format("0,0.000000")}</Col>
                                    <Col xs={1} onClick={(e) => this.handleClick(4,e)}><i className="material-icons">{this.state.open === 4 ? 'arrow_drop_down' : 'arrow_left'}</i></Col>
                                    <Col xs={12}>
                                        {this.renderTallyResultDetail(4, GlobalVariables.VOTE_TYPES)}
                                    </Col>
                                </Row>
                                {this.state.voteStarted?<Row>
                                    <Col xs={12}><Card>
                                        <CardHeader>
                                            <Nav tabs className='card-header-tabs'>
                                                {Object.keys(this.state.chartOptions).map(key => 
                                                    <NavItem key={key}><NavLink className='no-select' active={this.state.breakDownSelection==this.state.chartOptions[key]}
                                                        onClick={() => this.setState({breakDownSelection: this.state.chartOptions[key]})}>
                                                        {key}
                                                    </NavLink></NavItem>
                                                )}
                                            </Nav>
                                        </CardHeader>
                                        <CardBody>
                                            <TabContent activeTab={this.state.breakDownSelection == 'Bar'?'bar':'pie'}>
                                                <TabPane tabId="bar">
                                                    <Progress multi>
                                                        <Progress bar animated color="success" value={this.state.yesPercent}><T>proposals.yes</T> {numbro(this.state.yesPercent.toString(10)).format("0.00%")}%</Progress>
                                                        <Progress bar animated color="warning" value={this.state.abstainPercent}><T>proposals.abstain</T> {numbro(this.state.abstainPercent).format("0.00")}%</Progress>
                                                        <Progress bar animated color="danger" value={this.state.noPercent}><T>proposals.no</T> {numbro(this.state.noPercent).format("0.00")}%</Progress>
                                                        <Progress bar animated color="info" value={this.state.noWithVetoPercent}><T>proposals.noWithVeto</T> {numbro(this.state.noWithVetoPercent).format("0.00")}%</Progress>
                                                    </Progress>
                                                </TabPane>
                                                <TabPane tabId="pie">
                                                    {this.renderPieChart()}
                                                </TabPane>
                                            </TabContent>
                                        </CardBody>
                                    </Card></Col>
                                    <Col xs={12}>
                                        <Card body className="tally-info">
                                            <em>
                                                <T _purify={false} percent={numbro(this.state.totalVotes.dividedBy(totalVotingPower)).format("0.00%")}>proposals.percentageVoted</T><br/>
                                                {this.state.proposalValid ? 
                                                    <T _props={{className:'text-success'}} tentative={(!this.state.voteEnded)?'(tentatively) ':''} _purify={false}>proposals.validMessage</T> :
                                                    (this.state.voteEnded) ?
                                                        <T _props={{className:'text-danger'}} quorum={numbro(this.props.chain.gov.tallyParams.quorum).format("0.00%")} _purify={false}>proposals.invalidMessage</T>
                                                        : <T moreVotes={totalVotingPower.multipliedBy(this.props.chain.gov.tallyParams.quorum).minus(this.state.totalVotes).dividedBy(Meteor.settings.public.powerReduction).toString(10)} _purify={false}>proposals.moreVoteMessage</T>
                                                }
                                            </em>
                                        </Card>
                                    </Col>
                                </Row>:'Voting not started yet.'}
                            </Col>
                        </Row>
                        <Row className="mb-2 border-top">
                            <Col md={3} className="label"><T>proposals.submitTime</T></Col>
                            <Col md={9} className="value"><TimeStamp time={this.state.proposal.submit_time}/></Col>
                        </Row>
                        <Row className="mb-2 border-top">
                            <Col md={3} className="label"><T>proposals.depositEndTime</T></Col>
                            <Col md={9} className="value"><TimeStamp time={this.state.proposal.deposit_end_time}/></Col>
                        </Row>
                        <Row className="mb-2 border-top">
                            <Col md={3} className="label"><T>proposals.votingStartTime</T></Col>
                            <Col md={9} className="value">{(this.state.proposal.voting_start_time != '0001-01-01T00:00:00Z')?<TimeStamp time={this.state.proposal.voting_start_time}/>:'-'}</Col>
                        </Row>
                        <Row className="mb-2 border-top">
                            <Col md={3} className="label"><T>proposals.votingEndTime</T></Col>
                            <Col md={9} className="value">{(this.state.proposal.voting_start_time != '0001-01-01T00:00:00Z')?<TimeStamp time={this.state.proposal.voting_end_time}/>:'-'}</Col>
                        </Row>
                    </div>
                    <Row className='clearfix'>
                        <Link to={`/proposals/${proposalId-1}`} className={`btn btn-outline-danger float-left ${proposalId-1<=0?"disabled":""}`}><i className="fas fa-caret-left"></i> Prev Proposal </Link>
                        <Link to="/proposals" className="btn btn-primary" style={{margin: 'auto'}}><i className="fas fa-caret-up"></i> <T>common.backToList</T></Link>
                        <Link to={`/proposals/${proposalId+1}`} className={`btn btn-outline-danger float-right ${proposalId>=maxProposalId?"disabled":""}`}><i className="fas fa-caret-right"></i> Next Proposal</Link>
                    </Row>
                </div>
            }
            else{
                return <div><T>proposals.notFound</T></div>
            }
        }
    }
}
