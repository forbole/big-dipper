import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';
import numeral from 'numeral';
import Avatar from '../components/Avatar.jsx';
import KeybaseCheck from '../components/KeybaseCheck.jsx';

export default class Block extends Component {
    constructor(props){
        super(props);
    }

    render() {
        return (
            <tr className="blockrow">
                <td className="innerblock1">{numeral(this.props.block.height).format('0,0')}</td>
                <td className="innerblock2">{this.props.block.hash}</td>
                <td className=""><Link to={"/validator/"+this.props.block.proposerAddress}><Avatar moniker={this.props.block.proposer().description.moniker} identity={this.props.block.proposer().description.identity} address={this.props.block.proposerAddress} list={true} /> {this.props.block.proposer().description.moniker}</Link> {this.props.block.proposer().description.identity? <KeybaseCheck identity={this.props.block.proposer().description.identity} />:''}</td>
                <td xs="3" className="innerblock">{numeral(this.props.block.transNum).format('0,0')}</td>
                <td xs="3" className="innerblock">{moment.utc(this.props.block.time).format("D MMM YYYY, h:mm:ssa")}</td>
            </tr>
        );
    }
}