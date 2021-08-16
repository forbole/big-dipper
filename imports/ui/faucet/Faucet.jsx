import React, { Component } from 'react';
import { Input } from 'reactstrap';
import { Helmet } from 'react-helmet';
import i18n from 'meteor/universe:i18n';
import FaucetModal from './FaucetModal';
import BigNumber from 'bignumber.js';
import { Meteor } from 'meteor/meteor';
import { TRANSACTION_STATUS_DONE_ERROR, TRANSACTION_STATUS_DONE_ERROR_WRONG_CAPTCHA, TRANSACTION_STATUS_DONE_OK, TRANSACTION_STATUS_PENDING } from './FaucetUtils';

import CaptchaWrapper from '../components/CaptchaWrapper';

const T = i18n.createComponent();
export default class Faucet extends Component {

    constructor(props) {
        super(props);

        this.nodes = {
            'captcha': React.createRef(),
        };

        this.state = {
            walletAddress: '',
            amount: '',
            valid: false,
            modalOpen: false,
            transactionStatus: TRANSACTION_STATUS_PENDING,
            isCaptchaFilled: false,
        }
    }

    validate = () => {
        this.setState({
            valid: this.state.valid = this.state.amount !== '' && this.state.walletAddress.startsWith(Meteor.settings.public.bech32PrefixAccAddr) && this.state.isCaptchaFilled,
        });
    }

    onChangeWalletAddress = (e) => {
        this.setState({
            walletAddress: e.target.value
        }, this.validate);
    }

    onChangeAmount = (e) => {
        if (e.target.value !== '' && Number.isNaN(parseFloat(e.target.value)) === true) {
            return;
        }

        this.setState({
            amount: e.target.value
        }, this.validate);
    }

    onChangeCaptchaStatus = (status) => {
        this.setState({
            isCaptchaFilled: status
        }, this.validate);
    }

    onClickSend = async () => {
        if (this.state.valid !== true) {
            return;
        }

        let captchaResponse = await this.nodes.captcha.current.execute();
        if (captchaResponse === null) {
            return;
        }

        this.setState({
            modalOpen: true,
            transactionStatus: TRANSACTION_STATUS_PENDING,
        });

        const address = this.state.walletAddress;
        const amount = (new BigNumber(this.state.amount)).multipliedBy(Meteor.settings.public.coins[0].fraction)
        // const amount = parseInt(parseFloat(this.state.amount * Meteor.settings.public.coins[4].fraction))
        const data = {
            address: address,
            coins: [`${amount}${Meteor.settings.public.coins[0].denom}`],
            captchaResponse
        };

        HTTP.post(Meteor.settings.public.faucetUrl, {
            data
        }, (err, result) => {
            if (err !== null || result.statusCode !== 200) {
                this.nodes.captcha.current.reset();
                if(result.statusCode === 401){
                    console.error("WRONG CAPTCHA");
                    this.setState({
                        transactionStatus: TRANSACTION_STATUS_DONE_ERROR_WRONG_CAPTCHA,
                    });
                    return;
                }

                console.error(err, result);
                this.setState({
                    transactionStatus: TRANSACTION_STATUS_DONE_ERROR,
                });
                return;
            }

            result = JSON.parse(result.content);
            if (result.transfers[0].status !== 'ok') {
                console.error(result);
                this.setState({
                    transactionStatus: TRANSACTION_STATUS_DONE_ERROR,
                });
                return;
            }

            this.setState({
                transactionStatus: TRANSACTION_STATUS_DONE_OK,
            });
        });
    }

    handleModalClose = () => {
        if (this.state.transactionStatus === TRANSACTION_STATUS_DONE_OK) {
            this.setState({
                walletAddress: '',
                amount: '',
                valid: false,
                modalOpen: false,
                transactionStatus: TRANSACTION_STATUS_PENDING,
            });
        } else {
            this.setState({
                modalOpen: false,
            });
        }
        
    }

    render() {
        return (
            <div>
                <Helmet>
                    <title>Faucet | CUDOS</title>
                    <meta name="description" content="Faucet for cudos testnet" />
                </Helmet>
                <div className="container-md">
                    <h1 className="text-center mt-5"><T>faucet.title</T></h1>
                    <Input value={this.state.walletAddress} onChange={this.onChangeWalletAddress} placeholder={i18n.__('faucet.placeHolderWalletAddress').replace('%s', Meteor.settings.public.bech32PrefixAccAddr)}/>
                    <br />
                    <Input value={this.state.amount} onChange={this.onChangeAmount} placeholder={i18n.__('faucet.placeHolderAmount').replace('%s', Meteor.settings.public.coins[1].displayName)}/>
                    <br />
                    <CaptchaWrapper ref={ this.nodes.captcha } onChangeStatus={this.onChangeCaptchaStatus} className="d-flex justify-content-center" />
                    <div className="d-flex justify-content-center mt-5">
                        <button type="button" className={ `btn btn-primary ${this.state.valid === false ? 'disabled' : ''}` } onClick={ this.onClickSend }>{i18n.__('faucet.send').replace('%s', Meteor.settings.public.coins[0].displayName)}</button>
                    </div>
                </div>
                <FaucetModal
                    isOpen={ this.state.modalOpen }
                    transactionStatus={ this.state.transactionStatus }
                    handleClose={ this.handleModalClose } />
            </div>
        )
    }

}