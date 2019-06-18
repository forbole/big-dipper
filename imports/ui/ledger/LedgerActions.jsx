import Cosmos from "@lunie/cosmos-js"
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Button, Spinner, TabContent, TabPane, Row, Col, Modal, ModalHeader,
    Form, ModalBody, ModalFooter, InputGroup, InputGroupAddon, Input,
    UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem} from 'reactstrap';
import { Ledger } from './ledger.js';
import { Validators } from '/imports/api/validators/validators.js';
import AccountTooltip from '/imports/ui/components/AccountTooltip.jsx';

const maxHeightModifier = {
    setMaxHeight: {
        enabled: true,
        fn: (data) => {
            return {...data, styles: {...data.styles, 'overflowY': 'auto', maxHeight: '80vh'}};
        }
    }
}
const Types = {
    DELEGATE: 'delegate',
    REDELEGATE: 'redelegate',
    UNDELEGATE: 'undelegate',
    WITHDRAW: 'withdraw'
}

const TypeMeta = {
    [Types.DELEGATE]: {
        button: 'delegate',
        pathPreFix: 'staking/delegators',
        pathSuffix: 'delegations',
        warning: ''
    },
    [Types.REDELEGATE]: {
        button: 'redelegate',
        pathPreFix: 'staking/delegators',
        pathSuffix: 'redelegations',
        warning: 'You are only able to redelegate from Validator A → Validator B up to 7 times in a 21 day period.  '+
                 'Also, There is 21 day cooldown from serial redelegation;  '+
                 'Once you redelegate from Validator A → Validator B, '+
                 'you will not be able to redelegate from Validator B to another validator for the next 21 days.'
    },
    [Types.UNDELEGATE]: {
        button: 'undelegate',
        pathPreFix: 'staking/delegators',
        pathSuffix: 'unbonding_delegations',
        warning: 'There is a 21-day unbonding period.' // TODO: get number from /staking/parameters
    },
    [Types.WITHDRAW]: {
        button: 'withdraw',
        pathPreFix: 'distribution/delegators',
        pathSuffix: 'rewards',
        warning: '',
        gasAdjustment: '1.4'
    }
}

const isActiveValidator = (validator) => {
    return !validator.jailed && validator.status == 2;
}

class LedgerButton extends Component {
    constructor(props) {
       super(props);
        this.state = {
            activeTab: '2',
            errorMessage: '',
            user: localStorage.getItem(CURRENTUSERADDR)
        };
        this.ledger = new Ledger({testModeAllowed: false});
    }

