import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import { Link } from 'react-router-dom';
import { Badge, Progress, Row, Col, Card, Spinner, UncontrolledPopover, PopoverHeader, PopoverBody, CardTitle, CardText } from 'reactstrap';
import numbro from 'numbro';
import Avatar from '../components/Avatar.jsx';
import Account from './Account.jsx';
import TimeStamp from '../components/TimeStamp.jsx';



export default class AccountTooltip extends Account{
    constructor(props){
        super(props);

        this.ref = React.createRef();
    }

    shouldComponentUpdate(nextProps, nextState) {
        return (
            this.props.address !== nextProps.address ||
            this.state.address !== nextState.address ||
            this.state.moniker !== nextState.moniker)
    }

    getFields() {
        return {
            status: 1,
            description: 1,
            delegator_shares: 1,
            operator_address: 1,
            tokens: 1,
            commission: 1,
            unbonding_time: 1,
            jailed: 1,
            delegator_address: 1,
            address: 1,
            operator_pubkey: 1,
            voting_power: 1,
            lastSeen: 1,
            uptime: 1,
            self_delegation: 1,
            profile_url: 1
        }
    }

    renderDetailTooltip() {
        if (!this.state.validator)
            return
        let validator = this.state.validator;
        let moniker = validator.description && validator.description.moniker || validator.address;
        let isActive = validator.status == 2 && !validator.jailed;

        return <UncontrolledPopover className='validator-popover' trigger="hover" placement="right" target={this.ref}>
            <Card className='validator-popover-card' body outline color="danger">
        <PopoverHeader>
        <CardTitle className='d-flex justify-content-center'>
        <h4 className="moniker text-primary">{moniker}</h4>
        </CardTitle>
        </PopoverHeader>
        <PopoverBody>
        <CardText className="voting-power data">
            <i className="material-icons">power </i>
            {validator.voting_power?numbro(validator.voting_power).format('0,0'):0}
        </CardText>
        <CardText className="self-delegation data">
            <i className="material-icons">equalizer </i>
            {validator.self_delegation?numbro(validator.self_delegation).format('0.00%'):'N/A'}
        </CardText>
        {(isActive)?<CardText className="commission data">
            <i className="material-icons">call_split </i>{ (validator.commission.commission_rates)?
            numbro(validator.commission.commission_rates.rate).format('0.00%') : numbro(validator.commission.rate).format('0.00%')  }
         </CardText>:null} 
        {(!isActive)?<CardText className="last-seen data">
        <i class="material-icons">access_time </i>
        {validator.lastSeen?<TimeStamp time={validator.lastSeen}/>:
            (validator.unbonding_time?<TimeStamp time={validator.unbonding_time}/>:null)}
         </CardText>:null}
        {(!isActive)?<CardText className="bond-status data" xs={2}>
        <Col xs={6}>{(validator.status == 0)?<Badge color="secondary">Unbonded</Badge>:<Badge color="warning">Unbonding</Badge>}</Col>
        <Col xs={6}>{validator.jailed?<Badge color="danger">Jailed</Badge>:''}</Col>
         </CardText>:null}
        {(isActive)?<CardText className="uptime data">
        <i className="material-icons">flash_on</i><Progress value={validator.uptime} style={{width:'70%', display:'inline-block'}}>{validator.uptime?numbro(validator.uptime/100).format('0%'):0}
        </Progress>
        </CardText>:null}            
        </PopoverBody>
        </Card>
        </UncontrolledPopover>
    }

    render(){
           
        return [
            <span ref={this.ref} key='link' className="validator-popover-row">
            <Link to={this.state.address}><Avatar moniker={this.state.moniker} profileUrl={this.state.validator?this.state.validator.profile_url:''} address={this.state.address} /> {this.state.moniker} </Link>
            </span>,
             this.renderDetailTooltip()
        ]
    }
}

