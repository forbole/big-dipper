import React, { Component } from 'react';
import {Line} from 'react-chartjs-2';
import { Row, Col, Card, CardImg, CardText, CardBody,
    CardTitle, CardSubtitle, Button, Progress } from 'reactstrap';
import moment from 'moment';

export default class Chart extends Component{
    constructor(props){
        super(props);
        this.state = {
            data: {
                labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
                datasets: [
                  {
                    label: 'My First dataset',
                    fill: false,
                    lineTension: 0.1,
                    backgroundColor: 'rgba(75,192,192,0.4)',
                    borderColor: 'rgba(75,192,192,1)',
                    borderCapStyle: 'butt',
                    borderDash: [],
                    borderDashOffset: 0.0,
                    borderJoinStyle: 'miter',
                    pointBorderColor: 'rgba(75,192,192,1)',
                    pointBackgroundColor: '#fff',
                    pointBorderWidth: 1,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: 'rgba(75,192,192,1)',
                    pointHoverBorderColor: 'rgba(220,220,220,1)',
                    pointHoverBorderWidth: 2,
                    pointRadius: 1,
                    pointHitRadius: 10,
                    data: [65, 59, 80, 81, 56, 55, 40]
                  }
                ]
              }
        }
    }

    componentDidUpdate(prevProps){
        if (prevProps.history != this.props.history){
            let dates = [];
            let heights = [];
            let blockTime = [];
            let timeDiff = [];
            let votingPower = [];
            let validators = [];
            for (let i in this.props.history){
                heights.push(this.props.history[i].height);
                blockTime.push((this.props.history[i].averageBlockTime/1000).toFixed(2));
                timeDiff.push((this.props.history[i].timeDiff/1000).toFixed(2));
                votingPower.push(this.props.history[i].voting_power);
                validators.push(this.props.history[i].precommits);
            }
            this.setState({
                vpData:{
                    labels:heights,
                    datasets: [
                        {
                            label: 'Voting Power',
                            fill: false,
                            data: votingPower
                        },
                        {
                            label: 'No. of Validators',
                            fill: false,
                            data: validators
                        }
                    ]
                },
                timeData:{
                    labels:heights,
                    datasets: [
                        {
                            label: 'Average Block Time',
                            fill: false,
                            data: blockTime
                        },
                        {
                            label: 'Block Interveral',
                            fill: false,
                            data: timeDiff
                        },
                        {
                            label: 'No. of Validators',
                            fill: false,
                            data: validators
                        }
                    ]
                }
            })
        }
    }

    render(){
        if (this.props.loading){
            return <div>Loading</div>
        }
        else{
            return (
                <div>
                <Card>
                    <div className="card-header">Voting Power</div>
                    <CardBody>
                    <Line data={this.state.vpData} />
                    </CardBody>
                </Card>
                <Card>
                    <div className="card-header">Block Time</div>
                    <CardBody>
                    <Line data={this.state.timeData} />
                    </CardBody>
                </Card>
                </div>
            );    
        }
    }
}