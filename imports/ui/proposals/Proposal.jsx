import React, { Component } from 'react';
import moment from 'moment';
import { Table, Row, Col } from 'reactstrap';
import { Link } from 'react-router-dom';
import { DenomSymbol, ProposalStatusIcon, VoteIcon } from '../components/Icons';
import numeral from 'numeral';

export default class Proposal extends Component{
    constructor(props){
        super(props);
        this.state = {
            proposal: '',
            deposit: ''
        }
    }

    componentDidUpdate(prevProps){
        if (this.props.proposal != prevProps.proposal){
            console.log(this.props.proposal.value);
            this.setState({
                proposal: this.props.proposal.value,
                deposit: <div>{this.props.proposal.value.total_deposit?numeral(this.props.proposal.value.total_deposit[0].amount).format(0,0):''} <DenomSymbol denom={this.props.proposal.value.total_deposit?this.props.proposal.value.total_deposit[0].denom:'STAKE'} /></div>
            })
        }
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
                        <Col md={3} className="label">Title</Col>
                        <Col md={9} className="value">{this.state.proposal.title}</Col>
                    </Row>
                    <Row className="mb-2 border-top border-secondary">
                        <Col md={3} className="label">Description</Col>
                        <Col md={9} className="value">{this.state.proposal.description}</Col>
                    </Row>
                    <Row className="mb-2 border-top border-secondary">
                        <Col md={3} className="label">Proposal Type</Col>
                        <Col md={9} className="value">{this.state.proposal.proposal_type}</Col>
                    </Row>
                    <Row className="mb-2 border-top border-secondary">
                        <Col md={3} className="label">Proposal Status</Col>
                        <Col md={9} className="value"><ProposalStatusIcon status={this.state.proposal.proposal_status} /> {this.state.proposal.proposal_status}</Col>
                    </Row>
                    <Row className="mb-2 border-top border-secondary tally-result">
                        <Col md={3} className="label">Tally Result</Col>
                        <Col md={9} className="value">
                            <Row><Col xs={6} sm={5} md={3}><VoteIcon vote="yes" /> Yes</Col><Col xs={6} sm={7} md={8}>{(this.state.proposal.tally_result)?eval(this.state.proposal.tally_result.yes).toFixed(2):''}</Col></Row>
                            <Row><Col xs={6} sm={5} md={3}><VoteIcon vote="abstain" /> Abstain</Col><Col xs={6} sm={7} md={8}>{(this.state.proposal.tally_result)?eval(this.state.proposal.tally_result.abstain).toFixed(2):''}</Col></Row>
                            <Row><Col xs={6} sm={5} md={3}><VoteIcon vote="no" /> No</Col><Col xs={6} sm={7} md={8}>{(this.state.proposal.tally_result)?eval(this.state.proposal.tally_result.no).toFixed(2):''}</Col></Row>
                            <Row><Col xs={6} sm={5} md={3}><VoteIcon vote="no_with_veto" /> No with Veto</Col><Col xs={6} sm={7} md={8}>{(this.state.proposal.tally_result)?eval(this.state.proposal.tally_result.no_with_veto).toFixed(2):''}</Col></Row>
                        </Col>
                    </Row>
                    <Row className="mb-2 border-top border-secondary">
                        <Col md={3} className="label">Submit Time</Col>
                        <Col md={9} className="value">{moment.utc(this.state.proposal.submit_time).format("D MMM YYYY, h:mm:ssa z")}</Col>
                    </Row>
                    <Row className="mb-2 border-top border-secondary">
                        <Col md={3} className="label">Deposit</Col>
                        <Col md={9} className="value">{this.state.deposit}</Col>
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