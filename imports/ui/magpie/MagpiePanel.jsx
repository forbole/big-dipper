import React, { Component } from 'react';
import { Button, Input, Row, Col, Card, CardBody} from 'reactstrap';
import { createBech32Address } from '/imports/ui/ledger/ledger.js';

import CreateSessionButton from './CreateSession.jsx';
import { Magpie } from './magpie.js';

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

    handleInputChange = (e) => {
        let target = e.currentTarget;
        this.setState({[target.name]: target.value})
    }

    createPost = () => {
        this.magpie.createPost()
        /* broadcast
        Meteor.call('desmos.broadcast', txMsg, (err, res) => {
            if (err) {
                this.setStateOnError('signing', err.reason)
            } else if (res) {
                this.setStateOnSuccess('signing', {
                    txHash: res,
                    activeTab: '4'
                })
            }
        })*/
    }

    renderDesmosAccount() {
        if (this.props.isLogIn) {
            if (this.state.desmosSession && new Date(this.state.desmosSession) > new Date()) {
                return <div>
                    <div>Current Proxy Address {createBech32Address(this.state.desmosPubKey)} expires at {this.state.desmosSession}</div>

                    <Input name="newPostMessage" onChange={this.handleInputChange}
                        placeholder="New Post" type="textarea" value={this.state.newPostMessage}/>
                    <Button onClick={this.createPost}> Post </Button>
                </div>
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