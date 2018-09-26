import React, { Component } from 'react';
import { Badge } from 'reactstrap';
import ChainStatus from './ChainStatusContainer.js';
import Consensus from './ConsensusContainer.js';

export default class Home extends Component{
    constructor(props){
        super(props);
    }

    render() {
        return <div id="home">
            <h1>{Meteor.settings.public.chainName} <Badge color="primary">{Meteor.settings.public.chainId}</Badge></h1>
            <Consensus />
            <ChainStatus />
        </div>
    }

}