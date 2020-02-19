import React, { Component } from 'react';
import { Row, Col } from 'reactstrap';
import SignersTableContainer from './SignersTableContainer.js'
import SignersChartContainer from './SignersChartContainer.js'
import ChainStates from '../components/ChainStatesContainer.js'
import { Helmet } from 'react-helmet';
import i18n from 'meteor/universe:i18n';

const T = i18n.createComponent();
export default class SignersPage extends Component {
    constructor(props){
        super(props);
        this.state = {
            limit: 1000,
        };
    }

    render(){
        return <div>
            <Helmet>
                <title>Latest Signers on Unification Mainchain</title>
                <meta name="description" content="Latest signers on Unification Mainchain" />
            </Helmet>
            <Row>
                <Col md={4} xs={12}><h1 className="d-none d-lg-block"><T>signers.latestSigners</T></h1></Col>
                <Col md={8} xs={12} className="text-md-right"><ChainStates /></Col>
            </Row>

            <SignersChartContainer limit={this.state.limit} />
            <Row>
                <Col>
                    &nbsp;
                </Col>
            </Row>
            <SignersTableContainer limit={this.state.limit} />
        </div>
    }
}
