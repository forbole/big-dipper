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
        <h1 className="d-none d-lg-block">Validator Details</h1>
            <Row>
                <Col md={12}>
                    <Switch>
                        <Route path="/validator/:address/missed/blocks" render={(props) => <MissedBlocks {...props} type='voter' />} />
                        <Route path="/validator/:address/missed/precommits" render={(props) => <MissedBlocks {...props} type='proposer' />} />
                        <Route exact path="/validator/:address" render={(props) => <Validator address={props.match.params.address} />} />
                    </Switch>
                </Col>
            </Row>    
                    
                
        </div>
    }

}