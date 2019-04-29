import React, { Component } from 'react';
import { Spinner, Row, Col, Card, CardHeader, CardBody } from 'reactstrap';
import numeral from 'numeral';

export default class Account extends Component{
    constructor(props){
        super(props);
        this.state = {
            loading: false,
            accountExists: false,
            available: 0,
            delegated: 0,
            unbonding: 0,
            rewards: 0,
            total: 0
        }
    }

    componentDidMount(){
        Meteor.call('accounts.getBalance', this.props.match.params.address, (error, result) => {
            if (error){
                console.log(error);
                this.setState({
                    loading:false
                })
            }

            if (result){
                console.log(result);
                if (result.available){
                    this.setState({
                        available: parseFloat(result.available.amount),
                        total: parseFloat(this.state.total)+parseFloat(result.available.amount)
                    })
                }

                if (result.delegations && result.delegations.length > 0){
                    result.delegations.forEach((delegation, i) => {
                        this.setState({
                            delegated: this.state.delegated+parseFloat(delegation.shares),
                            total: this.state.total+parseFloat(delegation.shares)
                        })
                    }, this)
                }

                if (result.unbonding && result.unbonding.length > 0){
                    result.unbonding.forEach((unbond, i) => {
                        unbond.entries.forEach((entry, j) => {
                            this.setState({
                                unbonding: this.state.unbonding+parseFloat(entry.balance),
                                total: this.state.total+parseFloat(entry.balance)
                            })
                        , this})
                    }, this)
                }

                if (result.rewards && result.rewards.length > 0){
                    result.rewards.forEach((reward, i) => {
                        this.setState({
                            rewards: this.state.rewards+parseFloat(reward.amount),
                            total: this.state.total+parseFloat(reward.amount)
                        })
                    }, this)
                }

                this.setState({
                    loading:false,
                    accountExists: true
                })
            }
        })
    }

    componentDidUpdate(prevProps){

    }

    render(){
        if (this.state.loading){
            return <div id="account">
                <h1 className="d-none d-lg-block">Account Details</h1>
                <Spinner type="grow" color="primary" />
            </div>
        }
        else if (this.state.accountExists){
            return <div id="account">
                <h1 className="d-none d-lg-block">Account Details</h1>
                <h3 className="text-primary">{this.props.match.params.address}</h3>
                <Row>
                    <Col><Card>
                        <CardHeader>Balance</CardHeader>
                        <CardBody>
                            <Row>
                                <Col md={4} className="label">Available</Col>
                                <Col md={8} className="value">{numeral(this.state.available/Meteor.settings.public.stakingFraction).format("0,0.000")}</Col>
                            </Row>
                            <Row>
                                <Col md={4} className="label">Delegated</Col>
                                <Col md={8} className="value">{numeral(this.state.delegated/Meteor.settings.public.stakingFraction).format("0,0.000")}</Col>
                            </Row>
                            <Row>
                                <Col md={4} className="label">Unbonding</Col>
                                <Col md={8} className="value">{numeral(this.state.unbonding/Meteor.settings.public.stakingFraction).format("0,0.000")}</Col>
                            </Row>
                            <Row>
                                <Col md={4} className="label">Rewards</Col>
                                <Col md={8} className="value">{numeral(this.state.rewards/Meteor.settings.public.stakingFraction).format("0,0.000")}</Col>
                            </Row>
                            <Row>
                                <Col md={4} className="label">Total</Col>
                                <Col md={8} className="value">{numeral(this.state.total/Meteor.settings.public.stakingFraction).format("0,0.000")} {Meteor.settings.public.stakingDenom}s</Col>
                            </Row>
                        </CardBody>
                    </Card></Col>
                </Row>
            </div>
        }
        else{
            return <div id="account">
                <h1 className="d-none d-lg-block">Account Details</h1>
                <p>The account doesn't exist. Are you looking for a wrong address?</p>
            </div>
        }
    }
}