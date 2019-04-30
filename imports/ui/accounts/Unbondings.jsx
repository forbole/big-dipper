import React, { Component } from 'react';
import { Card, CardHeader, CardBody, Container, Row, Col, Spinner } from 'reactstrap';
import numbro from 'numbro';
import Account from '../components/Account.jsx';
import { Mongo } from 'meteor/mongo';
import moment from 'moment';


export default class AccountUnbondings extends Component{
    constructor(props){
        super(props);
        this.state = {
            loading: true,
            numUnbondings: 0,
            unbondings: ''
        }
    }

    componentDidMount(){
        Meteor.call('accounts.getAllUnbondings', this.props.address, (error, result) => {
            if (error){
                console.log(error);
            }
            else{
                this.setState({
                    loading:false
                });
                if (result){
                    this.setState({
                        numUnbondings:result.length,
                        unbondings: result.map((u, i) => {
                            return <Row key={i} className="delegation-info">
                                    <Col md={5} className="text-nowrap overflow-auto"><Account address={u.validator_address} /></Col>
                                    <Col md={7}>{u.entries.map((entry,j) => {
                                        return <Row key={j}>
                                            <Col md={6}>
                                                {numbro(entry.balance).format("0,000a")}
                                            </Col>
                                            <Col md={6}>
                                                {moment.utc(entry.completion_time).fromNow()}
                                            </Col>
                                        </Row>
                                    })}</Col>
                                </Row>
                        })
                    })
    
                }
            }
        })
    }

    render(){
        if (this.state.loading){
            return <div><Spinner type="grow" color="primary"/></div>
        }
        else{
            return <Card>
                <CardHeader>{(this.state.numUnbondings > 0)?this.state.numUnbondings:'No'} unbonding{(this.state.numUnbondings>1)?'s':''}</CardHeader>
                <CardBody className="list overflow-auto">
                    <Container fluid>
                        <Row className="header text-nowrap d-none d-lg-flex">
                            <Col md={5}><i className="fas fa-at"></i> <span>Validators</span></Col>
                            <Col md={7}>
                                <Row>
                                    <Col md={6}><i className="fas fa-piggy-bank"></i> <span>Shares</span></Col>
                                    <Col md={6}><i className="fas fa-clock"></i> <span>Mature</span></Col>
                                </Row>
                            </Col>
                        </Row>
                        {this.state.unbondings}
                    </Container>
                </CardBody>
            </Card>
        }
    }
}