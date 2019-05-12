import React, { Component } from 'react';
import { Badge, Row, Col } from 'reactstrap';
import { Route, Switch } from 'react-router-dom';
import List from './ListContainer.js';
import Proposal from './ProposalContainer.js';
import ChainStates from '../components/ChainStatesContainer.js'
import i18n from 'meteor/universe:i18n';

const T = i18n.createComponent();

const ProposalList = () => {
    return <div>
        <p className="lead"><T>proposals.listOfProposals</T></p>
            <Row>
                <Col md={12}>
                    <List />
                </Col>
            </Row>
    </div>
}
export default class Proposals extends Component{
    constructor(props){
        super(props);
    }

    render() {
        return <div>
            <Row>
                <Col md={3} xs={12}><h1 className="d-none d-lg-block"><T>proposals.proposals</T></h1></Col>
                <Col md={9} xs={12} className="text-md-right"><ChainStates /></Col>
            </Row>
            <Switch>
                <Route exact path="/proposals" component={ProposalList} />
                <Route path="/proposals/:id" component={Proposal} />
            </Switch>
        </div>
    }

}