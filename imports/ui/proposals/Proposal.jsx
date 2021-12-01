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
// import { ProposalActionButtons } from '../ledger/LedgerActions.jsx';
import voca from 'voca';

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
            totalVotes: 0,
            open: false,
            yesPercent: 0,
            abstainPercent: 0,
            noPercent: 0,
            noWithVetoPercent: 0,
            proposalValid: false,
            orderDir: -1,
            breakDownSelection: 'Bar',
            chartOptions : {
                'Bar':'Bar', 
                'All':'All', 
                'Yes':'VOTE_OPTION_YES', 
                'Abstain':'VOTE_OPTION_ABSTAIN', 
                'No': 'VOTE_OPTION_NO', 
                'No With Veto':'VOTE_OPTION_NO_WITH_VETO'
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

    componentDidUpdate(prevProps){
        if (this.props.proposal != prevProps.proposal){
            this.setState({
                proposal: this.props.proposal,
                deposit: <div>{this.props.proposal.total_deposit?this.props.proposal.total_deposit.map((deposit, i) => {
                    return <div key={i}>{new Coin(deposit.amount, deposit.denom).toString(6)}</div>
                }):''} </div>
            });

            let now = moment();
            const powerReduction = Meteor.settings.public.powerReduction || Coin.StakingCoin.fraction;
            let totalVotingPower = (this.props.activeVotingPower || this.props.chain.activeVotingPower) * powerReduction;
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
                            tallyDate: <TimeStamp time={this.props.proposal.updatedAt}/>,
                            voteStarted: true,
                            voteEnded: false,
                            totalVotes: totalVotes,
                            yesPercent: (totalVotes>0)?parseInt(this.props.proposal.tally.yes)/totalVotes*100:0,
                            abstainPercent: (totalVotes>0)?parseInt(this.props.proposal.tally.abstain)/totalVotes*100:0,
                            noPercent: (totalVotes>0)?parseInt(this.props.proposal.tally.no)/totalVotes*100:0,
                            noWithVetoPercent: (totalVotes>0)?parseInt(this.props.proposal.tally.no_with_veto)/totalVotes*100:0,
                            proposalValid: (this.state.totalVotes/totalVotingPower > parseFloat(this.props.chain.gov.tally_params.quorum))?true:false
                        })
                    }
                    else{
                        let totalVotes = 0;
                        for (let i in this.props.proposal.final_tally_result){
                            totalVotes += parseInt(this.props.proposal.final_tally_result[i]);
                        }

                        this.setState({
                            tally: this.props.proposal.final_tally_result,
                            tallyDate: <T>proposals.final</T>,
                            voteStarted: true,
                            voteEnded: true,
                            totalVotes: totalVotes,
                            yesPercent: (totalVotes>0)?parseInt(this.props.proposal.final_tally_result.yes)/totalVotes*100:0,
                            abstainPercent: (totalVotes>0)?parseInt(this.props.proposal.final_tally_result.abstain)/totalVotes*100:0,
                            noPercent: (totalVotes>0)?parseInt(this.props.proposal.final_tally_result.no)/totalVotes*100:0,
                            noWithVetoPercent: (totalVotes>0)?parseInt(this.props.proposal.final_tally_result.no_with_veto)/totalVotes*100:0,
                            proposalValid: (this.state.totalVotes/totalVotingPower > parseFloat(this.props.chain.gov.tally_params.quorum))?true:false
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
        const optionOrder = {'VOTE_OPTION_YES': 0, 'VOTE_OPTION_ABSTAIN': 1, 'VOTE_OPTION_NO': 2, 'VOTE_OPTION_NO_WITH_VETO': 3};
        let votes = this.props.proposal.votes?this.props.proposal.votes.sort(
            (vote1, vote2) => vote2['votingPower'] - vote1['votingPower']
        ).sort(
            (vote1, vote2) => optionOrder[vote1.option] - optionOrder[vote2.option]):null;
        let maxVotingPower = {'N/A': 1};
        let totalVotingPower = {'N/A': 0};
        let votesByOptions = {'All': votes, 'VOTE_OPTION_YES': [], 'VOTE_OPTION_ABSTAIN': [], 'VOTE_OPTION_NO': [], 'VOTE_OPTION_NO_WITH_VETO': []};

        let emtpyData = [{'votingPower': 1, option: 'N/A'}];

        if (votes)
            votes.forEach((vote) => votesByOptions[vote.option].push(vote));

        let datasets = [];
        for (let option in votesByOptions) {
            let data = votesByOptions[option];
            if (data){
                maxVotingPower[option] = Math.max.apply(null, data.map((vote) => vote.votingPower));
                totalVotingPower[option] = data.reduce((s, x) => x.votingPower + s, 0);
                datasets.push({
                    datasetId: option,
                    data: data.length == 0?emtpyData:data,
                    totalVotingPower: totalVotingPower,
                    maxVotingPower: maxVotingPower
                })    
            }
        };

        let layout = [['piePlot']];
        let scales = [{
            scaleId: 'colorScale',
            type: 'Color',
            domain: ['VOTE_OPTION_YES', 'VOTE_OPTION_ABSTAIN', 'VOTE_OPTION_NO', 'VOTE_OPTION_NO_WITH_VETO', 'N/A'],
            range: ['#4CAF50', '#ff9800', '#e51c23', '#9C27B0', '#BDBDBD']
        }];
        let isDataEmtpy = votesByOptions[this.state.breakDownSelection] && votesByOptions[this.state.breakDownSelection].length==0;
        let tooltip = (component, point, data, ds) => {
            let total = ds.metadata().totalVotingPower['All'];
            let optionTotal = ds.metadata().totalVotingPower[data.option];
            let percentage = numbro(data.votingPower/total).format('0.00%');
            let optionPercentage = numbro(data.votingPower/optionTotal).format('0.00%');
            return `<p>Voting Power: ${data.votingPower}</p>
                    <p>${percentage} out of all votes</p>
                    <p>${optionPercentage} out of all ${data.option} votes</p>`;
        }
        let components = {
            plots: [{
                plotId: 'piePlot',
                type: 'Pie',
                sectorValue: {
                    value: (d, i, ds) => d.votingPower
                },
                labelsEnabled: isDataEmtpy,
                labelFormatter: isDataEmtpy?((value)=>'N/A'):null,
                attrs: [{
                    attr: 'fill',
                    value: (d) => d.option,
                    scale: 'colorScale'
                }, {
                    attr: 'fill-opacity',
                    value: (d, i, ds) => Math.max(0.1, d.votingPower/ds.metadata().maxVotingPower[d.option])
                }, {
                    attr: 'stroke',
                    value: 'white'
                }, {
                    attr: 'stroke-width',
                    value: '0.5'
                }],
                datasets: [this.state.breakDownSelection],
                tooltip: isDataEmtpy?null:tooltip
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
                            {(vote.votingPower!==undefined)?numbro(vote.votingPower/Meteor.settings.public.powerReduction).format('0,0.000000'):""}
                        </Col>
                        <Col className="voting-power-percent data" md={3}>
                            <i className="material-icons d-md-none">equalizer</i>
                            {(vote.votingPower!==undefined)?numbro(vote.votingPower/this.state.totalVotes).format('0,0.000000%'):""}
                        </Col>
                    </Row></Card>
                )}
            </Card>
        </Result>
    }

    renderValidatorsWithoutVote() {
        let validatorsDidNotVoteList = this.props?.proposal?.validatorsDidNotVote?.list ?? [];
        return <Result className="tally-result-detail" pose={this.state.open ? 'open' : 'closed'}>
            <Card className='tally-result-table'>
                {validatorsDidNotVoteList.map((vote, i) =>
                    (vote?.operator_address ? 
                        <Card body key={i}><Row className='voter-info'>
                            <Col className="d-none d-md-block counter data" md={1}>{i + 1}</Col>
                            <Col className="moniker data" md={4}>
                                <Account address={vote?.operator_address} />
                            </Col>
                        </Row></Card> : null)
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
                const powerReduction = Meteor.settings.public.powerReduction || Coin.StakingCoin.fraction;
                let totalVotingPower = (this.props.activeVotingPower || this.props.chain.activeVotingPower) * powerReduction;
                let proposalType = this.props.proposal.content["@type"].split('.');
                proposalType = proposalType[proposalType.length-1].match(/[A-Z]+[^A-Z]*|[^A-Z]+/g).join(" ");

                return <div>
                    <Helmet>
                        <title>{this.props.proposal.content.title} | Big Dipper</title>
                        <meta name="description" content={this.props.proposal.content.description} />
                    </Helmet>

                    <div className="proposal bg-light">
                        <Row className="mb-2 border-top">
                            <Col md={3} className="label"><T>proposals.proposalID</T></Col>
                            <Col md={this.state.user?6:9} className="value">{this.props.proposal.proposalId}</Col>
                            {/* {this.state.user?<Col md={3}><ProposalActionButtons history={this.props.history} proposalId={proposalId}/></Col>:null} */}
                        </Row>
                        <Row className="mb-2 border-top">
                            <Col md={3} className="label"><T>proposals.proposer</T></Col>
                            <Col md={9} className="value"><Account address={this.props.proposal.proposer} /></Col>
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
                                return <div key={j}>{new Coin(amount.amount, amount.denom).toString(6)}</div>
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
                                                    return <div key={j}>{new Coin(amount.amount, amount.denom).toString(6)}</div>
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
                                    <Col xs={5} sm={6} md={7} className="tally-result-value">{this.state.tally?numbro(parseInt(this.state.tally.yes)/Meteor.settings.public.powerReduction).format("0,0.000000"):''}</Col>
                                    <Col xs={1} onClick={(e) => this.handleClick(1,e)}><i className="material-icons">{this.state.open === 1 ? 'arrow_drop_down' : 'arrow_left'}</i></Col>
                                    <Col xs={12}>
                                        {this.renderTallyResultDetail(1, 'VOTE_OPTION_YES')}
                                    </Col>
                                </Row>
                                <Row>
                                    <Col xs={6} sm={5} md={4}><VoteIcon vote="abstain" /> Abstain</Col>
                                    <Col xs={5} sm={6} md={7} className="tally-result-value">{this.state.tally?numbro(parseInt(this.state.tally.abstain)/Meteor.settings.public.powerReduction).format("0,0.000000"):''}</Col>
                                    <Col xs={1} onClick={(e) => this.handleClick(2,e)}><i className="material-icons">{this.state.open === 2 ? 'arrow_drop_down' : 'arrow_left'}</i></Col>
                                    <Col xs={12}>
                                        {this.renderTallyResultDetail(2, 'VOTE_OPTION_ABSTAIN')}
                                    </Col>
                                </Row>
                                <Row>
                                    <Col xs={6} sm={5} md={4}><VoteIcon vote="no" /> No</Col>
                                    <Col xs={5} sm={6} md={7} className="tally-result-value">{this.state.tally?numbro(parseInt(this.state.tally.no)/Meteor.settings.public.powerReduction).format("0,0.000000"):''}</Col>
                                    <Col xs={1} onClick={(e) => this.handleClick(3,e)}><i className="material-icons">{this.state.open === 3 ? 'arrow_drop_down' : 'arrow_left'}</i></Col>
                                    <Col xs={12}>
                                        {this.renderTallyResultDetail(3, 'VOTE_OPTION_NO')}
                                    </Col>
                                </Row>
                                <Row>
                                    <Col xs={6} sm={5} md={4}><VoteIcon vote="no_with_veto" /> No with Veto</Col>
                                    <Col xs={5} sm={6} md={7} className="tally-result-value">{this.state.tally?numbro(parseInt(this.state.tally.no_with_veto)/Meteor.settings.public.powerReduction).format("0,0.000000"):''}</Col>
                                    <Col xs={1} onClick={(e) => this.handleClick(4,e)}><i className="material-icons">{this.state.open === 4 ? 'arrow_drop_down' : 'arrow_left'}</i></Col>
                                    <Col xs={12}>
                                        {this.renderTallyResultDetail(4, 'VOTE_OPTION_NO_WITH_VETO')}
                                    </Col>
                                </Row>
                                <Row>
                                    <Col xs={6} sm={5} md={4}><i className="fas fa-question-circle text-danger"></i> <T>common.didNotVote</T></Col>
                                    <Col xs={5} sm={6} md={7} className="tally-result-value">{this.props?.proposal?.validatorsDidNotVote?.list.length > 0 ? <T _purify={false} number={this.props?.proposal?.validatorsDidNotVote?.list.length}>proposals.validators</T> : <T _purify={false} number={0}>proposals.validators</T> }</Col>
                                    <Col xs={1} onClick={(e) => this.handleClick(6, e)}><i className="material-icons">{this.state.open === 6 ? 'arrow_drop_down' : 'arrow_left'}</i></Col>
                                    <Col xs={12}>
                                        {this.renderValidatorsWithoutVote()}
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
                                            <TabContent activeTab={this.state.breakDownSelection=='Bar'?'bar':'pie'}>
                                                <TabPane tabId="bar">
                                                    <Progress multi>
                                                        <Progress bar animated color="success" value={this.state.yesPercent}><T>proposals.yes</T> {numbro(this.state.yesPercent).format("0.00")}%</Progress>
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
                                                <T _purify={false} percent={numbro(this.state.totalVotes/totalVotingPower).format("0.00%")}>proposals.percentageVoted</T><br/>
                                                {this.state.proposalValid?<T _props={{className:'text-success'}} tentative={(!this.state.voteEnded)?'(tentatively) ':''} _purify={false}>proposals.validMessage</T>:(this.state.voteEnded)?<T _props={{className:'text-danger'}} quorum={numbro(this.props.chain.gov.tally_params.quorum).format("0.00%")} _purify={false}>proposals.invalidMessage</T>:<T moreVotes={numbro((totalVotingPower*this.props.chain.gov.tally_params.quorum-this.state.totalVotes)/Meteor.settings.public.powerReduction).format("0,0")} _purify={false}>proposals.moreVoteMessage</T>}
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
