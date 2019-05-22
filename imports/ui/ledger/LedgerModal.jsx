import React, { Component } from 'react';
import { Button, Spinner, TabContent, TabPane, Row, Col, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import {Ledger} from './ledger.js';

class LedgerModal extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            loading: false,
            activeTab: '1'
        };
        this.ledger = new Ledger({testModeAllowed: false});
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.isOpen && !prevProps.isOpen && !this.state.loading) {
            this.tryConnect();
        }
    }

    tryConnect() {
        if (!this.state.loading){
            this.setState({
                loading: true,
                errorMessage: '',
            })
        }
        this.ledger.getCosmosAddress().then((res) => {
            this.setState({
                address:res.address,
                pubKey: res.pubKey,
                errorMessage: '',
                loading: false,
                activeTab: '2'
                });
            this.trySignIn();
        }, (err) => {
            this.setState({
                errorMessage: err.message,
                loading: false,
                activeTab: '1'
            })});
    }

    trySignIn() {
        this.setState({ loading: true})
        this.ledger.confirmLedgerAddress().then((res) => {
            localStorage.setItem(CURRENTUSERADDR, this.state.address);
            this.props.toggle();
            this.props.refreshApp();
        }, (err) => {
            this.setState({
                errorMessage: err.message,
                loading: false
            })})
    }

    getActionButton() {
        if (this.state.activeTab === '1' && !this.state.loading)
            return <Button color="primary"  onClick={this.tryConnect.bind(this)}>Retry</Button>
        if (this.state.activeTab === '2' && this.state.errorMessage !== '')
            return <Button color="primary"  onClick={this.trySignIn.bind(this)}>Retry</Button>
    }

    render() {
        return (
            <Modal isOpen={this.props.isOpen} toggle={this.props.toggle} className="ledger-sign-in">
            <ModalHeader toggle={this.props.toggle}>Sign In With Ledger</ModalHeader>
            <ModalBody>
                <TabContent activeTab={this.state.activeTab}>
                <TabPane tabId="1">
                    Please make sure your Ledger device is connected and Cosmos App is opened.
                </TabPane>
                        <TabPane tabId="2">
                    To log in as {this.state.address} please accept in your Ledger device.
                </TabPane>
            </TabContent>
            {this.state.loading?<Spinner type="grow" color="primary" />:''}
            <p className="error-message">{this.state.errorMessage}</p>
        </ModalBody>
            <ModalFooter>
            {this.getActionButton()}
                <Button color="secondary" onClick={this.props.toggle}>Cancel</Button>
            </ModalFooter>
            </Modal>
        );
    }
}

export default LedgerModal;