    close = () => {
        this.setState({
            activeTab: '2',
            errorMessage: '',
            isOpen: false,
            actionType: undefined,
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

    initStateOnLoad = (action, state) => {
        this.setState({
            loading: true,
            [action]: true,
            ...state,
        })
    }

    setStateOnSuccess = (action, state) => {
        this.setState({
            loading: false,
            [action]: false,
            errorMessage: '',
            ...state,
        });
    }

    setStateOnError = (action, errorMsg, state={}) => {
        this.setState({
            loading: false,
            [action]: false,
            errorMessage: errorMsg,
            ...state,
        });
    }

    componentDidUpdate(prevProps, prevState) {
        if ((this.state.isOpen && !prevState.isOpen) || (this.state.user && this.state.user != prevState.user)) {
            if (!this.state.success)
                this.tryConnect();
            this.getBalance();
       }
    }

    getBalance = () => {
        if (this.state.loadingBalance)
            return

        this.initStateOnLoad('loadingBalance', {loading: this.state.actionType === Types.DELEGATE});
        try{
            Meteor.call('accounts.getAccountDetail', this.state.user, (error, result) => {
                if (result) {
                    let coin = result.coins?result.coins[0]:
                        { amount: 0, denom: Meteor.settings.public.stakingDenom }
                    this.setStateOnSuccess('loadingBalance', {
                        currentUser: {
                            accountNumber: result.account_number,
                            sequence: result.sequence,
                            availableAmount: parseFloat(coin.amount),
                            denom: coin.denom,
                            pubKey: result.public_key.value
                    }})
                }
                if (!result || error) {
                    this.setStateOnError(
                        'loadingBalance',
                        `Failed to get account info for ${this.state.user}`
                    )
                }
            })
        } catch (e) {
            this.setStateOnError('loadingBalance', e.message);
        }
    }

    tryConnect = () => {
        this.ledger.getCosmosAddress().then((res) => this.setState({
            success:true,
            activeTab: this.state.activeTab ==='1' ? '2': this.state.activeTab
        }), (err) => this.setState({
            success:false,
            activeTab: '1'
       }));
    }

    getTxContext = () => {
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

    createMessage = (callback) => {
        let txMsg
        switch (this.state.actionType) {
            case Types.DELEGATE:
                txMsg = Ledger.createDelegate(
                    this.getTxContext(),
                    this.props.validator.operator_address,
                    this.state.delegateAmount)
                break;
            case Types.REDELEGATE:
                txMsg = Ledger.createRedelegate(
                    this.getTxContext(),
                    this.props.validator.operator_address,
                    this.state.targetValidator.operator_address,
                    this.state.delegateAmount)
                break;
            case Types.UNDELEGATE:
                txMsg = Ledger.createUndelegate(
                    this.getTxContext(),
                    this.props.validator.operator_address,
                    this.state.delegateAmount);
                break;
        }
        let simulateBody = txMsg && txMsg.value && txMsg.value.msg && txMsg.value.msg.length &&
        txMsg.value.msg[0].value || {}
        callback(txMsg, simulateBody)
    }

    getPath = () => {
        let meta = TypeMeta[this.state.actionType];
        return `${meta.pathPreFix}/${this.state.user}/${meta.pathSuffix}`;
    }

    simulate = () => {
        if (this.state.simulating)
            return
        this.initStateOnLoad('simulating')
        try {
            this.createMessage(this.runSimulatation);
        } catch (e) {
            this.setStateOnError('simulating', e.message)
        }
    }

    runSimulatation = (txMsg, simulateBody) => {
        let gasAdjustment = TypeMeta[this.state.actionType].gasAdjustment || '1.2';
        Meteor.call('transaction.simulate', simulateBody, this.state.user, this.getPath(), gasAdjustment, (err, res) =>{
            if (res){
                Ledger.applyGas(txMsg, res);
                this.setStateOnSuccess('simulating', {
                    gasEstimate: res,
                    activeTab: '3',
                    txMsg: txMsg
                })
            }
            else {
                this.setStateOnError('simulating', 'something went wrong')
            }
        })
    }

    sign = () => {
        if (this.state.signing)
            return
        this.initStateOnLoad('signing')
        try {
            let txMsg = this.state.txMsg;
            const txContext = this.getTxContext();
            const bytesToSign = Ledger.getBytesToSign(txMsg, txContext);
            this.ledger.sign(bytesToSign).then((sig) => {
                Ledger.applySignature(txMsg, txContext, sig);
                Meteor.call('transaction.submit', txMsg, (err, res) => {
                    if (err) {
                        this.setStateOnError('signing', 'something went wrong')
                    } if (res) {
                        this.setStateOnSuccess('signing', {
                            txHash: res,
                            activeTab: '4'
                        })
                    }
                })
            })
        } catch (e) {
            this.setStateOnError('signing', e.message)
        }
    }

    handleInputChange = (e) => {
        this.setState({[e.target.name]: e.target.value})
    }

    handleTargetValidatorChange = (e) => {
        let dataset = e.currentTarget.dataset;
        this.setState({
            targetValidator: {
                moniker: dataset.moniker,
                operator_address: dataset.address
            }
        })
    }

    getActionButton = () => {
        if (this.state.activeTab === '1')
            return <Button color="primary"  onClick={this.tryConnect}>Continue</Button>
        if (this.state.activeTab === '2')
            return <Button color="primary"  disabled={this.state.simulating} onClick={this.simulate}>
                {(this.state.errorMessage !== '')?'Retry':'Next'}
            </Button>
        if (this.state.activeTab === '3')
            return <Button color="primary"  disabled={this.state.signing} onClick={this.sign}>
                {(this.state.errorMessage !== '')?'Retry':'Sign'}
            </Button>
    }

    openModal = (type) => {
        this.setState({
            actionType: type,
            isOpen: true
        })
    }

    getValidatorOptions = () => {
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
                    return <DropdownItem className='validator' key={validator.address} onClick={this.handleTargetValidatorChange} data-moniker={validator.description.moniker} data-address={validator.operator_address}>
                        <Row>
                            <div className='moniker'>{validator.description.moniker}</div>
                            <div className='address overflow-auto'>{validator.operator_address}</div>
                        </Row>
                    </DropdownItem>
                })}
            </DropdownMenu>
        </UncontrolledDropdown>
    }

    renderModal = () => {
        return  <Modal isOpen={this.state.isOpen}  className="ledger-modal">
            <ModalHeader>{this.props.title}</ModalHeader>
            <ModalBody>
                <TabContent className='ledger-modal-tab' activeTab={this.state.activeTab}>
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
                <Button color="secondary" disabled={this.state.signing} onClick={this.close}>Close</Button>
            </ModalFooter>
        </Modal>
    }
}

class DelegationButtons extends LedgerButton {
    getDelegatedToken = (currentDelegation) => {
        if (currentDelegation && currentDelegation.shares && currentDelegation.tokenPerShare) {
            return currentDelegation.shares * currentDelegation.tokenPerShare;
        }
        return null
    }

