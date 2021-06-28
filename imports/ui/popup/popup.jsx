import React, { Component } from 'react';
import { Button, Spinner, TabContent, TabPane, Row, Col, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import i18n from 'meteor/universe:i18n';
import Loader from '../../../both/utils/loader';

const T = i18n.createComponent();

class PopupModal extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            loading: false,
            activeTab: '1', 
            addressHasBeenSelected: false,
            accountIndexStart: 0,
            accountIndexEnd: 10
        }; 
    }  

    connectionSelection = async (e) => {
        e.persist();
        
    }
  
    okModal = (success) => {
        this.props.handleLoginConfirmed(true) 
        this.props.toggle(false)
    }

    cancelModal = (success) => { 
        this.props.handleLoginConfirmed(false)
        this.props.toggle(false)
    }

    render() {
        return (
            <Modal isOpen={this.props.isOpen} toggle={this.cancelModal} className="ledger-sign-in">
                <ModalHeader><T>recipes.purchase_message</T></ModalHeader>
                 
                <ModalFooter> 
                    <Button color="secondary" style={{width:'80px'}} onClick={this.okModal}><T>common.ok</T></Button>
                    <Button color="secondary" style={{width:'80px'}} onClick={this.cancelModal}><T>common.cancel</T></Button>
                </ModalFooter>
            </Modal>
        );
    }
}

export default PopupModal;