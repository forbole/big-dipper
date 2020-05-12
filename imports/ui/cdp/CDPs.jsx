import React, { Component } from 'react';
import { Row, Col } from 'reactstrap';
import { Route, Switch } from 'react-router-dom';
import List from '/imports/ui/cdp/List.jsx';
import ChainStates from '../components/ChainStatesContainer.js'
import { Helmet } from 'react-helmet';
import i18n from 'meteor/universe:i18n';

const T = i18n.createComponent();

const CDPList = (props) => {
    return <div>
        <p className="lead"><T>cdp.cdpList</T></p>
        <Row>
            <Col md={12}>
                <List {...props}/>
            </Col>
        </Row>
    </div>
}
export default class CDPs extends Component{
    constructor(props){
        super(props);
    }

    render() {
        return <div>
            <Helmet>
                <title>List of CDPs on Cosmos Hub | The Big Dipper</title>
                <meta name="description" content="List of CDPs on Cosmos Hub | The Big Dipper" />
            </Helmet>
            <Row>
                <Col md={3} xs={12}><h1 className="d-none d-lg-block"><T>cdp.cdps</T></h1></Col>
                <Col md={9} xs={12} className="text-md-right"><ChainStates /></Col>
            </Row>
            <Switch>
                <Route exact path="/cdps" component={CDPList} />
            </Switch>
        </div>
    }

}