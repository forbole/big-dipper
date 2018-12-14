import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Table, Row, Col, Card, CardImg, CardText, CardBody,
    CardTitle, CardSubtitle, Button, Progress } from 'reactstrap';
import numeral from 'numeral';
import Avatar from '../components/Avatar.jsx';
import KeybaseCheck from '../components/KeybaseCheck.jsx';

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
                validators: validators.map((validator, i ) => {
                    return <tr key={i}>
                        <td><Link to={"/validator/"+validator.address}><Avatar moniker={validator.description.moniker} identity={validator.description.identity} address={validator.address} list={true} />{validator.description.moniker}</Link> {validator.description.identity?<KeybaseCheck identity={validator.description.identity} />:''}</td>
                        <td><Progress animated value={validator.uptime}>{validator.uptime?validator.uptime.toFixed(2):0}%</Progress></td>
                        <td className="voting-power">{numeral(validator.voting_power).format('0,0')}</td>
                    </tr>
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
                        <thead>
                            <tr><th className="moniker"><i className="material-icons">perm_contact_calendar</i> <span className="d-none d-sm-inline">Moniker</span></th><th className="uptime"><i className="material-icons">thumb_up</i> <span className="d-none d-sm-inline">Uptime</span></th><th className="voting-power"><i className="material-icons">flash_on</i> <span className="d-none d-sm-inline">Voting Power</span></th></tr>
                        </thead>
                        <tbody>{this.state.validators}</tbody>
                    </Table>
                </CardBody>
            </Card>;
        }
    }
}