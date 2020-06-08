import React, { Component } from 'react';
import {
    Button, TabContent, TabPane, Modal, Form, ModalBody, ModalFooter, Input, Label, FormGroup, FormText
} from 'reactstrap';
import i18n from 'meteor/universe:i18n';
import Coin from '/both/utils/coins.js';


const T = i18n.createComponent();



export default class CreateSwapButton extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ratio: 0,
            collateral: 0,
            swapAmount: 0,
            binanceAddress: '',
            maxAmount: props.bnbTotalValue / Meteor.settings.public.coins[1].fraction,
            denom: props.denom,
            binanceMnemonics: [],
            isOpen: false,
        }

        this.handleInputChange = this.handleInputChange.bind(this)
        // this.handleChange = this.handleChange.bind(this);
        // this.handleSubmit = this.handleSubmit.bind(this);
    }


    handleInputChange(event) {
        console.log(event)
        let binanceMnemonics = this.state.binanceMnemonics;
        for (let i in binanceMnemonics) {
            binanceMnemonics[i].value = event.target.value;
            this.setState({ binanceMnemonics });
            break;
        }
    }
    // handleChanges(event) {
    //     let target = event.target.value;

    //     this.setState({ binanceMnemonics: event.target.value });
    // }

    // handleSubmit(event) {
    //     alert('A name was submitted: ' + this.state.binanceMnemonics);
    //     event.preventDefault();
    // }


    handleChange = (e) => {
        console.log(e)
        const { target } = e;
        const value = target.value;
        const { name } = target;
        this.setState({
            [name]: value,
        });
    }

    close = () => {
        this.setState({
            isOpen: false,
        });
    }

    openModal = () => {
        this.setState({
            isOpen: true,

        })
    }

    createSwap = () => {
        //Create 24 mnemonics input fields
        const mnemonicsCount = new Array(25)
        for (let c = 1; c < mnemonicsCount.length; c++) {
            mnemonicsCount[c] = c;
        }
        return <Modal isOpen={this.state.isOpen} toggle={this.close} className="ledger-modal">
            <ModalBody>
                <TabContent className='ledger-modal-tab' activeTab={this.state.activeTab}>
                    <TabPane>
                        <h3>Create Swap from <span className="bnb-img bnb" />  Binance  </h3>
                        <FormGroup>
                            <Label for="swapAmount"><T>bep3.swap.amount</T></Label>
                            <Input placeholder="Swap Amount" name="swapAmount" value={this.state.swapAmount} type="number" onChange={this.handleChange}
                                min={Coin.MinStake}
                                invalid={this.state.swapAmount === null} />
                            <FormText><T>bep3.swap.amountKava</T></FormText>
                        </FormGroup>
                        <FormGroup>
                            <Label for="binanceAddress"><T>bep3.swap.binanceAddress</T></Label>
                            <Input name="binanceAddress" onChange={this.handleChange}
                                placeholder="Binance Address" type="text" value={this.state.binanceAddress}
                                invalid={this.state.binanceAddress === null} />
                            <FormText><T>bep3.swap.enterAddress</T></FormText>
                        </FormGroup>
                        <FormGroup >
                            <Label for="binanceMnemonics"><T>bep3.swap.binanceMnemonics</T></Label>
                            <Form inline >
                                {
                                    mnemonicsCount.map((val, index) => {
                                        return <FormGroup className={"mr-sm-3 mb-sm-0"} key={index} >
                                            <Label for={`mnemonics${val}`} className="mnemonics-number">{val}</Label>

                                            <Input className="mnemonics-field" type="hash" name={`binanceMnemonics-${val}`} id={`mnemonics-${val}`} placeholder={`Phrase ${val}`} value={this.state.binanceMnemonics}
                                                onChange={this.handleInputChange} />

                                        </FormGroup>

                                    })}



                            </Form>
                            <FormText color="danger"><T>bep3.swap.enterMnemonics</T></FormText>
                        </FormGroup>
                    </TabPane>
                </TabContent>
            </ModalBody>
            <ModalFooter>
                <Button color="primary" className="float-right" disabled={!this.state.swapAmount || !this.state.binanceAddress || !this.state.binanceMnemonics} >
                    Next
                </Button>
                <Button color="secondary" onClick={this.close}>Close</Button>
            </ModalFooter>
        </Modal>
    }

    render = () => {
        return <span className="ledger-buttons-create-cdp button float-right">
            <Button color="danger" size="sm" onClick={() => this.openModal()}> Create Swap </Button>
            {this.createSwap()}
        </span>;
    }
}

// CreateSwapButton.propTypes = {
//     
// }
