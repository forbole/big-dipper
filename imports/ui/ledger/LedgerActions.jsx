import Cosmos from "@lunie/cosmos-js"
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Button, Spinner, TabContent, TabPane, Row, Col, Modal, ModalHeader,
    Form, ModalBody, ModalFooter, InputGroup, InputGroupAddon, Input,
    UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem} from 'reactstrap';
import { Ledger } from './ledger.js';
import { Validators } from '/imports/api/validators/validators.js';

const maxHeightModifier = {
    setMaxHeight: {
        enabled: true,
        fn: (data) => {
            return {...data, styles: {...data.styles, 'overflow-y': 'auto', maxHeight: '80vh'}};
        }
    }
}
const Types = {
    DELEGATE: 'delegate',
    REDELEGATE: 'redelegate',
    UNDELEGATE: 'undelegate'
}

const TypeMeta = {
    [Types.DELEGATE]: {
        button: 'delegate',
        path: 'delegations',
        warning: ''
    },
    [Types.REDELEGATE]: {
        button: 'redelegate',
        path: 'redelegations',
        warning: 'You are only able to redelegate from Validator A → Validator B up to 7 times in a 21 day period.  '+
                 'Also, There is 21 day cooldown from serial redelegation;  '+
                 'Once you redelegate from Validator A → Validator B, '+
                 'you will not be able to redelegate from Validator B to another validator for the next 21 days.'
    },
    [Types.UNDELEGATE]: {
        button: 'undelegate',
        path: 'unbonding_delegations',
        warning: 'There is a 21-day unbonding period.' // TODO: get number from /staking/parameters
    }
}

export class LedgerButtons extends Component {
    constructor(props) {
       super(props);
        this.state = {
            activeTab: '2',
            errorMessage: '',
            user: localStorage.getItem(CURRENTUSERADDR)
        };
        this.ledger = new Ledger({testModeAllowed: false});
    }

    close() {
        this.setState({
            activeTab: '2',
            errorMessage: '',
            isOpen: false,
            stakingType: undefined,
            loading: undefined,
            loadingBalance: undefined,
            currentUser: undefined,
            delegateAmount: undefined,
            success: undefined,
            targetValidator: undefined,
            simulating: undefined,
            gasEstimate: undefined,
            txMsg: undefined,
        });
    }
    static getDerivedStateFromProps(props, state) {
        if (state.user !== localStorage.getItem(CURRENTUSERADDR)) {
            return {user: localStorage.getItem(CURRENTUSERADDR)};
        }
        return null;
    }

    componentDidUpdate(prevProps, prevState) {
        if ((this.state.isOpen && !prevState.isOpen) || (this.state.user && this.state.user != prevState.user)) {
            if (!this.state.success)
                this.tryConnect();
            this.getBalance();
       }
    }

    getBalance() {
        if (this.state.loadingBalance)
            return
        this.setState({loading: this.state.stakingType === Types.DELEGATE, loadingBalance: true});
        Meteor.call('accounts.getAccountDetail', this.state.user, (error, result) => {
            if(result) {
                let baseAccount = result.BaseVestingAccount.BaseAccount;
                let coin = baseAccount.coins[0]
                this.setState({
                    loading:false,
                    loadingBalance: false,
                    currentUser: {
                        accountNumber: baseAccount.account_number,
                        sequence: baseAccount.sequence,
                        availableAmount:parseFloat(coin.amount),
                        denom: coin.denom,
                        pubKey: baseAccount.public_key.value
                }})
            }
        })
    }

    tryConnect() {
        this.ledger.getCosmosAddress().then((res) => this.setState({
            success:true,
        }), (err) => this.setState({
            success:false,
            activeTab: '1'
       }));
    }

    getTxContext() {
        return {
            chainId: Meteor.settings.public.chainId,
            bech32: this.state.user,
            accountNumber: this.state.currentUser.accountNumber,
            sequence: this.state.currentUser.sequence,
            denom: Meteor.settings.public.stakingDenom,
            pk: this.state.currentUser.pubKey,
            path: [44, 118, 0, 0, 0],
        }
    }

