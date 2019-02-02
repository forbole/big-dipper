import React, {Component} from 'react';
// import $ from 'jquery';
// import '/node_modules/flipclock/dist/flipclock.js';

export default class CountDown extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount(){
        console.log("compoinent did mount.");
        console.log(this.props);
        $('#countdown').FlipClock(this.props.genesisTime,{
            clockFace: 'DailyCounter',
            countdown: true
        });
    }

    render(){
        return <div id="countdown">Countdown</div>
    }
}