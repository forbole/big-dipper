import React, { Component, useState } from 'react';
import {
    Button, TabContent, TabPane, Modal, Form, ModalBody, ModalFooter, Input, Label, FormGroup, FormText,
} from 'reactstrap';
import i18n from 'meteor/universe:i18n';
import Coin from '/both/utils/coins.js';
import { Typeahead } from 'react-bootstrap-typeahead';
import incomingSwap from './incomingSwap.js';
import { ClaimSwapButton } from '/imports/ui/ledger/LedgerActions.jsx'

const T = i18n.createComponent();
const BINANCE_PREFIX = "tbnb"

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
            binanceSwapAmount: 0,
            binanceAddress: "",
            isOpen: false,
            invalid: true,
            multiple: false,
            selected: [],
            mnemonicsList: [],
            user: localStorage.getItem(CURRENTUSERADDR),
            currentActiveTab: '1',
            swapID: '',
            secretRandomNum: '',

        }

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);


    }


    componentDidMount() {
        fetch('/Mnemonics.txt')
            .then((r) => r.text())
            .then(text => {
                this.setState({
                    mnemonicsList: text.split('\n')
                })
            })

    }



    handleSubmit(event) {
        event.preventDefault();
        let data = new FormData(event.target);


    }

    startsWith = (str, prefix) => {
        return str.substr(0, prefix.length) === prefix
    }

    handleChange = (e) => {


        // get data from the form
        // check amount if emtpy, set state to true if empty, return
        // check address if empty, set state to true if empty, return
        // check every element in mnemnonic, set state to true if empty, return
        // otherwise, set state to false

        const swapForm = document.getElementById("swap-form")
        const formData = new FormData(swapForm);

        const getMnemonics = formData.getAll('binanceMnemonics[]')
        const getSwapAmount = formData.get('swapAmount')
        const getBinanceAddress = formData.get('binanceAddress')


        if (getSwapAmount === "" || getSwapAmount <= 0) {
            this.setState({
                invalid: true,
            });
            return;
        }

        if (getBinanceAddress.length != 43 || !(this.startsWith(getBinanceAddress, BINANCE_PREFIX))) {
            this.setState({
                invalid: true,
            });
            return;
        }


        getMnemonics.forEach((value, key) => {

            //mnemonic[key] = value.join(' ')

            if (getMnemonics[key] === "" || getMnemonics[key].length <= 0) {
                this.setState({
                    invalid: true,
                });
                return;
            }
            else {
                this.setState({
                    invalid: false,
                }, () => {
                    this.setState({
                        binanceMnemonics: getMnemonics.join(' '),
                        binanceSwapAmount: getSwapAmount,
                        binanceAddress: getBinanceAddress,
                    })
                });

            }
        })


    }

    updateState() {
        this.setState({
            binanceMnemonics: getMnemonics,
            binanceSwapAmount: getSwapAmount,
            binanceAddress: getBinanceAddress,
        })
    }



    SetSelected = (e) => {
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
            binanceMnemonics: [],
            binanceSwapAmount: 0,
            binanceAddress: "",
        });
    }

    openModal = () => {
        this.setState({
            isOpen: true,

        })
    }

    getSwap = async () => {

        try {
            let getSwap = await incomingSwap(this.state.binanceAddress, this.state.binanceMnemonics, this.state.user, this.state.binanceSwapAmount)

            if (getSwap) {
                this.setState({
                    swapID: getSwap.swapID.toUpperCase(),
                    secretRandomNum: getSwap.secretRandomNum.toUpperCase(),
                    currentActiveTab: '2',
                })
            }
        }
        catch (e) {
            this.setState({
                errorMessage: e,
            })
        }



    }



    createSwap = () => {
        //Create 24 mnemonics input fields
        const mnemonicsCount = new Array(24)
        for (let c = 0; c < mnemonicsCount.length; c++) {

            mnemonicsCount[c] = c + 1;
        }


        return <Modal isOpen={this.state.isOpen} toggle={this.close}>
            <Form id="swap-form" onSubmit={this.handleSubmit}>
                <ModalBody>
                    <TabContent activeTab={this.state.currentActiveTab}>
                        <TabPane tabId="1">
                            <h3>Create Swap from <img src="/img/bnb-symbol.svg" className="bnb-img" />  Binance  </h3>
                            <FormGroup>
                                <Label for="swapAmount"><T>bep3.swap.amount</T></Label>
                                <Input placeholder="Swap Amount" name="swapAmount" type="number" id="swapAmount" onChange={this.handleChange}

                                />
                                <FormText><T>bep3.swap.amountKava</T></FormText>
                            </FormGroup>
                            <FormGroup>
                                <Label for="binanceAddress"><T>bep3.swap.binanceAddress</T></Label>
                                <Input name="binanceAddress" onChange={this.handleChange}
                                    placeholder="Binance Address" type="text" />
                                <FormText><T>bep3.swap.enterAddress</T></FormText>
                            </FormGroup>
                            <FormGroup  >


                                <Label for="binanceMnemonics" className="d-block"><T>bep3.swap.binanceMnemonics</T></Label>
                                {
                                    mnemonicsCount.map((val, index) => {
                                        return <FormGroup className={"form-control d-inline"} key={index} >
                                            <Label for={`mnemonics${val}`} className="mnemonics-number">{val}</Label>
                                            {/* <Typeahead
                                                labelKey="name"
                                                options={this.state.mnemonicsList}
                                                className="mnemonics-field py-n1 no-gutters"
                                                id={`mnemonics-${val}`}
                                                placeholder={`Phrase ${val}`}
                                                type="text"
                                                onInputChange={this.handleChange}
                                                minLength={3}
                                                inputProps={{ name: 'binanceMnemonics[]' }}

                                            /> */}

                                            <Input
                                                name='binanceMnemonics[]'
                                                className="mnemonics-field py-n1 no-gutters"
                                                id={`mnemonics-${val}`}
                                                placeholder={`Phrase ${val}`}
                                                type="text"
                                                onChange={this.handleChange}
                                            />

                                        </FormGroup>

                                    })}


                                <span>
                                    <FormText color="danger" className="pt-2"><T>bep3.swap.enterMnemonics</T></FormText>
                                </span>
                            </FormGroup>
                            <FormGroup className="pb-5 mb-3" >
                                <Button color="secondary" className="float-right ml-2" onClick={this.close}>Close</Button>
                                <Button type="submit" color="primary" className="float-right" disabled={this.state.invalid} onClick={this.getSwap} >
                                    Next
                                </Button>
                            </FormGroup>
                        </TabPane>
                        <TabPane tabId="2">
                            <span>The swap has been <span className='action'>successful!</span> Please claim your BNB for address <b>{this.state.user} </b> using the button below</span>
                            <div></div>
                            <ClaimSwapButton swapID={this.state.swapID} secretNum={this.state.secretRandomNum} />
                            <div></div>
                        </TabPane>
                    </TabContent>
                </ModalBody>
            </Form>
        </Modal>
    }

    render = () => {

        return <span className="ledger-buttons-swap button float-right">
            <Button color="danger" size="sm" onClick={() => this.openModal()}> Create Swap </Button>
            {this.createSwap()}
        </span>;
    }
}


// CreateSwapButton.propTypes = {
//     
// }
