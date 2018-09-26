import React, { Component } from 'react';
import { Badge } from 'reactstrap';
import ChainStatus from '../components/ChainStatusContainer.js';

export default class Home extends Component{
    constructor(props){
        super(props);
    }

    render() {
        return <div>
            <h1>{Meteor.settings.public.chainName} <Badge color="primary">{Meteor.settings.public.chainId}</Badge></h1>
            <ChainStatus />
        </div>
    }

}