import React, { Component } from 'react';
import { Card, CardHeader, CardBody, Container, Row, Col, Spinner } from 'reactstrap';
import numbro from 'numbro';
import Account from '../components/Account.jsx';
import { Mongo } from 'meteor/mongo';


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
                console.log(result);
                this.setState({
                    loading:false
                });
                if (result){
                    this.setState({
                        numUnbondings:result.length,
                        unbondings: result.map((u, i) => {
                            return <Row key={i} className="delegation-info">
                                    <Col md={8} className="text-nowrap overflow-auto"><Account address={u.validator_address} /></Col>
                                    <Col md={4}>{u.entries.map((entry,j) => {
                                        return <div key={j}>{numbro(entry.balance).format("0,000a")}</div>
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
                <CardHeader>{(this.state.numUnbondings > 0)?this.state.numUnbondings:'No'} unbondings</CardHeader>
                <CardBody className="list overflow-auto">
                    <Container fluid>
                        <Row className="header text-nowrap d-none d-lg-flex">
                            <Col md={8}><i className="fas fa-at"></i> <span>Validators</span></Col>
                            <Col md={4}><i className="fas fa-piggy-bank"></i> <span>Shares</span></Col>
                        </Row>
                        {this.state.unbondings}
                    </Container>
                </CardBody>
            </Card>
        }
    }
}