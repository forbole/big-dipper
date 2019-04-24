import React, { Component } from 'react';
import { Badge, Progress, Row, Col, Card, CardBody, Spinner } from 'reactstrap';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { Meteor } from 'meteor/meteor';
import numeral from 'numeral';
import {numeralRounding} from '../utils.jsx';
import Avatar from '../components/Avatar.jsx';

const ValidatorRow = (props) => {
    let moniker = (props.validator.description&&props.validator.description.moniker)?props.validator.description.moniker:props.validator.address;
    let identity = (props.validator.description&&props.validator.description.identity)?props.validator.description.identity:'';
    return <Card body>
        <Row className="validator-info">
            <Col className="d-none d-md-block counter data" xs={2} md={1}>{props.index+1}</Col>
            <Col xs={12} md={2} className="data"><Link to={"/validator/"+props.validator.address}><Avatar moniker={moniker} identity={identity} address={props.validator.address} list={true} /><span className="moniker">{moniker}</span></Link></Col>
            <Col className="voting-power data" xs={{size:8, offset:2}} md={{size:3, offset:0}} lg={2}><i className="material-icons d-md-none">power</i>  <span>{numeral(props.validator.voting_power).format('0,0')} ({numeral(props.validator.voting_power/props.totalPower).format('0.00%', numeralRounding)})</span></Col>
            <Col className="status data" xs={2} md={1}>{props.validator.jailed?<Badge color="danger"><span>J<span className="d-none d-md-inline">ailed</span></span></Badge>:<Badge color="success"><span>A<span className="d-none d-md-inline">ctive</span></span></Badge>}</Col>
            <Col className="self-delegation data" xs={{size:4,offset:2}} md={{size:1,offset:0}}><i className="material-icons d-sm-none">equalizer</i> <span>{numeral(props.validator.self_delegation).format('0.00%', numeralRounding)}</span></Col>
            {(!props.jailed)?<Col className="commission data" xs={{size:4}} md={{size:1,offset:0}} lg={2}><i className="material-icons d-sm-none">call_split</i> <span>{numeral(props.validator.commission.rate).format('0.00%', numeralRounding)}</span></Col>:''}
            {(!props.jailed)?<Col className="uptime data" xs={{size:2,order:"last"}} md={2}><Progress animated value={props.validator.uptime}><span className="d-none d-md-inline">{props.validator.uptime?props.validator.uptime.toFixed(2):0}%</span><span className="d-md-none">&nbsp;</span></Progress></Col>:''}
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
                            totalPower={this.props.chainStatus.activeVotingPower}
                            jailed={this.props.jailed}
                        />
                    })
                })
            }
            else{
                this.setState({
                    validators: ""
                })
            }
        }
    }

    render(){
        if (this.props.loading){
            return <Spinner type="grow" color="primary" />
        }
        else{
            // console.log(this.props);
            return (
                this.state.validators
            )
        }
    }
}