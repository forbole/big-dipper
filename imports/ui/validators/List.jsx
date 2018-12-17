import React, { Component } from 'react';
import { Badge, Progress } from 'reactstrap';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { Meteor } from 'meteor/meteor';
import numeral from 'numeral';
import Avatar from '../components/Avatar.jsx';
import KeybaseCheck from '../components/KeybaseCheck.jsx';

const ValidatorRow = (props) => {
    let moniker = (props.validator.description&&props.validator.description.moniker)?props.validator.description.moniker:props.validator.address;
    let identity = (props.validator.description&&props.validator.description.identity)?props.validator.description.identity:'';
    return <tr>
        <th scope="row" className="d-none d-md-table-cell counter">{props.index+1}</th>
        <td><Link to={"/validator/"+props.validator.address}><Avatar moniker={moniker} identity={identity} address={props.validator.address} list={true} />{moniker}</Link> {identity? <KeybaseCheck identity={identity} />:''}</td>
        <td className="voting-power">{numeral(props.validator.voting_power).format('0,0')} ({numeral(props.validator.voting_power/props.totalPower*100).format('0.00')}%)</td>
        <td className="status">{props.validator.jailed?<Badge color="danger"><span className="d-none d-sm-inline">Jailed</span></Badge>:<Badge color="success"><span className="d-none d-sm-inline">Active</span></Badge>}</td>
        {(!props.jailed)?<td className="uptime"><Progress animated value={props.validator.uptime}>{props.validator.uptime?props.validator.uptime.toFixed(2):0}%</Progress></td>:''}
        {(!props.jailed)?<td className="proposer-priority text-right">{numeral(props.validator.proposer_priority).format('0,0')}</td>:''}
        {(props.jailed)?<td className="last-seen">{moment.utc(props.validator.lastSeen).format("D MMM YYYY, h:mm:ssa")}</td>:''}
    </tr>
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
                            key={i} 
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
                <tbody>{this.state.validators}</tbody>
            )    
        }
    }
}