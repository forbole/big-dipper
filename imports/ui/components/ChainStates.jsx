import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import { Link } from 'react-router-dom';
import { Card, CardHeader, Row, Col } from 'reactstrap';
import numbro from 'numbro';

export default class ChainStates extends Component{
    constructor(props){
        super(props);
        this.state ={
            price: "$0",
            marketCap: "$0",
            inflation: 0,
            communityPool: 0
        }
    }

    componentDidUpdate(prevProps){
        if (this.props.chainStates != prevProps.chainStates){
            if (this.props.chainStates.communityPool){
                this.setState({
                    communityPool: this.props.chainStates.communityPool.map((pool,i) => {
                        return <span key={i}>{numbro(pool.amount/Meteor.settings.public.stakingFraction).format("0,0.00")} {Meteor.settings.public.stakingDenom}</span>
                    }),
                    inflation: numbro(this.props.chainStates.inflation).format("0.00%")
                })
            }
        }

        if (this.props.coinStats != prevProps.coinStats){
            if (this.props.coinStats.usd){
                this.setState({
                    price: numbro(this.props.coinStats.usd).format("$0,0.00"),
                    marketCap: numbro(this.props.coinStats.usd_market_cap).format("$0,0.00")
                })
            }
        }
    }
    render(){
        return <Card className="d-lg-inline-block">
            <CardHeader>
                <Row className="text-nowrap">
                    <Col xs={4} md="auto"><small><span>Price:</span> <strong>{this.state.price}</strong></small></Col>
                    <Col xs={8} md="auto"><small><span>Market Cap:</span> <strong>{this.state.marketCap}</strong></small></Col>
                    <Col xs={4} md="auto"><small><span>Inflation:</span> <strong>{this.state.inflation}</strong></small></Col>
                    <Col xs={8} md="auto"><small><span>Community Pool:</span> <strong>{this.state.communityPool}</strong></small></Col>
                </Row>
            </CardHeader>
        </Card>
    }
}
