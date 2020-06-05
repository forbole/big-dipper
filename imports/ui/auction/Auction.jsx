import React, { Component } from 'react';
import { Row, Col } from 'reactstrap';
import { Route, Switch } from 'react-router-dom';
import List from '/imports/ui/auction/List.jsx';
import ChainStates from '../components/ChainStatesContainer.js'
import { Helmet } from 'react-helmet';
import i18n from 'meteor/universe:i18n';

const T = i18n.createComponent();

const AuctionList = (props) => {
    return <div>
        <p className="lead"><T>auction.auctionList</T></p>
        <Row>
            <Col md={12}>
                <List {...props} />
            </Col>
        </Row>
    </div>
}
export default class CDPs extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return <div>
            <Helmet>
                <title>List of Auctions on Cosmos Hub | The Big Dipper</title>
                <meta name="description" content="List of Auctions on Kava | The Big Dipper" />
            </Helmet>
            <Row>
                <Col md={3} xs={12}><h1 className="d-none d-lg-block"><T>auction.auctions</T></h1></Col>
                <Col md={9} xs={12} className="text-md-right"><ChainStates /></Col>
            </Row>
            <Switch>
                <Route exact path="/auctions" component={AuctionList} />
            </Switch>
        </div>
    }

}