import React, { Component } from 'react';
import { Card, CardHeader, Row, Col } from 'reactstrap';
import numeral from 'numeral';
import Account from '../components/Account.jsx';

export default class ValidatorDelegations extends Component{
    constructor(props){
        super(props);
        this.state = {
            numDelegatiors: 0,
            delegations: ''
        }
    }

    componentDidMount(){
        Meteor.call('Validators.getAllDelegations', this.props.address, (error, result) => {
            if (error){
                console.log(error);
            }

            if (result){
                console.log(result);
                this.setState({
                    numDelegatiors:result.length,
                    delegations: result.map((d, i) => {
                        return <Card body key={i}>
                            <Row>
                                <Col md={8} className="text-nowrap overflow-auto"><Account address={d.delegations.delegator_address} /></Col>
                                <Col md={4}>{numeral(d.delegations.shares/this.props.shares*this.props.shares/Meteor.settings.public.stakingFraction).format("0,0.00")} {Meteor.settings.public.stakingDenom}</Col>
                            </Row>
                        </Card>
                    })
                })
            }
        })
    }

    render(){
        return <div><Card><CardHeader>{(this.state.numDelegatiors > 0)?this.state.numDelegatiors:'No'} delegators</CardHeader></Card>{this.state.delegations}</div>
    }
}