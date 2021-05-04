import React, { Component } from 'react';
import { Button, Spinner, TabContent, TabPane, Row, Col, Modal, ModalHeader, ModalBody, ModalFooter, UncontrolledDropdown, DropdownMenu, DropdownToggle, DropdownItem } from 'reactstrap';
import {Ledger} from './ledger.js';
import i18n from 'meteor/universe:i18n';

const T = i18n.createComponent();

class LedgerModal extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            loading: false,
            activeTab: '1',
            transportBLE: localStorage.getItem(BLELEDGERCONNECTION) ?? false
        };
        this.ledger = new Ledger({testModeAllowed: false});
    }

    autoOpenModal = () => {
        if (!this.props.isOpen && this.props.handleLoginConfirmed) {
            // this.tryConnect(5000);
            this.props.toggle(true);
        }
    }

    componentDidMount() {
        this.autoOpenModal();
    }

    componentDidUpdate(prevProps, prevState) {
        this.autoOpenModal();
        let bleTransport = this.state.transportBLE
        if (bleTransport != prevState.transportBLE) {
            this.tryConnect();
        }
    }

    connectionSelection = async (e) => {
        e.persist();
        if(e?.currentTarget?.value === "usb"){
            await this.setState({ transportBLE: false })
            this.tryConnect()
        }
        if (e?.currentTarget?.value === "bluetooth") {
            await this.setState({ transportBLE: true })
            this.tryConnect()
        }
    }

    tryConnect = (timeout=undefined) => {
        if (this.state.loading) return
        this.setState({ loading: true, errorMessage: '' })
        if (this.state.addressHasBeenSelected === true){
            this.ledger.getCosmosAddress(this.state.transportBLE).then((res) => {
                let currentUser = localStorage.getItem(CURRENTUSERADDR);
                if (this.props.handleLoginConfirmed && res.address === currentUser) {
                    this.closeModal(true)
                } else {
                    this.setState({
                        currentUser: currentUser,
                        address: res.address,
                        pubKey: Buffer.from(res.pubKey).toString('base64'),
                        errorMessage: '',
                        loading: false,
                        activeTab: '2'
                    });
                    this.trySignIn();
                }
            }, (err) => {
                this.setState({
                    errorMessage: err.message,
                    loading: false,
                    activeTab: '1'
                })
            });
        }
        else{
            this.renderDropDown();
            this.setState({
                errorMessage: '',
                loading: false,
                activeTab: '2'
            });
        }
      
        
    }

    handleAddressSwitch = (address, index, e) => {
        e.preventDefault();
        localStorage.setItem('addressIndex', index)
        this.setState({
            currentUserAddress: address,
            addressHasBeenSelected: true
        })
    }

    async renderDropDown() {
        this.setState({ loadingAccountsList: true })
        let accounts = [];
        for(let c = 0; c < 10; c++){
            // eslint-disable-next-line no-await-in-loop
            accounts[c] = await this.ledger.getLedgerAddresses(c, this.state.transportBLE)
        }
        if(accounts.length === 10){
            this.setState({ loadingAccountsList: false, accountsList: accounts, addressesLoaded: true })
        }
        return accounts
    }



    trySignIn = () => {
        this.setState({ loading: true, errorMessage: ''})
        this.ledger.confirmLedgerAddress(this.state.transportBLE).then((res) => {
            localStorage.setItem(CURRENTUSERADDR, this.state.address);
            localStorage.setItem(CURRENTUSERPUBKEY, this.state.pubKey);
            localStorage.setItem(BLELEDGERCONNECTION, this.state.transportBLE);
            this.props.refreshApp();
            this.closeModal(true);
        }, (err) => {
            this.setState({
                errorMessage: err.message,
                loading: false
            })})
    }

    getActionButton() {
        if (this.state.activeTab === '2' && this.state.errorMessage !== '')
            return <Button color="primary"  onClick={this.trySignIn}><T>common.retry</T></Button>
    }

    getLoginButton() {
        if (this.state.activeTab === '2' && this.state.errorMessage === '' && this.state.accountsList)
            return <Button color="primary" onClick={this.tryConnect}><T>common.signIn</T></Button>
    }

    closeModal = (success) => {
        if (this.props.handleLoginConfirmed) {
            this.props.handleLoginConfirmed(typeof success ==='boolean'?success:false);
        }
        this.setState({
            loading: false,
            errorMessage: '',
            currentUser: null,
            address: null,
            activeTab: '1'
        })
        localStorage.removeItem('addressIndex')
        this.props.toggle(false)
    }

    render() {
        return (
            <Modal isOpen={this.props.isOpen} toggle={this.closeModal} className="ledger-sign-in">
                <ModalHeader><T>accounts.signInWithLedger</T></ModalHeader>
                <ModalBody>
                    <TabContent activeTab={this.state.activeTab}>
                        <TabPane tabId="1">
                            <T _purify={false} network={Meteor.settings.public.ledger.appName} version={Meteor.settings.public.ledger.appVersion}>accounts.signInWarning</T>
                            <div className="d-flex justify-content-center">
                                <Button color="secondary" value="usb" onClick={this.connectionSelection} className="mt-3 mr-4"><span><img src="/img/usb.svg" alt="USB" style={{height: "25px"}}/><T>USB</T></span></Button>
                                <Button color="secondary" value="bluetooth" onClick={this.connectionSelection} className="mt-3 "><span><img src="/img/bluetooth.svg" alt="Bluetooth" style={{ height: "25px" }} /><T>Bluetooth</T></span></Button>
                            </div>
                            <h6 className="error-message text-center mt-3"><T>accounts.BLESupport</T></h6>
                        </TabPane>
                        <TabPane tabId="2">
                            {this.state.currentUser?<span>You are currently logged in as <strong className="text-primary d-block">{this.state.currentUser}.</strong></span>:null}
                            {this.state.loadingAccountsList ? <Spinner type="grow" color="primary" /> :
                            <>
                            <span className="text-primary text-center mb-3 d-block">Select address to log in with from the list below: </span>
                                    <UncontrolledDropdown direction='down' size="md" className='ledger-accounts-dropdown text-center'>
                                        <DropdownToggle caret >
                                            {this.state.currentUserAddress ? <span className="text-lowercase">{this.state.currentUserAddress}</span> : <span>Select address</span>}
                                        </DropdownToggle>
                                        <DropdownMenu>
                                            {
                                                this.state.accountsList ? this.state.accountsList?.map((option, k) => (
                                                    <DropdownItem key={k} onClick={(e) => this.handleAddressSwitch(option.address,k, e)}>{option.address.toLowerCase()}</DropdownItem>
                                                )) : null}
                                        </DropdownMenu>
                                    </UncontrolledDropdown> 
                                </>}
                            {/* <T>accounts.toLoginAs</T> <strong className="text-primary d-block">{this.state.address}</strong><T>accounts.pleaseAccept</T> */}
                        </TabPane>
                    </TabContent>
                    {this.state.loading?<Spinner type="grow" color="primary" />:''}
                    <p className="error-message">{this.state.errorMessage}</p>
                </ModalBody>
                <ModalFooter>
                    {this.getLoginButton()}
                    {this.getActionButton()}
                    <Button color="secondary" onClick={this.closeModal}><T>common.cancel</T></Button>
                </ModalFooter>
            </Modal>
        );
    }
}

export default LedgerModal;