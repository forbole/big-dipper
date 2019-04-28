import React, { Component } from 'react';
import { Spinner, Row, Col, Card, CardHeader, CardBody } from 'reactstrap';
import numeral from 'numeral';

export default class Account extends Component{
    constructor(props){
        super(props);
        this.state = {
            loading: false,
            accountExists: false
        }
    }

    componentDidMount(){
        
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
                <Row>
                    <Col><Card>
                        <CardHeader></CardHeader>
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