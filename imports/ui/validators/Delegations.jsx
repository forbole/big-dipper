import React, { Component } from 'react';
import { Card, CardHeader, CardBody, Container, Row, Col, Spinner } from 'reactstrap';
import numbro from 'numbro';
import Account from '../components/Account.jsx';
import { Mongo } from 'meteor/mongo';


export default class ValidatorDelegations extends Component{
    constructor(props){
        super(props);
        this.state = {
            loading: true,
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
                // console.log(result);
                // Delegations.remove({});
                let Delegations = new Mongo.Collection(null);
                result.forEach((delegation,i) => {
                    Delegations.insert(delegation);
                })
                let delegations = Delegations.find({},{sort:{shares:-1}}).fetch();
                this.setState({
                    loading: false,
                    numDelegatiors:delegations.length,
                    delegations: delegations.map((d, i) => {
                        return <Row key={i} className="delegation-info">
                                <Col md={8} className="text-nowrap overflow-auto"><Account address={d.delegator_address} /></Col>
                                <Col md={4}>{numbro(d.shares/this.props.shares*this.props.tokens/Meteor.settings.public.stakingFraction).format("0,0.00")} {Meteor.settings.public.stakingDenom}s</Col>
                            </Row>
                    })
                })
            }
        })
    }

    render(){
        if (this.state.loading){
            return <div><Spinner type="grow" color="primary"/></div>
        }
        else{
            return <Card>
                <CardHeader>{(this.state.numDelegatiors > 0)?this.state.numDelegatiors:'No'} delegators {(this.state.numDelegatiors > 0)?<small className="text-secondary">({numbro(this.props.tokens/this.state.numDelegatiors/Meteor.settings.public.stakingFraction).format('0,0.00')} {Meteor.settings.public.stakingDenom}s / delegator)</small>:''}</CardHeader>
                <CardBody className="list">
                    <Container fluid>
                        <Row className="header text-nowrap d-none d-lg-flex">
                            <Col md={8}><i className="fas fa-at"></i> <span>Addresses</span></Col>
                            <Col md={4}><i className="fas fa-piggy-bank"></i> <span>Amounts</span></Col>
                        </Row>
                        {this.state.delegations}
                    </Container>
                </CardBody>
            </Card>
        }
    }
}