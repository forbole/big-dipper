import qs from 'querystring';
import Cosmos from "@lunie/cosmos-js"
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Button, Spinner, TabContent, TabPane, Row, Col, Modal, ModalHeader,
    Form, ModalBody, ModalFooter, InputGroup, InputGroupAddon, Input, Progress,
    UncontrolledTooltip, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem} from 'reactstrap';
import { Ledger } from './ledger.js';
import { Validators } from '/imports/api/validators/validators.js';
import AccountTooltip from '/imports/ui/components/AccountTooltip.jsx';
import Coin from '/both/utils/coins.js';
import moment from 'moment';
import numbro from 'numbro';

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
        warning: (duration, maxEntries) => `You are only able to redelegate from Validator A → Validator B up to ${maxEntries} times in a ${duration} day period.
                  Also, There is ${duration} day cooldown from serial redelegation;
                  Once you redelegate from Validator A to Validator B,
                  you will not be able to redelegate from Validator B to another validator for the next ${duration} days.`
    },
    [Types.UNDELEGATE]: {
        button: 'undelegate',
        pathPreFix: 'staking/delegators',
        pathSuffix: 'unbonding_delegations',
        warning: (duration) => `There is a ${duration} day unbonding period.`
    },
    [Types.WITHDRAW]: {
        button: 'withdraw',
        pathPreFix: 'distribution/delegators',
        pathSuffix: 'rewards',
        warning: '',
        gasAdjustment: '1.4'
    },
    [Types.SEND]: {
        button: 'transfer',
        button_other: 'send',
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

const isBetween = (value, min, max) => {
    if (value instanceof Coin) value = value.amount;
    if (min instanceof Coin) min = min.amount;
    if (max instanceof Coin) max = max.amount;
    return value >= min && value <= max;
}

const startsWith = (str, prefix) => {
    return str.substr(0, prefix.length) === prefix
}

const isAddress = (address) => {
    return address && startsWith(address, Meteor.settings.public.bech32PrefixAccAddr)
}

const isValidatorAddress = (address) => {
    return address && startsWith(address, Meteor.settings.public.bech32PrefixValAddr)
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

        this.initStateOnLoad('loadingBalance', {
            loading: this.state.actionType === Types.DELEGATE,
            loadingRedelegations: this.state.actionType === Types.REDELEGATE
        });

        if (this.state.actionType === Types.REDELEGATE) {
            Meteor.call('accounts.getAllRedelegations', this.state.user, this.props.validator.operator_address, (error, result) => {
                try{
                    if (result)
                        this.setStateOnSuccess('loadingRedelegations', {redelegations: result})
                    if (!result || error) {
                        this.setStateOnError('loadingRedelegations')
                    }
                } catch (e) {
                    this.setStateOnError('loadingRedelegations', e.message);
                }
            })
        }

        Meteor.call('accounts.getAccountDetail', this.state.user, (error, result) => {
            try{
                if (result) {
                    let coin = result.coins?new Coin(result.coins[0]): new Coin(0);
                    this.setStateOnSuccess('loadingBalance', {
                        currentUser: {
                            accountNumber: result.account_number,
                            sequence: result.sequence || 0,
                            availableCoin: coin
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
                    activeTab: this.state.activeTab ==='1' ? '2': this.state.activeTab,
                    pubKey: Buffer.from(res.pubKey).toString('base64')
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
            pk: this.state.pubKey,
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

    isDataValid = () => {
        return this.state.currentUser != undefined;
    }

    getActionButton = () => {
        if (this.state.activeTab === '0')
            return <Button color="primary"  onClick={this.redirectToSignin}>Sign in With Ledger</Button>
        if (this.state.activeTab === '1')
            return <Button color="primary"  onClick={this.tryConnect}>Continue</Button>
        if (this.state.activeTab === '2')
            return <Button color="primary"  disabled={this.state.simulating || !this.isDataValid()} onClick={this.simulate}>
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
        let redelegations = this.state.redelegations || {};
        let maxEntries = this.props.stakingParams.max_entries;
        return <UncontrolledDropdown direction='down' size='sm' className='redelegate-validators'>
            <DropdownToggle caret={true}>
                {this.state.targetValidator?this.state.targetValidator.moniker:'Select a Validator'}
            </DropdownToggle>
            <DropdownMenu modifiers={maxHeightModifier}>
                {activeValidators.map((validator, i) => {
                    if (validator.address === this.props.validator.address) return null

                    let redelegation = redelegations[validator.operator_address]
                    let disabled = redelegation && (redelegation.count >= maxEntries);
                    let completionTime = disabled?moment.utc(redelegation.completionTime).format("D MMM YYYY, h:mm:ssa z"):null;
                    let id = `validator-option${i}`
                    return <div id={id} className={`validator disabled-btn-wrapper${disabled?' disabled':''}`}  key={i}>
                        <DropdownItem name='targetValidator'
                            onClick={this.handleInputChange} data-type='validator' disabled={disabled}
                            data-moniker={validator.description.moniker} data-address={validator.operator_address}>
                            <Row>
                                <Col xs='12' className='moniker'>{validator.description.moniker}</Col>
                                <Col xs='3' className="voting-power data">
                                    <i className="material-icons">power</i>
                                    {validator.voting_power?numbro(validator.voting_power).format('0,0'):0}
                                </Col>

                                <Col xs='4' className="commission data">
                                    <i className="material-icons">call_split</i>
                                    {numbro(validator.commission.rate).format('0.00%')}
                                </Col>
                                <Col xs='5' className="uptime data">
                                    <Progress value={validator.uptime} style={{width:'80%'}}>
                                       {validator.uptime?numbro(validator.uptime/100).format('0%'):0}
                                    </Progress>
                                </Col>
                            </Row>
                        </DropdownItem>
                        {disabled?<UncontrolledTooltip placement='bottom' target={id}>
                            <span>You have {maxEntries} regelegations from {this.props.validator.description.moniker}
                                 to {validator.description.moniker},
                                you cannot redelegate until {completionTime}</span>
                        </UncontrolledTooltip>:null}
                    </div>
                })}
            </DropdownMenu>
        </UncontrolledDropdown>
    }

    getWarningMessage = () => {
        return null
    }

    renderConfirmationTab = () => {
        if (!this.state.actionType) return;
        return <TabPane tabId="3">
            <div className='action-summary-message'>{this.getConfirmationMessage()}</div>
            <div className='warning-message'>{this.getWarningMessage()}</div>
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
    constructor(props) {
        super(props);
    }

    getDelegatedToken = (currentDelegation) => {
        if (currentDelegation && currentDelegation.shares && currentDelegation.tokenPerShare) {
            return new Coin(currentDelegation.shares * currentDelegation.tokenPerShare);
        }
        return null
    }

    supportAction(action) {
        return action === Types.DELEGATE || action === Types.REDELEGATE || action === Types.UNDELEGATE;
    }

    isDataValid = () => {
        if (!this.state.currentUser) return false;

        let maxAmount;
        if (this.state.actionType === Types.DELEGATE) {
            maxAmount = this.state.currentUser.availableCoin;
        } else{
            maxAmount = this.getDelegatedToken(this.props.currentDelegation);
        }
        let isValid = isBetween(this.state.delegateAmount, 1, maxAmount)

        if (this.state.actionType === Types.REDELEGATE)
            isValid = isValid || (this.state.targetValidator &&
                this.state.targetValidator.operator_address &&
                isValidatorAddress(this.state.targetValidator.operator_address))
        return isValid
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
                <Input name="delegateAmount" onChange={this.handleInputChange} data-type='coin'
                    placeholder="Amount" min={Coin.minStake} max={maxAmount.stakingAmount} type="number"
                    invalid={this.state.delegateAmount != null && !isBetween(this.state.delegateAmount, 1, maxAmount)} />
                <InputGroupAddon addonType="append">{Coin.StakingDenom}</InputGroupAddon>
            </InputGroup>
            <div>{availableStatement} <Amount coin={maxAmount}/> </div>
        </TabPane>
    }

    getWarningMessage = () => {
        let duration = this.props.stakingParams.unbonding_time;
        let maxEntries = this.props.stakingParams.max_entries;
        let warning = TypeMeta[this.state.actionType].warning;
        return warning && warning(duration, maxEntries);
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

    renderRedelegateButtons = () => {
        let delegation = this.props.currentDelegation;
        if (!delegation) return null;
        let completionTime = delegation.redelegationCompletionTime;
        let isCompleted = !completionTime || new Date() >= completionTime;
        let maxEntries = this.props.stakingParams.max_entries;
        let canUnbond = !delegation.unbonding || maxEntries > delegation.unbonding;
        return <span>
            <div id='redelegate-button' className={`disabled-btn-wrapper${isCompleted?'':' disabled'}`}>
                <Button color="danger" size="sm" disabled={!isCompleted}
                    onClick={() => this.openModal(Types.REDELEGATE)}>
                    {TypeMeta[Types.REDELEGATE].button}
                </Button>
                {isCompleted?null:<UncontrolledTooltip placement='bottom' target='redelegate-button'>
                    <span>You have incompleted regelegation to this validator,
                        you can't redelegate until {moment.utc(completionTime).format("D MMM YYYY, h:mm:ssa z")}
                    </span>
                </UncontrolledTooltip>}
            </div>
            <div id='undelegate-button' className={`disabled-btn-wrapper${canUnbond?'':' disabled'}`}>
                <Button color="warning" size="sm" disabled={!canUnbond}
                    onClick={() => this.openModal(Types.UNDELEGATE)}>
                    {TypeMeta[Types.UNDELEGATE].button}
                </Button>
                {canUnbond?null:<UncontrolledTooltip placement='bottom' target='undelegate-button'>
                    <span>You reached maximum {maxEntries} unbonding delegation entries,
                        you can't delegate until the first one matures at {moment.utc(delegation.unbondingCompletionTime).format("D MMM YYYY, h:mm:ssa z")}
                    </span>
                </UncontrolledTooltip>}
            </div>
        </span>
    }

    render = () => {
        return <span className="ledger-buttons-group float-right">
            {isActiveValidator(this.props.validator)?<Button color="success"
                size="sm" onClick={() => this.openModal(Types.DELEGATE)}>
                {TypeMeta[Types.DELEGATE].button}
            </Button>:null}
            {this.renderRedelegateButtons()}
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
            <Button color="success" size="sm" disabled={!this.props.rewards}
                onClick={() => this.openModal(Types.WITHDRAW)}>
                {TypeMeta[Types.WITHDRAW].button}
            </Button>
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
                <Input name="transferTarget" onChange={this.handleInputChange}
                    placeholder="Send to" type="text"
                    value={this.state.transferTarget}
                    invalid={this.state.transferTarget != null && !isAddress(this.state.transferTarget)}/>
            </InputGroup>
            <InputGroup>
                <Input name="transferAmount" onChange={this.handleInputChange}
                    data-type='coin' placeholder="Amount"
                    min={Coin.minStake} max={maxAmount.stakingAmount} type="number"
                    invalid={this.state.transferAmount != null && !isBetween(this.state.transferAmount, 1, maxAmount)}/>
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

    isDataValid = () => {
        if (!this.state.currentUser) return false
        return isBetween(this.state.transferAmount, 1, this.state.currentUser.availableCoin)
    }

    getConfirmationMessage = () => {
        return <span>You are going to <span className='action'>send</span> <Amount coin={this.state.transferAmount}/> to {this.state.transferTarget}
            with <span className='gas'>{this.state.gasEstimate}</span> as fee.
        </span>
    }

    render = () => {
        let params = {};
        let button = TypeMeta[Types.SEND].button;
        if (this.props.address !== this.state.user) {
            params = {transferTarget: this.props.address}
            button = TypeMeta[Types.SEND].button_other
        }
        return <span className="ledger-buttons-group float-right">
            <Button color="info" size="sm" onClick={() => this.openModal(Types.SEND, params)}> {button} </Button>
            {this.renderModal()}
        </span>;
    }
}

export {
    DelegationButtons,
    WithdrawButton,
    TransferButton
}
