import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';

export default class VotingPower extends Component{
    constructor(props){
        super(props);
    }

    render(){
        return <div id="voting-power-dist">
            <h1 className="d-none d-lg-block">Voting Power Distribution</h1>
        </div>
        }
}