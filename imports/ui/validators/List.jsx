import React, { Component } from 'react';
import { Badge, Progress, Row, Col, Card, CardBody } from 'reactstrap';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { Meteor } from 'meteor/meteor';
import numeral from 'numeral';
import Avatar from '../components/Avatar.jsx';

const ValidatorRow = (props) => {
    let moniker = (props.validator.description&&props.validator.description.moniker)?props.validator.description.moniker:props.validator.address;
    let identity = (props.validator.description&&props.validator.description.identity)?props.validator.description.identity:'';
    return <Card body>
        <Row className="validator-info">
            <Col className="d-none d-md-block counter data" xs={2} md={1}>{props.index+1}</Col>
            <Col xs={12} md={3} className="data"><Link to={"/validator/"+props.validator.address}><Avatar moniker={moniker} identity={identity} address={props.validator.address} list={true} /><span className="moniker">{moniker}</span></Link></Col>
            <Col className="voting-power data" xs={{size:4, offset:2}} md={{size:2, offset:0}}>{numeral(props.validator.voting_power).format('0,0')}<span className="d-none d-md-inline"> ({numeral(props.validator.voting_power/props.totalPower*100).format('0.00')}%)</span></Col>
            <Col className="status data" xs={2} md={1}>{props.validator.jailed?<Badge color="danger"><span>J<span className="d-none d-md-inline">ailed</span></span></Badge>:<Badge color="success"><span>A<span className="d-none d-md-inline">ctive</span></span></Badge>}</Col>
            {(!props.jailed)?<Col className="uptime data" xs={4} md={3}><Progress animated value={props.validator.uptime}>{props.validator.uptime?props.validator.uptime.toFixed(2):0}%</Progress></Col>:''}
            {(!props.jailed)?<Col className="proposer-priority data d-none d-md-block">{numeral(props.validator.proposer_priority).format('0,0')}</Col>:''}
            {(props.jailed)?<Col className="last-seen data" xs={{size:10,offset:2}}md={{size:5, offset:0}}>{props.validator.lastSeen?moment.utc(props.validator.lastSeen).format("D MMM YYYY, h:mm:ssa"):''}</Col>:''}
        </Row>
    </Card>
}

export default class List extends Component{
    constructor(props){
        super(props);
        this.state = {
            validators: ""
        }
    }

    componentDidUpdate(prevState){
        if (this.props.validators != prevState.validators){
            if (this.props.validators.length > 0){
                this.setState({
                    validators: this.props.validators.map((validator, i) => {
                        return <ValidatorRow 
                            key={validator.address} 
                            index={i} 
                            validator={validator} 
                            address={validator.address} 
                            totalPower={this.props.chainStatus.totalVotingPower}
                            jailed={this.props.jailed}
                        />
                    })
                })    
            }
        }
    }

    render(){
        if (this.props.loading){
            return <div>Loading</div>
        }
        else{
            // console.log(this.props);
            return (
                this.state.validators
            )    
        }
    }
}