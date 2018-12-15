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
        let proposer = this.props.block.proposer();
        let moniker = (proposer.description&&proposer.description.moniker)?proposer.description.moniker:proposer.address;
        let identity = (proposer.description&&proposer.description.identity)?proposer.description.identity:"";
        return (
            <tr className="blockrow">
                <td className="innerblock1">{numeral(this.props.block.height).format('0,0')}</td>
                <td className="innerblock2">{this.props.block.hash}</td>
                <td className=""><Link to={"/validator/"+this.props.block.proposerAddress}><Avatar moniker={moniker} identity={identity} address={this.props.block.proposerAddress} list={true} /> {moniker}</Link> {identity? <KeybaseCheck identity={identity} />:''}</td>
                <td xs="3" className="innerblock">{numeral(this.props.block.transNum).format('0,0')}</td>
                <td xs="3" className="innerblock">{moment.utc(this.props.block.time).format("D MMM YYYY, h:mm:ssa")}</td>
            </tr>
        );
    }
}