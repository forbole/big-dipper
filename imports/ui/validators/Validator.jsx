import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import numeral from 'numeral';
import Block from '../components/Blocks.jsx';
import Avatar from '../components/Avatar.jsx';
import { Badge, Container, Row, Col, Card, CardImg, CardText, CardBody, CardTitle, CardSubtitle } from 'reactstrap';



export default class Validator extends Component{
    constructor(props){
        super(props);
        this.state = {
            identity: "",
            keybaseURL: "",
            records: ""
        }
    }

    componentDidUpdate(prevState){
        if (this.props.validator != prevState.validator){
            // if (this.props.validator.description.identity != prevState.validator.description.identity){
            if ((this.props.validator.description) && (this.props.validator.description != prevState.validator.description)){
                // console.log(prevState.validator.description);
                if (this.state.identity != this.props.validator.description.identity){
                    this.setState({identity:this.props.validator.description.identity});
                    fetch("https://keybase.io/_/api/1.0/user/lookup.json?key_suffix="+this.props.validator.description.identity+"&fields=basics")
                    .then(response => response.json())
                    .then(data => {
                        if (data.them.length > 0){
                            this.setState({keybaseURL:"https://keybase.io/"+data.them[0].basics.username});
                        }
                    });
                }
            }
        }

        // if (this.props.records != prevState.records){
        //     console.log(this.props.records);
        //     this.setState({
        //         records: this.props.records.map((record, i) => {
        //             return <Block key={i} exists={record.exists} height={record.height} />
        //         })
        //     })
        // }
    }

    render() {
        // console.log(this.props);
        if (this.props.loading){
            return <div>Loading</div>
        }
        else{
            // console.log(this.props.validator);
            // console.log(this.props.records);
            if (this.props.validatorExist){
                return <Row className="validator-details">
                    <Col md={4}>
                        <Card body className="text-center">
                            <div className="validator-avatar"><Avatar moniker={this.props.validator.description.moniker} identity={this.props.validator.description.identity} list={false}/></div>
                            <div className="moniker text-primary">{this.props.validator.description.website?<a href={this.props.validator.description.website} target="_blank">{this.props.validator.description.moniker} <i className="fas fa-link"></i></a>:this.props.validator.description.moniker}</div>
                            <div className="identity"><i className="fas fa-key"></i> <a href={this.state.keybaseURL} target="_blank">{this.state.identity}</a></div>
                            <div className="details">{this.props.validator.description.details}</div>
                            <div className="website"></div>
                        </Card>
                        <Card>
                            <div className="card-header">Commission</div>
                            <CardBody>
                                <Row>
                                    <Col md={8} className="label">Rate</Col>
                                    <Col md={4} className="value">{numeral(this.props.validator.commission.rate).format('0.00')}</Col>
                                    <Col md={8} className="label">Max Rate</Col>
                                    <Col md={4} className="value">{numeral(this.props.validator.commission.max_rate).format('0.00')}</Col>
                                    <Col md={8} className="label">Max Change Rate</Col>
                                    <Col md={4} className="value">{numeral(this.props.validator.commission.max_change_rate).format('0.00')}</Col>
    
                                </Row>
                            </CardBody>
                        </Card>
                    </Col>
                    <Col md={8}>
                        <Card>
                            <div className="card-header">Validator Info</div>
                            <CardBody>
                                <Row>
                                    <Col md={4} className="label">Address in Hex</Col>
                                    <Col md={8} className="value">{this.props.validator.address}</Col>
                                    <Col md={4} className="label">Operator Address</Col>
                                    <Col md={8} className="value">{this.props.validator.operator_address}</Col>
                                </Row>
                            </CardBody>
                        </Card>
                        <Card>
                            <div className="card-header">Voting Power</div>
                            <CardBody>
                                <Row>
                                    <Col md={4} className="label">Voting Power</Col>
                                    <Col md={8} className="value">{numeral(this.props.validator.voting_power).format('0,0')}</Col>
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
                            <div className="card-header">Uptime</div>
                            <CardBody>
                                <Row>
                                    <Col md={4} className="label">Uptime (Last {Meteor.settings.public.uptimeWindow} blocks)</Col>
                                    <Col md={8} className="value">{this.props.validator.uptime}%</Col>
                                    <Col md={12} className="label">{this.state.records}</Col>
                                </Row>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            }
            else{
                return <div>Validator doesn't exist.</div>
            }
        }
    }

}