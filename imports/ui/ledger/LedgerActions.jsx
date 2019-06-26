import qs from 'querystring';
import Cosmos from "@lunie/cosmos-js"
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Button, Spinner, TabContent, TabPane, Row, Col, Modal, ModalHeader,
    Form, ModalBody, ModalFooter, InputGroup, InputGroupAddon, Input,
    UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem} from 'reactstrap';
import { Ledger } from './ledger.js';
import { Validators } from '/imports/api/validators/validators.js';
import AccountTooltip from '/imports/ui/components/AccountTooltip.jsx';
import Coin from '/both/utils/coins.js';

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
    WITHDRAW: 'withdraw',
    SEND: 'send'
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
    },
    [Types.SEND]: {
        button: 'send',
        pathPreFix: 'bank/accounts',
        pathSuffix: 'transfers',
        warning: ''
    }
}

const Amount = (props) => {
    if (!props.coin && !props.amount) return null
    let coin = props.coin || new Coin(props.amount);
    let amount = (props.mint)?coin.amount:coin.stakingAmount;
    let denom = (props.mint)?Coin.MintingDenom:Coin.StakingDenom;
    return <span><span className='amount'>{amount}</span> <span className='denom'>{denom}</span></span>
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
            transferTarget: undefined,
            transferAmount: undefined,
            success: undefined,
            targetValidator: undefined,
            simulating: undefined,
            gasEstimate: undefined,
            txMsg: undefined,
            params: undefined
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

        this.autoOpenModal();
        if ((this.state.isOpen && !prevState.isOpen) || (this.state.user && this.state.user != prevState.user)) {
            if (!this.state.success)
                this.tryConnect();
            this.getBalance();
       }
    }

    componentDidMount() {
        this.autoOpenModal()
    }

    autoOpenModal = () => {
        let query = this.props.history.location.search.substr(1)
        if (query && !this.state.isOpen) {
            let params = qs.parse(query)
            if (params.signin == undefined && params.action && this.supportAction(params.action)) {
                this.props.history.push(this.props.history.location.pathname)
                this.openModal(params.action, this.filterParams(params))
            }
        }
    }

    supportAction() {
        return false
    }

    filterParams() {
        return {}
    }

    getBalance = () => {
        if (this.state.loadingBalance) return

        this.initStateOnLoad('loadingBalance', {loading: this.state.actionType === Types.DELEGATE});

        Meteor.call('accounts.getAccountDetail', this.state.user, (error, result) => {
            try{
                if (result) {
                    let coin = result.coins?new Coin(result.coins[0]): new Coin(0);
                    this.setStateOnSuccess('loadingBalance', {
                        currentUser: {
                            accountNumber: result.account_number,
                            sequence: result.sequence,
                            availableCoin: coin,
                            pubKey: result.public_key.value
                    }})
                }
                if (!result || error) {
                    this.setStateOnError(
                        'loadingBalance',
                        `Failed to get account info for ${this.state.user}`,
                        { activeTab: '0' }
                    )
                }
            } catch (e) {
            this.setStateOnError('loadingBalance', e.message);
            }
        })
    }

    tryConnect = () => {
        this.ledger.getCosmosAddress().then((res) => {
            if (res.address == this.state.user)
                this.setState({
                    success: true,
                    activeTab: this.state.activeTab ==='1' ? '2': this.state.activeTab
                })
            else {
                if (this.state.isOpen) {
                    this.setState({
                        success: false,
                        activeTab: '0',
                        errorMessage: `Currently logged in as another user ${this.state.user}`
                    })
                }
            }
        }, (err) => this.setState({
            success: false,
            activeTab: '1'
       }));
    }

    getTxContext = () => {
        return {
            chainId: Meteor.settings.public.chainId,
            bech32: this.state.user,
            accountNumber: this.state.currentUser.accountNumber,
            sequence: this.state.currentUser.sequence,
            denom: Coin.MintingDenom,
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
                    this.state.delegateAmount.amount)
                break;
            case Types.REDELEGATE:
                txMsg = Ledger.createRedelegate(
                    this.getTxContext(),
                    this.props.validator.operator_address,
                    this.state.targetValidator.operator_address,
                    this.state.delegateAmount.amount)
                break;
            case Types.UNDELEGATE:
                txMsg = Ledger.createUndelegate(
                    this.getTxContext(),
                    this.props.validator.operator_address,
                    this.state.delegateAmount.amount);
                break;
            case Types.SEND:
                txMsg = Ledger.createTransfer(
                    this.getTxContext(),
                    this.state.transferTarget,
                    this.state.transferAmount.amount);
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
        if (this.state.simulating) return
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
        if (this.state.signing) return
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
                    } else if (res) {
                        this.setStateOnSuccess('signing', {
                            txHash: res,
                            activeTab: '4'
                        })
                    }
                })
            }, (err) => this.setStateOnError('signing', err.message))
        } catch (e) {
            this.setStateOnError('signing', e.message)
        }
    }

    handleInputChange = (e) => {
        let target = e.currentTarget;
        let dataset = target.dataset;
        let value;
        switch (dataset.type) {
            case 'validator':
                value = { moniker: dataset.moniker, operator_address: dataset.address}
                break;
            case 'coin':
                value = new Coin(target.value, target.nextSibling.innerText)
                break;
            default:
                value = target.value;
        }
        this.setState({[target.name]: value})
    }

    redirectToSignin = () => {
        let params = {...this.state.params,
            ...this.populateRedirectParams(),
        };
        this.close()
        this.props.history.push(this.props.history.location.pathname + '?signin&' + qs.stringify(params))
    }

    populateRedirectParams = () => {
        return { action: this.state.actionType }
    }

    getActionButton = () => {
        if (this.state.activeTab === '0')
            return <Button color="primary"  onClick={this.redirectToSignin}>Sign in With Ledger</Button>
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

    openModal = (type, params={}) => {
        if (!TypeMeta[type]) {
            console.warn(`action type ${type} not supported`)
            return;
        }
        this.setState({
            ...params,
            actionType: type,
            isOpen: true,
            params: params
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
                    return <DropdownItem className='validator' name='targetValidator' key={validator.address} onClick={this.handleInputChange} data-type='validator' data-moniker={validator.description.moniker} data-address={validator.operator_address}>
                        <Row>
                            <div className='moniker'>{validator.description.moniker}</div>
                            <div className='address overflow-auto'>{validator.operator_address}</div>
                        </Row>
                    </DropdownItem>
                })}
            </DropdownMenu>
        </UncontrolledDropdown>
    }

    renderConfirmationTab = () => {
        return <TabPane tabId="3">
            <div className='action-summary-message'>{this.getConfirmationMessage()}</div>
            <div className='warning-message'>{this.state.actionType && TypeMeta[this.state.actionType].warning} </div>
            <div className='confirmation-message'>If that's correct, please click next and sign in your ledger device.</div>
        </TabPane>
    }

    renderModal = () => {
        return  <Modal isOpen={this.state.isOpen} toggle={this.close} className="ledger-modal">
            <ModalBody>
                <TabContent className='ledger-modal-tab' activeTab={this.state.activeTab}>
                    <TabPane tabId="0"></TabPane>
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
            return new Coin(currentDelegation.shares * currentDelegation.tokenPerShare);
        }
        return null
    }

    supportAction(action) {
        return action === Types.DELEGATE || action === Types.REDELEGATE || action === Types.UNDELEGATE;
    }

    renderActionTab = () => {
        if (!this.state.currentUser) return null
        let action;
        let target;
        let maxAmount;
        let availableStatement;

        let moniker = this.props.validator.description && this.props.validator.description.moniker;
        let validatorAddress = <span className='ellipic'>this.props.validator.operator_address</span>;
        switch (this.state.actionType) {
            case Types.DELEGATE:
                action = 'Delegate to';
                maxAmount = this.state.currentUser.availableCoin;
                availableStatement = 'your available balance:'
                break;
            case Types.REDELEGATE:
                action = 'Redelegate from';
                target = this.getValidatorOptions();
                maxAmount = this.getDelegatedToken(this.props.currentDelegation);
                availableStatement = 'your delegated tokens:'
                break;
            case Types.UNDELEGATE:
                action = 'Undelegate from';
                maxAmount = this.getDelegatedToken(this.props.currentDelegation);
                availableStatement = 'your delegated tokens:'
                break;

        }
        return <TabPane tabId="2">
            <h3>{action} {moniker?moniker:validatorAddress} {target?'to':''} {target}</h3>
            <InputGroup>
               <Input name="delegateAmount" onChange={this.handleInputChange} data-type='coin' placeholder="Amount" min={0} max={maxAmount.stakingAmount} type="number" />
               <InputGroupAddon addonType="append">{Coin.StakingDenom}</InputGroupAddon>
            </InputGroup>
            <div>{availableStatement} <Amount coin={maxAmount}/> </div>
        </TabPane>
    }

    getConfirmationMessage = () => {
        switch (this.state.actionType) {
            case Types.DELEGATE:
                return <span>You are going to <span className='action'>delegate</span> <Amount coin={this.state.delegateAmount}/> to <AccountTooltip address={this.props.validator.operator_address} sync/> with <span className='gas'>{this.state.gasEstimate}</span> as gas.</span>
            case Types.REDELEGATE:
                return <span>You are going to <span className='action'>redelegate</span> <Amount coin={this.state.delegateAmount}/> from <AccountTooltip address={this.props.validator.operator_address} sync/> to <AccountTooltip address={this.state.targetValidator && this.state.targetValidator.operator_address} sync/> with <span className='gas'>{this.state.gasEstimate}</span> as gas.</span>
            case Types.UNDELEGATE:
                return <span>You are going to <span className='action'>undelegate</span> <Amount coin={this.state.delegateAmount}/> from <AccountTooltip address={this.props.validator.operator_address} sync/> with <span className='gas'>{this.state.gasEstimate}</span> as gas.</span>
        }
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
                if (this.props.address) {
                    res.value.msg.push({
                        type: 'cosmos-sdk/MsgWithdrawValidatorCommission',
                        value: { validator_address: this.props.address }
                    })
                }
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

    supportAction(action) {
        return action === Types.WITHDRAW;
    }

    renderActionTab = () => {
        return <TabPane tabId="2">
            <h3>Withdraw rewards from all delegations</h3>
            <div>Your current rewards amount: <Amount amount={this.props.rewards}/></div>
            {this.props.commission?<div>Your current commission amount: <Amount amount={this.props.commission}/></div>:''}
        </TabPane>
    }

    getConfirmationMessage = () => {
        return <span>You are going to <span className='action'>withdraw</span> rewards <Amount amount={this.props.rewards}/>
            {this.props.commission?<span> and commission <Amount amount={this.props.commission}/></span>:null}
             with  <span className='gas'>{this.state.gasEstimate}</span> as fee.
        </span>
    }

    render = () => {
        return <span className="ledger-buttons-group float-right">
            <Button color="success" size="sm" onClick={() => this.openModal(Types.WITHDRAW)}> {TypeMeta[Types.WITHDRAW].button} </Button>
            {this.renderModal()}
        </span>;
    }
}

