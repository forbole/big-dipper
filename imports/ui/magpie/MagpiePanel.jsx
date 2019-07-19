import React, { Component } from 'react';
import { Button, Input, Row, Col, Card, CardBody} from 'reactstrap';
import { createBech32Address } from '/imports/ui/ledger/ledger.js';

import CreateSessionButton from './CreateSession.jsx';

export default class MagpiePanel extends Component{
    constructor(props){
        super(props);
        this.state = {}
    }

    static getDerivedStateFromProps(props, state) {
        let newState = {}
        let localStorageKeys = [
            ['desmosPubKey', DESMOSPUBKEY],
            ['desmosPrivKey', DESMOSPRIVKEY],
            ['desmosSession', DESMOSSESSION],
        ]
        localStorageKeys.forEach(([name, key])=> {
            let value = localStorage.getItem(key)
            if (value && state[name] !== value) {
                newState[name] = value
            }
        })
        return newState;
    }

    renderDesmosAccount() {
        if (this.props.isLogIn) {
            if (this.state.desmosSession && new Date(this.state.desmosSession) > new Date()) {
                return <div> Current Proxy Address {createBech32Address(this.state.desmosPubKey)}</div>
            } else {
                return <CreateSessionButton history={this.props.history}/>
            }
        }
    }

    render () {
        return <Card>
            <div className="card-header">Magpie</div>
            <CardBody>
                {this.renderDesmosAccount()}
            </CardBody>
        </Card>
    }
}