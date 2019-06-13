import React, { Component } from 'react';
import { Card, CardHeader, CardBody, Container, Row, Col, Spinner } from 'reactstrap';
import numbro from 'numbro';
import Account from '../components/Account.jsx';
import { Mongo } from 'meteor/mongo';
import i18n from 'meteor/universe:i18n';

const T = i18n.createComponent();

export default class AccountDelegations extends Component{
    constructor(props){
        super(props);
        this.state = {
            loading: true,
            numDelegations: 0,
            delegations: ''
        }
    }

    updateDelegations = () =>{
        Meteor.call('accounts.getAllDelegations', this.props.address, (error, result) => {
            if (error){
                console.warn(error);
            }
            else{
                this.setState({
                    loading:false
                });
                if (result){

                    let Delegations = new Mongo.Collection(null);
                    result.forEach((delegation,i) => {
                        Delegations.insert(delegation);
                    })
                    let delegations = Delegations.find({},{sort:{shares:-1}}).fetch();
                    this.setState({
                        numDelegations:delegations.length,
                        delegations: delegations.map((d, i) => {
                            return <Row key={i} className="delegation-info">
                                <Col xs={6} md={8} className="text-nowrap overflow-auto"><Account address={d.validator_address} /></Col>
                                <Col xs={6} md={4}>{numbro(d.shares).format("0,0")}</Col>
                            </Row>
                        })
                    })
                }
            }
        })
    }

    componentDidMount(){
        this.updateDelegations();
    }

    componentDidUpdate(prevProps){
        if (this.props != prevProps){
            this.updateDelegations();
        }
    }

    render(){
        if (this.state.loading){
            return <div><Spinner type="grow" color="primary"/></div>
        }
        else{
            return <Card>
                <CardHeader>{(this.state.numDelegations > 0)?this.state.numDelegations:<T>accounts.no</T>} <T>accounts.delegation</T>{(this.state.numDelegations>1)?<T>accounts.plural</T>:''}</CardHeader>
                {(this.state.numDelegations > 0)?<CardBody className="list overflow-auto">
                    <Container fluid>
                        <Row className="header text-nowrap d-none d-lg-flex">
                            <Col md={8}><i className="fas fa-at"></i> <span><T>accounts.validators</T></span></Col>
                            <Col md={4}><i className="fas fa-piggy-bank"></i> <span><T>accounts.shares</T></span></Col>
                        </Row>
                        {this.state.delegations}
                    </Container>
                </CardBody>:''}
            </Card>
        }
    }
}