class TransferButton extends LedgerButton {
    renderActionTab = () => {
        if (!this.state.currentUser) return null;
        let maxAmount = this.state.currentUser.availableCoin;
        return <TabPane tabId="2">
            <h3>Transfer {Coin.StakingDenom.toUpperCase()}</h3>

            <InputGroup>
               <Input name="transferTarget" onChange={this.handleInputChange} placeholder="Send to" type="text" value={this.state.transferTarget}/>
            </InputGroup>
            <InputGroup>
               <Input name="transferAmount" onChange={this.handleInputChange} data-type='coin' placeholder="Amount" min={0} max={maxAmount.stakingAmount} type="number"/>
               <InputGroupAddon addonType="append">{Coin.StakingDenom}</InputGroupAddon>
            </InputGroup>
            <div>your available balance: <Amount coin={maxAmount}/></div>
        </TabPane>
    }

    supportAction(action) {
        return action === Types.SEND;
    }

    filterParams(params) {
        return {
            transferTarget: params.transferTarget
        }
    }

    getConfirmationMessage = () => {
        return <span>You are going to <span className='action'>send</span> <Amount coin={this.state.transferAmount}/> to {this.state.transferTarget}
            with <span className='gas'>{this.state.gasEstimate}</span> as fee.
        </span>
    }

    render = () => {
        let params = this.props.address !== this.state.user?{transferTarget: this.props.address}: {};
        return <span className="ledger-buttons-group float-right">
            <Button color="info" size="sm" onClick={() => this.openModal(Types.SEND, params)}> {TypeMeta[Types.SEND].button} </Button>
            {this.renderModal()}
        </span>;
    }
}

export {
    DelegationButtons,
    WithdrawButton,
    TransferButton
}
