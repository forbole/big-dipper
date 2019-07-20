import qs from 'querystring';
import Cosmos from "@lunie/cosmos-js"
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Button, Spinner, TabContent, TabPane, Row, Col, Modal, ModalHeader,
    Form, ModalBody, ModalFooter, InputGroup, InputGroupAddon, Input, Progress,
    UncontrolledTooltip, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem} from 'reactstrap';
import { Validators } from '/imports/api/validators/validators.js';
import AccountTooltip from '/imports/ui/components/AccountTooltip.jsx';
import Coin from '/both/utils/coins.js';
import moment from 'moment';
import numbro from 'numbro';

import { CreateSessionModal } from '/imports/ui/ledger/LedgerActions.jsx'
import { Ledger, createBech32Address } from '/imports/ui/ledger/ledger.js';


export default class CreateSessionButton extends Component{
    constructor(props){
        super(props);
        this.state = {
            isOpen: false
        }
    }

    createSession = () => {
        createKey();
        let pubKey = localStorage.getItem(DESMOSPUBKEY)
        this.setState({
            pubKey,
            privKey: localStorage.getItem(DESMOSPRIVKEY),
            bech32PubKey: createBech32Address(Buffer.from(pubKey,'base64'), 'desmos'),
            isOpen: true
        })
    }

    render = () => {
        return <span className="ledger-buttons-group float-right">
            <Button color="success" size="sm" onClick={this.createSession}>
                Create Session
            </Button>
            <CreateSessionModal isOpen={this.state.isOpen}
                toggle={(isOpen) => this.setState({isOpen})}
                history={this.props.history}
                pubKey={this.state.pubKey}
                bech32PubKey={this.state.bech32PubKey}
                privKey={this.state.privKey}/>
        </span>;
    }
}

