import React, { Component } from 'react';
import { Table, Row, Col } from 'reactstrap';
import { Link } from 'react-router-dom';

export default class Proposal extends Component{
    constructor(props){
        super(props);
        this.state = {
            proposal: ''
        }
    }

    componentDidUpdate(prevProps){
        if (this.props.proposal != prevProps.proposal){
            console.log(this.props.proposal.value);
            this.setState({
                proposal: this.props.proposal.value
            })
        }
    }

    render(){
        if (this.props.loading){
            return <div>Loading</div>
        }
        else{
            return <div>
                <div className="proposal">
                    <Row className="header">
                        <Col md={3} className="label">Proposal ID</Col>
                        <Col md={9}>{this.state.proposal.proposal_id}</Col>
                    </Row>
                    <Row>
                        <Col md={3} className="label">Title</Col>
                        <Col md={9}>{this.state.proposal.title}</Col>
                    </Row>
                    <Row>
                        <Col md={3} className="label">Description</Col>
                        <Col md={9}>{this.state.proposal.description}</Col>
                    </Row>
                    <Row>
                        <Col md={3} className="label">Proposal Type</Col>
                        <Col md={9}>{this.state.proposal.proposal_type}</Col>
                    </Row>
                    <Row>
                        <Col md={3} className="label">Proposal Status</Col>
                        <Col md={9}>{this.state.proposal.proposal_status}</Col>
                    </Row>
                    <Row>
                        <Col md={3} className="label">Tally Result</Col>
                        <Col md={9}>
                            <Row><Col xs={3}>Yes</Col><Col xs={9}>{(this.state.proposal.tally_result)?eval(this.state.proposal.tally_result.yes).toFixed(2):''}</Col></Row>
                            <Row><Col xs={3}>Abstain</Col><Col xs={9}>{(this.state.proposal.tally_result)?eval(this.state.proposal.tally_result.abstain).toFixed(2):''}</Col></Row>
                            <Row><Col xs={3}>No</Col><Col xs={9}>{(this.state.proposal.tally_result)?eval(this.state.proposal.tally_result.no).toFixed(2):''}</Col></Row>
                            <Row><Col xs={3}>No with Veto</Col><Col xs={9}>{(this.state.proposal.tally_result)?eval(this.state.proposal.tally_result.no_with_veto).toFixed(2):''}</Col></Row>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={3} className="label">Submit Block</Col>
                        <Col md={9}>{this.state.proposal.submit_block}</Col>
                    </Row>
                    <Row>
                        <Col md={3} className="label">Start Voting Block</Col>
                        <Col md={9}>{this.state.proposal.voting_start_block}</Col>
                    </Row>
                </div>
                <Link to="/proposals" className="btn btn-primary"><i className="fas fa-caret-left"></i> Back to list</Link>
            </div>
        }
    }
}