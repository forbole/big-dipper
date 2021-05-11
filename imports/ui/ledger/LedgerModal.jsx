import React, { Component } from 'react';
import { Button, Spinner, TabContent, TabPane, Row, Col, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { Ledger } from './ledger.js';
import i18n from 'meteor/universe:i18n';
import Loader from '../../../both/utils/loader';

const T = i18n.createComponent();

class LedgerModal extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            loading: false,
            activeTab: '1',
            transportBLE: localStorage.getItem(BLELEDGERCONNECTION) ?? false,
            addressHasBeenSelected: false,
            accountIndexStart: 0,
            accountIndexEnd: 10
        };
        this.ledger = new Ledger({ testModeAllowed: false });
    }

    autoOpenModal = () => {
        if (!this.props.isOpen && this.props.handleLoginConfirmed) {
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
        if(this.state.accountIndexEnd != prevState.accountIndexEnd){
            this.generateLedgerAddresses()
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
                        activeTab: '2',
                        addressHasBeenSelected: false
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
            this.generateLedgerAddresses();
            this.setState({
                errorMessage: '',
                loading: false,
                activeTab: '2'
            });
        }
    }

    handleAddressSwitch = (e, addressIndex, ledgerAddress) => {
        e.persist();
        localStorage.setItem(ADDRESSINDEX, addressIndex)
        this.setState({
            currentUserAddress: ledgerAddress,
            accountIndex: addressIndex,
            addressHasBeenSelected: true
        })
    }

    loadNextAddresses = (e) => {
        this.setState({
            accountIndexStart: this.state.accountIndexEnd,
            accountIndexEnd: this.state.accountIndexEnd + 10
        })
    }

    loadPreviousAddresses = (e) => {
        this.setState({
            accountIndexStart: this.state.accountIndexStart - 10,
            accountIndexEnd: this.state.accountIndexEnd - 10
        })
    }

    async generateLedgerAddresses() {
        this.setState({ loadingAddressList: true })
        let accounts = [];
        for (let c = this.state.accountIndexStart; c < this.state.accountIndexEnd; c++){
            // eslint-disable-next-line no-await-in-loop
            accounts[c] = await this.ledger.getLedgerAddresses(c, this.state.transportBLE)
        }
        if (accounts.length === this.state.accountIndexEnd){
            this.setState({ loadingAddressList: false, accountsList: accounts, addressesLoaded: true })
        }
        return accounts
    }



    trySignIn = () => {
        this.setState({ loading: true, errorMessage: '' })
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
            return <Button color="primary" onClick={this.tryConnect} disabled={!this.state.addressHasBeenSelected}><T>common.signIn</T></Button>
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
                                <Button color="secondary" value="usb" onClick={this.connectionSelection} className="mt-3 mr-4 btn-ledger-login"><span><img src="/img/usb.svg" alt="USB" style={{height: "25px"}}/><T>USB</T></span></Button>
                                <Button color="secondary" value="bluetooth" onClick={this.connectionSelection} className="mt-3 btn-ledger-login"><span><img src="/img/bluetooth.svg" alt="Bluetooth" style={{ height: "25px" }} /><T>Bluetooth</T></span></Button>
                            </div>
                            <h6 className="error-message text-center mt-3"><T>accounts.BLESupport</T></h6>
                        </TabPane>
                        <TabPane tabId="2">
                            {this.state.currentUser?<span>You are currently logged in as <strong className="text-primary d-block">{this.state.currentUser}.</strong></span>:null}
                            {this.state.loadingAddressList ? <div className="d-flex justify-content-center"><div> <h4 className="text-primary"> <T>common.generatingAddresses</T></h4></div> <div className="ledger-loader"> <Loader /></div> </div>:
                                <>
                                    <span className="text-primary text-center mb-1 d-block"> <T>common.selectAddress</T> </span>
                                    {!this.state.loadingAddressList ? <h6 className="mt-1 mb-3 text-center"><T>common.defaultAddressMessage</T></h6> : null}
                                    {this.state.accountsList?.map((option, k) => (
                                        <div className={k > 0 ? "mb-2 pt-2 border-top ledger-address-list" : "mb-2 ledger-address-list"} key={k}><input type="radio" name="ledger-address-selection" className="ml-1 mr-1 mt-1" onChange={(e) => this.handleAddressSwitch(e, k, option.address.toLowerCase())} /> <span className="font-weight-bold mr-1">{`${k}.`}</span><span className="overflow-auto">{`${option.address.toLowerCase()}`} </span></div>
                                    ))}
                                    <div className="text-center mt-3"> 
                                        {this.state.accountIndexStart != 0 ? 
                                            <Button outline color="danger" size="md" onClick={this.loadPreviousAddresses} className="mr-4 text-capitalize"><T>common.back</T></Button> : null }
                                        {this.state.accountIndexEnd <= 99 ? <Button outline color="danger" size="md" onClick={this.loadNextAddresses} className="text-capitalize"><T>common.next</T></Button> : null }</div>
                                </>}
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