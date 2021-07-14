import React, { Component } from 'react';
import { Card, CardHeader, CardBody, Container, Row, Col, Spinner } from 'reactstrap';
import numbro from 'numbro';
import Account from '../components/Account.jsx';
import { Mongo } from 'meteor/mongo';
import i18n from 'meteor/universe:i18n';
import Coin from '../../../both/utils/coins.js';

const T = i18n.createComponent();

export default class ValidatorDelegations extends Component{
    constructor(props){
        super(props);
        this.state = {
            loading: true,
            numDelegatiors: 0,
            delegationsCount: 0
        }
    }

    componentDidMount(){
        Meteor.call('Validators.getAllDelegations', this.props.address, (error, result) => {
            if (error){
                console.warn(error);
            }

            if (result){
                this.setState({delegationsCount: result, loading: false
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
                <CardHeader><T>validators.delegations</T></CardHeader>
                <CardBody className="list">
                    <Container fluid>
                        <Row className="header text-nowrap d-none d-lg-flex">
                            <Col md={8}><span className="ml-n3"><T>common.totalNumOfDelegations</T>:</span></Col>
                            <Col md={4}><span className="font-weight-normal float-right">{this.state.delegationsCount}</span></Col>
                        </Row>
                    </Container>
                </CardBody>
            </Card>
        }
    }
}