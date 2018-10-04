import React, { Component } from 'react';
import { Table, Row, Col, Card, CardImg, CardText, CardBody,
    CardTitle, CardSubtitle, Button, Progress } from 'reactstrap';

export default class TopValidators extends Component{
    constructor(props){
        super(props);
        this.timer = 0;
        this.state = {
            validators: ''
        }
    }

    componentDidMount(){
        let self = this;
        self.timer = Meteor.setInterval(function(){
            let validators = self.shuffle(self.props.validators);
            validators.splice(10, validators.length-10);
            // console.log(validators);
            self.setState({
                validators: validators.map((validator) => {
                    return <tr><td>{validator.description.moniker}</td><td><Progress animated value={validator.uptimePercent()}>{validator.uptimePercent()}%</Progress></td><td>{validator.voting_power}</td></tr>
                })
            })
        },5000);
    }

    componentWillUnmount(){
        Meteor.clearInterval(this.timer);
    }

    // componentDidUpdate(prevState){
    //     if (this.props.status != prevState.status){
    //     }
    // }

    shuffle(a) {
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    render(){
        if (this.props.loading){
            return <div>Loading</div>
        }
        else{
            return <Card>
                <div className="card-header">Random Validators</div>
                <CardBody>
                    <Table striped className="random-validators">
                        <tr><th className="moniker">Moniker</th><th className="uptime">Uptime</th><th className="voting-power">Voting Power</th></tr>
                        {this.state.validators}
                    </Table>
                </CardBody>
            </Card>;
        }
    }
}