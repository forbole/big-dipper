import React, { Component } from 'react';
import { Button, Spinner, TabContent, TabPane, Row, Col, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import {Ledger} from './ledger.js';
import i18n from 'meteor/universe:i18n';

const T = i18n.createComponent();

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
            return <Button color="primary"  onClick={this.tryConnect.bind(this)}><T>common.retry</T></Button>
        if (this.state.activeTab === '2' && this.state.errorMessage !== '')
            return <Button color="primary"  onClick={this.trySignIn.bind(this)}><T>common.retry</T></Button>
    }

    render() {
        return (
            <Modal isOpen={this.props.isOpen} toggle={this.props.toggle} className="ledger-sign-in">
            <ModalHeader toggle={this.props.toggle}><T>accounts.signInWithLedger</T></ModalHeader>
            <ModalBody>
                <TabContent activeTab={this.state.activeTab}>
                <TabPane tabId="1">
                    <T _purify={false}>accounts.signInWarning</T>
                </TabPane>
                        <TabPane tabId="2">
                    <T>accounts.toLoginAs</T> <strong className="text-primary d-block">{this.state.address}</strong><T>accounts.pleaseAccept</T>
                </TabPane>
            </TabContent>
            {this.state.loading?<Spinner type="grow" color="primary" />:''}
            <p className="error-message">{this.state.errorMessage}</p>
        </ModalBody>
            <ModalFooter>
            {this.getActionButton()}
                <Button color="secondary" onClick={this.props.toggle}><T>common.cancel</T></Button>
            </ModalFooter>
            </Modal>
        );
    }
}

export default LedgerModal;