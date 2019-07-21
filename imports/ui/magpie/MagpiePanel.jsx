import React, { Component } from 'react';
import { Button, Input, Row, Col, Card, CardBody} from 'reactstrap';
import { createBech32Address } from '/imports/ui/ledger/ledger.js';

import CreateSessionButton from './CreateSession.jsx';
// import { Magpie } from './magpie.js';
import MagpieList from './MagpieListContainer.js';

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
            ['desmosSessionID', DESMOSSESSIONID],
            ['desmosSessionExpiry', DESMOSSESSIONEXPIRY],
            ['user', CURRENTUSERADDR]
        ]
        localStorageKeys.forEach(([name, key])=> {
            let value = localStorage.getItem(key)
            if (value && state[name] !== value) {
                newState[name] = value
            }
        })
        if (newState.desmosPubKey) {
            newState.desmosPubAddr = createBech32Address(Buffer.from(newState.desmosPubKey, 'base64'), 'desmos')
            newState.magpie = new Magpie(newState.desmosPubKey, newState.desmosPrivKey, newState.desmosPubAddr)
        }
        return newState;
    }

    handleInputChange = (e) => {
        let target = e.currentTarget;
        this.setState({[target.name]: target.value})
    }

    createPost = () => {
        this.state.magpie.createPost(this.state.user, this.state.newPostMessage, null)
    }

    renderDesmosAccount() {
        if (this.state.desmosSessionExpiry && new Date(this.state.desmosSessionExpiry) > new Date()) {
            return <div>
                <div>Current Proxy Address {this.state.desmosPubAddress} expires at {this.state.desmosSessionExpiry}</div>
                {this.props.isLogIn?<div>
                    <Input name="newPostMessage" onChange={this.handleInputChange}
                        placeholder="New Post" type="textarea" value={this.state.newPostMessage}/>
                    <Button onClick={this.createPost}> Post </Button>
                </div>:null}
            </div>
        } else {
            return <CreateSessionButton history={this.props.history}/>
        }
    }

    render () {
        return <Card>
            <div className="card-header">Magpie</div>
            <CardBody>
                {this.renderDesmosAccount()}
            </CardBody>
            <CardBody>
                <MagpieList address={this.props.address} />
            </CardBody>
        </Card>
    }
}