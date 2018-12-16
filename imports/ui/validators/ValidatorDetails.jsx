import React, { Component } from 'react';
import { Badge, Container, Row, Col } from 'reactstrap';
import { Route, Switch } from 'react-router-dom';
import Validator from './ValidatorContainer.js';
import MissedBlocks from './MissedBlocksContainer.js';

export default class ValidatorDetails extends Component{
    constructor(props){
        super(props);
    }

    render() {
        return <div>
        <h1>Validator Details <Badge color="primary">{Meteor.settings.public.chainId}</Badge></h1>
            <Row>
                <Col md={12}>
                    <Switch>
                        <Route exact path="/validator/:address/missed" component={MissedBlocks} />
                        <Route path="/validator/:address" render={(props) => <Validator address={props.match.params.address} />} />
                    </Switch>
                </Col>
            </Row>    
                    
                
        </div>
    }

}