import React, { Component } from 'react';
import { Badge, Row, Col } from 'reactstrap';
import { Route, Switch } from 'react-router-dom';
import List from './ListContainer.js';
import Proposal from './ProposalContainer.js';

const ProposalList = () => {
    return <div>
        <p className="lead">Here is a list of governance proposals.</p>
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
        <h1>Proposals</h1>
            <Switch>
                <Route exact path="/proposals" component={ProposalList} />
                <Route path="/proposals/:id" component={Proposal} />
            </Switch>
        </div>
    }

}