    createMessage() {
        switch (this.state.stakingType) {
            case Types.DELEGATE:
                return Ledger.createDelegate(
                    this.getTxContext(),
                    this.props.validator.operator_address,
                    this.state.delegateAmount)
                break;
            case Types.REDELEGATE:
                return Ledger.createRedelegate(
                    this.getTxContext(),
                    this.props.validator.operator_address,
                    this.state.targetValidator.operator_address,
                    this.state.delegateAmount)
                break;
            case Types.UNDELEGATE:
                return Ledger.createUndelegate(
                    this.getTxContext(),
                    this.props.validator.operator_address,
                    this.state.delegateAmount);
                break;
        }
    }

    simulate() {
        if (this.state.simulating)
            return
        this.setState({loading: true, simulating: true, errorMessage: ''})
        let txMsg = this.createMessage();

        Meteor.call('staking.simulate', txMsg, TypeMeta[this.state.stakingType].path, (err, res) =>{
            if (res){
                Ledger.applyGas(txMsg, res);
                this.setState({
                    gasEstimate: res,
                    activeTab: '3',
                    loading: false,
                    simulating: false,
                    txMsg: txMsg
                })

            }
            else {
                this.setState({
                    loading: false,
                    simulating: false,
                    errorMessage: 'something went wrong'
                })
            }
        })
    }

    sign() {
        if (this.state.signing)
            return
        this.setState({loading: true, signing: true, errorMessage: ''})
        let txMsg = this.state.txMsg;
        const txContext = this.getTxContext();
        const bytesToSign = Ledger.getBytesToSign(txMsg, txContext);
        this.ledger.sign(bytesToSign).then((sig) => {
            Ledger.applySignature(txMsg, txContext, sig);
            Meteor.call('transaction.submit', txMsg, (err, res) => {
                if (err) {
                    this.setState({
                        loading: false,
                        signing: false,
                        errorMessage: 'something went wrong'
                    })
                } if (res) {
                    this.setState({
                        loading: false,
                        signing: false,
                        txHash: res,
                        activeTab: '4'
                    })
                }
            })
        })
    }

    handleInputChange(e) {
        this.setState({[e.target.name]: e.target.value})
    }

    handleTargetValidatorChange(e) {
        let dataset = e.currentTarget.dataset;
        this.setState({
            targetValidator: {
                moniker: dataset.moniker,
                operator_address: dataset.address
            }
        })
    }

    getActionButton() {
        if (this.state.activeTab === '1')
            return <Button color="primary"  onClick={this.tryConnect.bind(this)}>Continue</Button>
        if (this.state.activeTab === '2')
            return <Button color="primary"  disabled={this.state.simulating} onClick={this.simulate.bind(this)}>
                {(this.state.errorMessage !== '')?'Retry':'Next'}
            </Button>
        if (this.state.activeTab === '3')
            return <Button color="primary"  disabled={this.state.signing} onClick={this.sign.bind(this)}>
                {(this.state.errorMessage !== '')?'Retry':'Sign'}
            </Button>
    }

    openModal(type) {
        this.setState({
            stakingType: type,
            isOpen: true
        })
    }

    getValidatorOptions() {
        let activeValidators = Validators.find(
            {"jailed": false, "status": 2},
            {"sort":{"description.moniker":1}}
        );

        return <UncontrolledDropdown direction='down' size='sm' className='redelegate-validators'>
            <DropdownToggle caret={true}>
                {this.state.targetValidator?this.state.targetValidator.moniker:'Select a Validator'}
            </DropdownToggle>
            <DropdownMenu modifiers={maxHeightModifier}>
                {activeValidators.map((validator) => {
                    if (validator.address!=this.props.validator.address)
                    return <DropdownItem className='validator' key={validator.address} onClick={this.handleTargetValidatorChange.bind(this)} data-moniker={validator.description.moniker} data-address={validator.operator_address}>
                        <Row>
                            <Col xs={5} className='moniker ellipsis'>{validator.description.moniker}</Col>
                            <Col xs={7} className='address ellipsis'>{validator.operator_address}</Col>
                        </Row>
                    </DropdownItem>
                })}
            </DropdownMenu>
        </UncontrolledDropdown>
    }

