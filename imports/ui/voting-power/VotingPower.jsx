import React, { Component } from 'react';
import TwentyEighty from './TwentyEightyContainer.js';

export default class VotingPower extends Component{
    constructor(props){
        super(props);
    }

    render(){
        return <div id="voting-power-dist">
                <h1 className="d-none d-lg-block">Voting Power Distribution</h1>
                <TwentyEighty />
            </div>
        }
}