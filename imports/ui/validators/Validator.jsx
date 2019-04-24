import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import numeral from 'numeral';
import {numeralRounding} from '../utils.jsx';
import moment from 'moment';
import { Markdown } from 'react-showdown';
import Block from '../components/Block.jsx';
import Avatar from '../components/Avatar.jsx';
import PowerHistory from '../components/PowerHistory.jsx';
import { Badge, Container, Row, Col, Card, CardImg, CardText, CardBody, CardTitle, CardSubtitle, Spinner } from 'reactstrap';
import KeybaseCheck from '../components/KeybaseCheck.jsx';

addhttp = (url) => {
    if (!/^(f|ht)tps?:\/\//i.test(url)) {
       url = "http://" + url;
    }
    return url;
}

const StatusBadge = (props) =>{
    const statusColor = ['secondary', 'warning', 'success'];
    const statusText = ['Unbonded', 'Unbonding', 'Active'];
    return <h3>
        {props.jailed?<Badge color='danger'>Jailed</Badge>:''}
        <Badge color={statusColor[props.bondingStatus]}>{statusText[props.bondingStatus]}</Badge>
    </h3>;
}

export default class Validator extends Component{
    constructor(props){
        let showdown  = require('showdown');
        showdown.setFlavor('github');
        super(props);
        this.state = {
            identity: "",
            records: "",
            history: "",
            updateTime: ""
        }
    }

    componentDidUpdate(prevState){
        if (this.props.validator != prevState.validator){
            // if (this.props.validator.description.identity != prevState.validator.description.identity){
            if ((this.props.validator.description) && (this.props.validator.description != prevState.validator.description)){
                // console.log(prevState.validator.description);
                if (this.state.identity != this.props.validator.description.identity){
                    this.setState({identity:this.props.validator.description.identity});
                }
            }

            if (this.props.validator.commission){
                if (this.props.validator.commission.update_time == Meteor.settings.public.genesisTime){
                    this.setState({
                        updateTime: "Never changed"
                    });
                }
                else{
                    Meteor.call('Validators.findCreateValidatorTime', this.props.validator.delegator_address, (error, result) => {
                        if (error){
                            console.log(error);
                        }
                        else{
                            if (result){
                                if (result == this.props.validator.commission.update_time){
                                    this.setState({
                                        updateTime: "Never changed"
                                    });
                                }
                                else{
                                    this.setState({
                                        updateTime: "Updated "+moment(this.props.validator.commission.update_time).fromNow()
                                    });
                                }
                            }
                            else{
                                this.setState({
                                    updateTime: "Updated "+moment(this.props.validator.commission.update_time).fromNow()
                                });
                            }
                        }
                    });
                }
            }

            if (this.props.validatorExist){
                if (this.props.validator.history().length > 0){
                    this.setState({
                        history: this.props.validator.history().map((history, i) => {
                            return <PowerHistory
                                key={i}
                                type={history.type}
                                prevVotingPower={history.prev_voting_power}
                                votingPower={history.voting_power}
                                time={history.block_time}
                                height={history.height}
                                address={this.props.validator.operator_address}
                                />
                        })
                    })
                }
            }
        }

        if (this.props.records != prevState.records){
            if (this.props.records.length > 0){
                this.setState({
                    records: this.props.records.map((record, i) => {
                        return <Block key={i} exists={record.exists} height={record.height} />
                    })
                })
            }
        }
    }