    renderActionTab() {
        let action;
        let target;
        let maxAmount;
        let availableStatement;
        let denom = this.state.currentUser?this.state.currentUser.denom:'';
        let moniker = this.props.validator.description && this.props.validator.description.moniker;
        let validatorAddress = <span className='ellipic'>this.props.validator.operator_address</span>;
        switch (this.state.stakingType) {
            case Types.DELEGATE:
                action = 'Delegate to';
                maxAmount = this.state.currentUser?this.state.currentUser.availableAmount:null;
                availableStatement = `your available balance: ${maxAmount} ${denom}`
                break;
            case Types.REDELEGATE:
                action = 'Redelegate from';
                target = this.getValidatorOptions();
                maxAmount = this.props.currentDelegation?this.props.currentDelegation.shares:null;
                availableStatement = `your delegated shares: ${maxAmount} ${denom}`
                break;
            case Types.UNDELEGATE:
                action = 'Undelegate from';
                maxAmount = this.props.currentDelegation?this.props.currentDelegation.shares:null;
                availableStatement = `your delegated shares: ${maxAmount} ${denom}`
                break;

        }
        return <TabPane tabId="2">
            {action} {moniker?moniker:validatorAddress} {target?'to':''} {target}
            <InputGroup>
               <Input name="delegateAmount" onChange={this.handleInputChange.bind(this)} placeholder="Amount" min={0} max={maxAmount} type="number" step="1" />
               <InputGroupAddon addonType="append">{Meteor.settings.public.stakingDenom}</InputGroupAddon>
            </InputGroup>
            {availableStatement}
        </TabPane>
    }
    renderConfirmationTab() {
        let message;
        switch (this.state.stakingType) {
            case Types.DELEGATE:
                message = `You are going to delegate ${this.state.delegateAmount} to ${this.props.validator.operator_address} with ${this.state.gasEstimate} as fee.`
                break;
            case Types.REDELEGATE:
                message = `You are going to redelegate ${this.state.delegateAmount} from ${this.props.validator.operator_address} to ${this.state.targetValidator && this.state.targetValidator.operator_address} with ${this.state.gasEstimate} as fee.`
                break;
            case Types.UNDELEGATE:
                message = `You are going to undelegate ${this.state.delegateAmount} from ${this.props.validator.operator_address} with ${this.state.gasEstimate} as fee.`
                break;
        }
        return <TabPane tabId="3">
            <div>{message}</div>
            <div>{this.state.stakingType && TypeMeta[this.state.stakingType].warning} </div>
            <div>If that's correct, please click next and sign in your ledger device.</div>
        </TabPane>
    }

    render() {
        return <span className="ledger-buttons-group float-right">
            <Button color="success" size="sm" onClick={() => this.openModal(Types.DELEGATE)}> {TypeMeta[Types.DELEGATE].button} </Button>
            {this.props.currentDelegation?<Button color="danger" size="sm" onClick={() => this.openModal(Types.REDELEGATE)}> {TypeMeta[Types.REDELEGATE].button} </Button>:''}
            {this.props.currentDelegation?<Button color="warning" size="sm" onClick={() => this.openModal(Types.UNDELEGATE)}> {TypeMeta[Types.UNDELEGATE].button} </Button>:''}
            <Modal isOpen={this.state.isOpen}>
                <ModalHeader>{this.props.title}</ModalHeader>
                <ModalBody>
                    <TabContent activeTab={this.state.activeTab}>
                        <TabPane tabId="1">
                            Please connect your Ledger device and open Cosmos App.
                        </TabPane>
                        {this.renderActionTab()}
                        {this.renderConfirmationTab()}
                        <TabPane tabId="4">
                            <div>Transaction is broadcasted.  Verify it at
                                <Link to={`/transactions/${this.state.txHash}?new`}> transaction page. </Link>
                            </div>
                            <div>See your activities at <Link to={`/account/${this.state.user}`}>your account page</Link>.</div>
                        </TabPane>
                    </TabContent>
                    {this.state.loading?<Spinner type="grow" color="primary" />:''}
                    <p className="error-message">{this.state.errorMessage}</p>
                </ModalBody>
                <ModalFooter>
                    {this.getActionButton()}
                   <Button color="secondary" disabled={this.state.signing} onClick={this.close.bind(this)}>Close</Button>
                </ModalFooter>
            </Modal>
        </span>;
    }
}