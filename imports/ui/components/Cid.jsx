import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import { NavLink } from 'reactstrap';

export default class Cid extends Component{
    constructor(props){
        super(props);

        this.state = {
            link: `https://cloudflare-ipfs.com/ipfs/${this.props.cid}`,
            cid: this.props.cid
        }
    }

    render(){
        return <span className={(this.props.copy)?"address overflow-auto d-inline-block copy":"address overflow-auto d-inline"} >
            <NavLink href={this.state.link}>{this.state.cid}</NavLink>
        </span>
    }
}