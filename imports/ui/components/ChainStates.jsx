import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import { Link } from 'react-router-dom';
import { Card, CardHeader, Row, Col } from 'reactstrap';
import numbro from 'numbro';
import i18n from 'meteor/universe:i18n';

const T = i18n.createComponent();

export default class ChainStates extends Component{
    constructor(props){
        super(props);
        this.state ={
            price: "$-",
            marketCap: "$-",
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
                    <Col xs={4} md="auto"><small><span><T>chainStates.price</T>:</span> <strong>{this.state.price}</strong></small></Col>
                    <Col xs={8} md="auto"><small><span><T>chainStates.marketCap</T>:</span> <strong>{this.state.marketCap}</strong></small></Col>
                    <Col xs={4} md="auto"><small><span><T>chainStates.inflation</T>:</span> <strong>{this.state.inflation}</strong></small></Col>
                    <Col xs={8} md="auto"><small><span><T>chainStates.communityPool</T>:</span> <strong>{this.state.communityPool}</strong></small></Col>
                </Row>
            </CardHeader>
        </Card>
    }
}