    renderActionTab = () => {
        let action;
        let target;
        let maxAmount;
        let availableStatement;
        let denom = this.state.currentUser?this.state.currentUser.denom:'';
        let moniker = this.props.validator.description && this.props.validator.description.moniker;
        let validatorAddress = <span className='ellipic'>this.props.validator.operator_address</span>;
        switch (this.state.actionType) {
            case Types.DELEGATE:
                action = 'Delegate to';
                maxAmount = this.state.currentUser?this.state.currentUser.availableAmount:null;
                availableStatement = `your available balance: ${maxAmount} ${denom}`
                break;
            case Types.REDELEGATE:
                action = 'Redelegate from';
                target = this.getValidatorOptions();
                maxAmount = this.getDelegatedToken(this.props.currentDelegation);
                availableStatement = `your delegated tokens: ${maxAmount} ${denom}`
                break;
            case Types.UNDELEGATE:
                action = 'Undelegate from';
                maxAmount = this.getDelegatedToken(this.props.currentDelegation);
                availableStatement = `your delegated tokens: ${maxAmount} ${denom}`
                break;

        }
        return <TabPane tabId="2">
            <h3>{action} {moniker?moniker:validatorAddress} {target?'to':''} {target}</h3>
            <InputGroup>
               <Input name="delegateAmount" onChange={this.handleInputChange} placeholder="Amount" min={0} max={maxAmount} type="number" step="1" />
               <InputGroupAddon addonType="append">{Meteor.settings.public.stakingDenom}</InputGroupAddon>
            </InputGroup>
            {availableStatement}
        </TabPane>
    }

    renderConfirmationTab = () => {
        let message;
        switch (this.state.actionType) {
            case Types.DELEGATE:
                message = <span>You are going to <span className='action'>delegate</span> <span className='amount'>{this.state.delegateAmount}</span> to <AccountTooltip address={this.props.validator.operator_address} sync/> with <span className='gas'>{this.state.gasEstimate}</span> as gas.</span>
                break;
            case Types.REDELEGATE:
                message = <span>You are going to <span className='action'>redelegate</span> <span className='amount'>{this.state.delegateAmount}</span> from <AccountTooltip address={this.props.validator.operator_address} sync/> to <AccountTooltip address={this.state.targetValidator && this.state.targetValidator.operator_address} sync/> with <span className='gas'>{this.state.gasEstimate}</span> as gas.</span>
                break;
            case Types.UNDELEGATE:
                message = <span>You are going to <span className='action'>undelegate</span> <span className='amount'>{this.state.delegateAmount}</span> from <AccountTooltip address={this.props.validator.operator_address} sync/> with <span className='gas'>{this.state.gasEstimate}</span> as gas.</span>
                break;
        }
        return <TabPane tabId="3">
            <div>{message}</div>
            <div>{this.state.actionType && TypeMeta[this.state.actionType].warning} </div>
            <div>If that's correct, please click next and sign in your ledger device.</div>
        </TabPane>
    }

    render = () => {
        return <span className="ledger-buttons-group float-right">
            {isActiveValidator(this.props.validator)?<Button color="success" size="sm" onClick={() => this.openModal(Types.DELEGATE)}> {TypeMeta[Types.DELEGATE].button} </Button>:null}
            {this.props.currentDelegation?<Button color="danger" size="sm" onClick={() => this.openModal(Types.REDELEGATE)}> {TypeMeta[Types.REDELEGATE].button} </Button>:null}
            {this.props.currentDelegation?<Button color="warning" size="sm" onClick={() => this.openModal(Types.UNDELEGATE)}> {TypeMeta[Types.UNDELEGATE].button} </Button>:null}
            {this.renderModal()}
        </span>;
    }
}

class WithdrawButton extends LedgerButton {

    createMessage = (callback) => {
        Meteor.call('transaction.execute', {from: this.state.user}, this.getPath(), (err, res) =>{
            if (res){
                res.value.msg.push({
                    type: 'cosmos-sdk/MsgWithdrawValidatorCommission',
                    value: { validator_address: this.props.address }
                })
                callback(res, res)
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

    renderActionTab = () => {
        let denom = this.state.currentUser?this.state.currentUser.denom:'';
        return <TabPane tabId="2">
            <h3>Withdraw rewards from all delegations</h3>
            <div>Your current rewards amount: <span className='amount'>{this.props.rewards}</span> {denom}</div>
            {this.props.commission?<div>Your current commission amount: <span className='amount'>{this.props.commission}</span> {denom}</div>:''}
        </TabPane>
    }

    renderConfirmationTab = () => {
        return <TabPane tabId="3">
            <div>You are going to withdraw rewards <span className='amount'>{this.props.rewards}</span>
                {this.props.commission?<span> and commission <span className='amount'>{this.props.commission}</span></span>:null}
                with  <span className='gas'>{this.state.gasEstimate}</span> as fee.</div>
            <div>{this.state.actionType && TypeMeta[this.state.actionType].warning} </div>
            <div>If that's correct, please click next and sign in your ledger device.</div>
        </TabPane>
    }
    render = () => {
        return <span className="ledger-buttons-group float-right">
            <Button color="success" size="sm" onClick={() => this.openModal(Types.WITHDRAW)}> {TypeMeta[Types.WITHDRAW].button} </Button>
            {this.renderModal()}
        </span>;
    }
}

export {
    DelegationButtons,
    WithdrawButton
}