    render() {
        if (this.props.loading){
            return <Spinner type="grow" color="primary" />
        }
        else{
            if (this.props.validatorExist){
                let moniker = (this.props.validator.description&&this.props.validator.description.moniker)?this.props.validator.description.moniker:this.props.validator.address;
                let identity = (this.props.validator.description&&this.props.validator.description.identity)?this.props.validator.description.identity:"";
                let website = (this.props.validator.description&&this.props.validator.description.website)?this.props.validator.description.website:undefined;
                let details = (this.props.validator.description&&this.props.validator.description.details)?this.props.validator.description.details:"";

                return <Row className="validator-details">
                    <Col xs={12}>
                        <Link to="/validators" className="btn btn-link"><i className="fas fa-caret-left"></i> Back to List</Link>
                    </Col>
                    <Col md={4}>
                        <Card body className="text-center">
                            <div className="validator-avatar"><Avatar moniker={moniker} identity={identity} address={this.props.validator.address} list={false}/></div>
                            <div className="moniker text-primary">{website?<a href={addhttp(this.props.validator.description.website)} target="_blank">{moniker} <i className="fas fa-link"></i></a>:moniker}</div>
                            <div className="identity"><KeybaseCheck identity={identity} showKey /></div>
                            <div className="details"><Markdown markup={ details } /></div>
                            <div className="website"></div>
                        </Card>
                        <Card>
                            <div className="card-header">Uptime <Link className="float-right" to={"/validator/"+this.props.validator.address+"/missed/blocks"}>More...</Link></div>
                            <CardBody>
                                <Row>
                                    <Col xs={8} className="label">Last {Meteor.settings.public.uptimeWindow} blocks</Col>
                                    <Col xs={4} className="value text-right">{this.props.validator.uptime}%</Col>
                                    <Col md={12} className="blocks-list">{this.state.records}</Col>
                                </Row>
                            </CardBody>
                        </Card>
                    </Col>
                    <Col md={8}>
                        <Card>
                            <div className="card-header">Validator Info</div>
                            <CardBody>
                                <Row>
                                    <Col xs={12}><StatusBadge bondingStatus={this.props.validator.status} jailed={this.props.validator.jailed} /></Col>
                                    <Col sm={4} className="label">Operator Address</Col>
                                    <Col sm={8} className="value address" data-operator-address={this.props.validator.operator_address}>{this.props.validator.operator_address}</Col>
                                    <Col sm={4} className="label">Self-Delegate Address</Col>
                                    <Col sm={8} className="value address" data-delegator-address={this.props.validator.delegator_address}>{this.props.validator.delegator_address}</Col>
                                    <Col sm={4} className="label">Commission Rate</Col>
                                    <Col sm={8} className="value">{this.props.validator.commission?numeral(this.props.validator.commission.rate*100).format('0.00')+"%":''} <small className="text-secondary">({this.state.updateTime})</small></Col>
                                    <Col sm={4} className="label">Max Rate</Col>
                                    <Col sm={8} className="value">{this.props.validator.commission?numeral(this.props.validator.commission.max_rate*100).format('0.00')+"%":''}</Col>
                                    <Col sm={4} className="label">Max Change Rate</Col>
                                    <Col sm={8} className="value">{this.props.validator.commission?numeral(this.props.validator.commission.max_change_rate*100).format('0.00')+"%":''}</Col>
                                </Row>
                            </CardBody>
                        </Card>
                        <Card>
                            <div className="card-header">Voting Power</div>
                            <CardBody className="voting-power-card">
                                <Row>
                                    <Col xs={12}><h1 className="display-4 voting-power"><Badge color="primary" >{numeral(this.props.validator.voting_power).format('0,0')}</Badge></h1><span>(~{numeral(this.props.validator.voting_power/this.props.chainStatus.activeVotingPower).format('0.00%', numeralRounding)})</span></Col>
                                    <Col sm={4} className="label">Bond Height</Col>
                                    <Col sm={8} className="value">{numeral(this.props.validator.bond_height).format('0,0')}</Col>
                                    <Col sm={4} className="label">Proposer Priority</Col>
                                    <Col sm={8} className="value">{numeral(this.props.validator.proposer_priority).format('0,0')}</Col>
                                    <Col sm={4} className="label">Delegator Shares</Col>
                                    <Col sm={8} className="value">{numeral(this.props.validator.delegator_shares).format('0,0.00')}</Col>
                                    <Col sm={4} className="label">Tokens</Col>
                                    <Col sm={8} className="value">{numeral(this.props.validator.tokens).format('0,0.00')}</Col>
                                    {(this.props.validator.jailed)?<Col xs={12} >
                                        <Row><Col md={4} className="label">Unbonding Height</Col>
                                        <Col md={8} className="value">{numeral(this.props.validator.unbonding_height).format('0,0')}</Col>
                                        <Col md={4} className="label">Unbonding Time</Col>
                                        <Col md={8} className="value">{moment.utc(this.props.validator.unbonding_time).format("D MMM YYYY, h:mm:ssa z")}</Col>
                                        </Row></Col>:''}
                                </Row>
                            </CardBody>
                        </Card>
                        <Card>
                            <div className="card-header">Change History (Recent {this.state.history.length} records)</div>
                        </Card>
                        <div className="power-history">
                            {this.state.history}
                        </div>
                        <Link to="/validators" className="btn btn-link"><i className="fas fa-caret-left"></i> Back to List</Link>
                    </Col>
                </Row>
            }
            else{
                return <div>Validator doesn't exist.</div>
            }
        }
    }

}