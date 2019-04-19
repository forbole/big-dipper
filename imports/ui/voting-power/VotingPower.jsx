import React, { Component } from 'react';
import {HorizontalBar} from 'react-chartjs-2';
import { Row, Col, Card, CardImg, CardText, CardBody,
    CardTitle, CardSubtitle, Button, Progress, Spinner } from 'reactstrap';
import numeral from 'numeral';

export default class VotingPower extends Component{
    constructor(props){
        super(props);
        this.state = {
            data: {},
            options: {}
        }
    }

    componentDidUpdate(prevProps){
        if (prevProps.stats != this.props.stats){
            let self = this;

            let labels = [];
            let data = [];
            let totalVotingPower = 0;
            let accumulatePower = [];
            let backgroundColors = [];
            
            for (let i in this.props.stats){
                totalVotingPower += this.props.stats[i].voting_power;
                if (i > 0){
                    accumulatePower[i] = accumulatePower[i-1] + this.props.stats[i].voting_power;
                }
                else{
                    accumulatePower[i] = this.props.stats[i].voting_power;
                }
            }

            for (let v in this.props.stats){
                labels.push(this.props.stats[v].description.moniker);
                data.push(this.props.stats[v].voting_power);
                let alpha = (this.props.stats.length+1-v)/this.props.stats.length*0.8+0.2;
                backgroundColors.push('rgba(189, 8, 28,'+alpha+')');
            }
            this.setState({
                data:{
                    labels:labels,
                    datasets: [
                        {
                            label: "Voting Power",
                            data: data,
                            backgroundColor: backgroundColors
                        }
                    ]
                },
                options:{
                    tooltips: {
                        callbacks: {
                            label: function(tooltipItem, data) {
                                return numeral(data.datasets[0].data[tooltipItem.index]).format("0,0")+" ("+(numeral(data.datasets[0].data[tooltipItem.index]/totalVotingPower).format("0.00%")+", "+numeral(accumulatePower[tooltipItem.index]/totalVotingPower).format("0.00%"))+")";
                            }
                        }
                    },
                    maintainAspectRatio: false,
                    scales: {
                        xAxes: [{
                            ticks: {
                                beginAtZero:true,
                                userCallback: function(value, index, values) {
                                    // Convert the number to a string and splite the string every 3 charaters from the end
                                    return numeral(value).format("0,0");
                                }
                            }
                        }]
                    }
                }
            });

            $("#voting-power-chart").height(16*data.length);
        }
    }

    render(){
        if (this.props.loading){
            return <Spinner type="grow" color="primary" />
        }
        else{
            if (this.props.statsExist && this.props.stats){
                return (                    
                    <Card>
                        <div className="card-header">Voting Power</div>
                        <CardBody id="voting-power-chart">
                            <HorizontalBar data={this.state.data} options={this.state.options} />
                        </CardBody>
                    </Card>
                );   
            }
            else{
                return <div></div>
            }
        }
    }
}    
