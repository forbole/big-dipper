import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import numeral from 'numeral';
import Block from '../components/Block.jsx';
import Avatar from '../components/Avatar.jsx';
import PowerHistory from '../components/PowerHistory.jsx';
import moment from 'moment';
import { Badge, Container, Row, Col, Card, CardImg, CardText, CardBody, CardTitle, CardSubtitle } from 'reactstrap';
import KeybaseCheck from '../components/KeybaseCheck.jsx';

const JailStatus = (props) =>{
    return <Badge color={props.jailed?'danger':'success'}>{props.jailed?'Jailed':'Active'}</Badge>
}
export default class Validator extends Component{
    constructor(props){
        super(props);
        this.state = {
            identity: "",
            records: "",
            history: ""
        }
    }

    componentDidUpdate(prevState){
        if (this.props.validator != prevState.validator){
            // if (this.props.validator.description.identity != prevState.validator.description.identity){
            if ((this.props.validator.description) && (this.props.validator.description != prevState.validator.description)){
                // console.log(prevState.validator.description);
                if (this.state.identity != this.props.validator.description.identity){
                    this.setState({identity:this.props.validator.description.identity});
                    // fetch("https://keybase.io/_/api/1.0/user/lookup.json?key_suffix="+this.props.validator.description.identity+"&fields=basics")
                    // .then(response => response.json())
                    // .then(data => {
                    //     if (data.them.length > 0){
                    //         this.setState({keybaseURL:"https://keybase.io/"+data.them[0].basics.username});
                    //     }
                    // });
                }
            }

            if (this.props.validatorExist){
                if (this.props.validator.history().length > 0){
                    this.setState({
                        history: this.props.validator.history().map((history, i) => {
                            return <PowerHistory key={i} type={history.type} prevVotingPower={history.prev_voting_power} votingPower={history.voting_power} time={history.block_time} />
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
            return <div>Loading</div>
        }
        else{
            if (this.props.validatorExist){
                return <Row className="validator-details">
                    <Col xs={12}>
                        <Link to="/validators" className="btn btn-link"><i className="fas fa-caret-left"></i> Back to List</Link>
                    </Col>
                    <Col md={4}>
                        <Card body className="text-center">
                            <div className="validator-avatar"><Avatar moniker={this.props.validator.description.moniker} identity={this.props.validator.description.identity} address={this.props.validator.address} list={false}/></div>
                            <div className="moniker text-primary">{this.props.validator.description.website?<a href={this.props.validator.description.website} target="_blank">{this.props.validator.description.moniker} <i className="fas fa-link"></i></a>:this.props.validator.description.moniker}</div>
                            <div className="identity"><KeybaseCheck identity={this.props.validator.description.identity} showKey /></div>
                            <div className="details">{this.props.validator.description.details}</div>
                            <div className="website"></div>
                        </Card>
                        <Card>
                            <div className="card-header">Uptime</div>
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
                                    <Col xs={12}><h3><JailStatus jailed={this.props.validator.jailed} /></h3></Col>
                                    <Col md={4} className="label">Address in Hex</Col>
                                    <Col md={8} className="value">{this.props.validator.address}</Col>
                                    <Col md={4} className="label">Operator Address</Col>
                                    <Col md={8} className="value">{this.props.validator.operator_address}</Col>
                                    <Col md={4} className="label">Commission Rate</Col>
                                    <Col md={8} className="value">{numeral(this.props.validator.commission.rate*100).format('0.00')+"%"}</Col>
                                    <Col md={4} className="label">Max Rate</Col>
                                    <Col md={8} className="value">{numeral(this.props.validator.commission.max_rate*100).format('0.00')+"%"}</Col>
                                    <Col md={4} className="label">Max Change Rate</Col>
                                    <Col md={8} className="value">{numeral(this.props.validator.commission.max_change_rate*100).format('0.00')+"%"}</Col>
                                </Row>
                            </CardBody>
                        </Card>
                        <Card>
                            <div className="card-header">Voting Power</div>
                            <CardBody className="voting-power-card">
                                <Row>
                                    <Col xs={12}><h1 className="display-4 voting-power"><Badge color="primary" >{numeral(this.props.validator.voting_power).format('0,0')}</Badge></h1><span>(~{numeral(this.props.validator.voting_power/this.props.chainStatus.totalVotingPower*100).format('0.00')}%)</span></Col>
                                    <Col md={4} className="label">Bond Height</Col>
                                    <Col md={8} className="value">{numeral(this.props.validator.bond_height).format('0,0')}</Col>
                                    <Col md={4} className="label">Proposer Priority</Col>
                                    <Col md={8} className="value">{numeral(this.props.validator.proposer_priority).format('0,0')}</Col>
                                    <Col md={4} className="label">Delegator Shares</Col>
                                    <Col md={8} className="value">{numeral(this.props.validator.delegator_shares).format('0,0.00')}</Col>
                                    <Col md={4} className="label">Tokens</Col>
                                    <Col md={8} className="value">{numeral(this.props.validator.tokens).format('0,0.00')}</Col>
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