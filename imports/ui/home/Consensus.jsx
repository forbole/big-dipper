import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Card, CardImg, CardText, CardBody,
    CardTitle, CardSubtitle, Button, Progress } from 'reactstrap';
import Avatar from '../components/Avatar.jsx';
<<<<<<< HEAD
=======
import KeybaseCheck from '../components/KeybaseCheck.jsx';
import CountDown from '../components/CountDown.jsx';
>>>>>>> count-down
import moment from 'moment';
import numeral from 'numeral';

export default class Consensus extends Component{
    constructor(props){
        super(props);
        this.state = {
            chainStopped: false,
        }
    }

    componentDidUpdate(prevProps){
        if (prevProps.consensus != this.props.consensus){
            if (this.props.consensus.latestBlockTime){
                // console.log()
                let lastSync = moment(this.props.consensus.latestBlockTime);
                let current = moment();
                let diff = current.diff(lastSync);
                if (diff > 60000){
                    this.setState({
                        chainStopped:true
                    })
                }
                else{
                    this.setState({
                        chainStopped:false
                    })
                }
            }
        }
    }

    render(){
        if (this.props.loading){
            return <div>Loading</div>
        }
        else{
            if (this.props.consensusExist){
                let proposer = this.props.consensus.proposer();
                let moniker = (proposer&&proposer.description&&proposer.description.moniker)?proposer.description.moniker:this.props.consensus.proposerAddress;
                let identity = (proposer&&proposer.description&&proposer.description.identity)?proposer.description.identity:"";
                return (
                    <div>
                        {(this.state.chainStopped)?<Card body inverse color="danger">
                                <span>The chain appears to be stopped for <em>{moment(this.props.consensus.latestBlockTime).fromNow(true)}</em>! Feed me with new blocks 😭!</span>             
                        </Card>:''}
                        <Card className="status consensus-state">
                            <div className="card-header">Consensus State</div>
                            <CardBody>
                            <Row>
                                <Col md={8} lg={6}>
                                    <Row>
                                        <Col md={2}>
                                            <Row>
                                                <Col md={12} xs={4}><CardSubtitle>Height</CardSubtitle></Col>
                                                <Col md={12} xs={8}><span className="value">{numeral(this.props.consensus.votingHeight).format('0,0')}</span></Col>
                                            </Row>
                                        </Col>
                                        <Col md={2}>
                                            <Row>
                                                <Col md={12} xs={4}><CardSubtitle>Round</CardSubtitle></Col>
                                                <Col md={12} xs={8}><span className="value">{this.props.consensus.votingRound}</span></Col>
                                            </Row>
                                        </Col>
                                        <Col md={2}>
                                            <Row>
                                                <Col md={12} xs={4}><CardSubtitle>Step</CardSubtitle></Col>
                                                <Col md={12} xs={8}><span className="value">{this.props.consensus.votingStep}</span></Col>
                                            </Row>
                                        </Col>
                                        <Col md={6}>
                                            <Row>
                                                <Col md={12} xs={4}><CardSubtitle>Proposer</CardSubtitle></Col>
                                                <Col md={12} xs={8}><span className="value"><Link to={"/validators/"+this.props.consensus.proposerAddress} ><Avatar moniker={moniker} identity={identity} address={this.props.consensus.proposerAddress} list={true} />{moniker}</Link></span></Col>
                                            </Row>
                                        </Col>
                                    </Row>                            
                                </Col>
                                <Col md={4} lg={6}><CardSubtitle>Voting Power</CardSubtitle><Progress animated value={this.props.consensus.votedPower} className="value">{this.props.consensus.votedPower}%</Progress></Col>
                            </Row>
                            </CardBody>
                        </Card>
                    </div>);
            }
            else{
                let genesisTime = moment(Meteor.settings.public.genesisTime);
                let current = moment();
                let diff = genesisTime.diff(current);
        
                return <div className="text-center"><Card body inverse color="danger">
                    <span>The chain is going to start in</span>             
                </Card>
                <CountDown genesisTime={diff/1000}/>
                </div>
            }   
        }
    }
}