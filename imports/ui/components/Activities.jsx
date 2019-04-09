import React, {Component } from 'react';
import { MsgType } from './MsgType.jsx';
import { Link } from 'react-router-dom';
import numeral from 'numeral';
import Account from '../components/Account.jsx';

MultiSend = (props) => {
    return <div>
        <p>A <MsgType type={props.msg.type} /> happened.</p>
        <p>The following sender(s)
            <ul>
               {props.msg.value.inputs.map((data,i) =>{
                    return <li key={i}>{data.address} sent {data.coins.map((coin, j) =>{
                            return <em key={j} className="text-success">{numeral(coin.amount).format("0,0")} {coin.denom}</em>
                        })}
                    </li>
               })}
            </ul>
            to the following receipient(s)
            <ul>
               {props.msg.value.outputs.map((data,i) =>{
                    return <li key={i}>{data.address} received {data.coins.map((coin,j) =>{
                        return <em key={j} className="text-success">{numeral(coin.amount).format("0,0")} {coin.denom}</em>
                    })}</li>
               })}
            </ul>
        </p>
    </div>
}

export default class Activites extends Component {
    constructor(props){
        super(props);
        this.state = {
            from: "",
            to: "",
            delegator: "",
            sourceValidator: "",
            validator: ""
        }
    }

    updateState = () => {
        let msg = this.props.msg;
        switch (msg.type){
            case "cosmos-sdk/MsgSend":
                Meteor.call('Transactions.findUser', msg.value.from_address, (err, result) => {
                    if (err){
                        console.log(err);
                    }
                    else if (result){
                        this.setState({
                            from: <Link to={"/validator/"+result.address} >{result.description.moniker}</Link>
                        }) 
                    }
                    else {
                        this.setState({
                            from: msg.value.from_address
                        })
                    }
                });
                Meteor.call('Transactions.findUser', msg.value.to_address, (err, result) => {
                    if (err){
                        console.log(err);
                    }
                    else if (result){
                        this.setState({
                            to: <Link to={"/validator/"+result.address} >{result.description.moniker}</Link>
                        }) 
                    }
                    else {
                        this.setState({
                            to: msg.value.to_address
                        })
                    }
                });
                break;
            case "cosmos-sdk/MsgMultiSend":
                break;    
            case "cosmos-sdk/MsgCreateValidator":
                Meteor.call('Transactions.findUser', msg.value.delegator_address, (err, result) => {
                    if (err){
                        console.log(err);
                    }
                    else if (result){
                        this.setState({
                            delegator: <Link to={"/validator/"+result.address} >{result.description.moniker}</Link>
                        }) 
                    }
                    else {
                        this.setState({
                            delegator: msg.value.delegator_address
                        })
                    }
                });
                Meteor.call('Transactions.findUser', msg.value.validator_address, (err, result) => {
                    if (err){
                        console.log(err);
                    }
                    else if (result){
                        this.setState({
                            validator: <Link to={"/validator/"+result.address} >{result.description.moniker}</Link>
                        }) 
                    }
                    else {
                        this.setState({
                            validator: msg.value.validator_address
                        })
                    }
                });
                break;
            case "cosmos-sdk/MsgEditValidator":
                Meteor.call('Transactions.findUser', msg.value.address, (err, result) => {
                    if (err){
                        console.log(err);
                    }
                    else if (result){
                        this.setState({
                            validator: <Link to={"/validator/"+result.address} >{result.description.moniker}</Link>
                        }) 
                    }
                    else {
                        this.setState({
                            validator: msg.value.address
                        })
                    }
                });
                break;
            case "cosmos-sdk/MsgDelegate":
            case "cosmos-sdk/MsgUndelegate":
                Meteor.call('Transactions.findUser', msg.value.delegator_address, (err, result) => {
                    if (err){
                        console.log(err);
                    }
                    else if (result){
                        this.setState({
                            delegator: <Link to={"/validator/"+result.address} >{result.description.moniker}</Link>
                        }) 
                    }
                    else {
                        this.setState({
                            delegator: msg.value.delegator_address
                        })
                    }
                });
                Meteor.call('Transactions.findUser', msg.value.validator_address, (err, result) => {
                    if (err){
                        console.log(err);
                    }
                    else if (result){
                        this.setState({
                            validator: <Link to={"/validator/"+result.address} >{result.description.moniker}</Link>
                        }) 
                    }
                    else {
                        this.setState({
                            validator: msg.value.validator_address
                        })
                    }
                });
                break;
            case "cosmos-sdk/MsgBeginRedelegate":    
                Meteor.call('Transactions.findUser', msg.value.delegator_address, (err, result) => {
                    if (err){
                        console.log(err);
                    }
                    else if (result){
                        this.setState({
                            delegator: <Link to={"/validator/"+result.address} >{result.description.moniker}</Link>
                        }) 
                    }
                    else {
                        this.setState({
                            delegator: msg.value.delegator_address
                        })
                    }
                });
                Meteor.call('Transactions.findUser', msg.value.validator_src_address, (err, result) => {
                    if (err){
                        console.log(err);
                    }
                    else if (result){
                        this.setState({
                            sourceValidator: <Link to={"/validator/"+result.address} >{result.description.moniker}</Link>
                        }) 
                    }
                    else {
                        this.setState({
                            sourceValidator: msg.value.validator_src_address
                        })
                    }
                });
                Meteor.call('Transactions.findUser', msg.value.validator_dst_address, (err, result) => {
                    if (err){
                        console.log(err);
                    }
                    else if (result){
                        this.setState({
                            validator: <Link to={"/validator/"+result.address} >{result.description.moniker}</Link>
                        }) 
                    }
                    else {
                        this.setState({
                            validator: msg.value.validator_dst_address
                        })
                    }
                });
                break;

            case "cosmos-sdk/MsgWithdrawValidatorCommission":
                Meteor.call('Transactions.findUser', msg.value.validator_address, (err, result) => {
                    if (err){
                        console.log(err);
                    }
                    else if (result){
                        this.setState({
                            validator: <Link to={"/validator/"+result.address} >{result.description.moniker}</Link>
                        }) 
                    }
                    else {
                        this.setState({
                            validator: msg.value.validator_address
                        })
                    }
                });
                break;
            case "cosmos-sdk/MsgWithdrawDelegationReward":
                Meteor.call('Transactions.findUser', msg.value.validator_address, (err, result) => {
                    if (err){
                        console.log(err);
                    }
                    else if (result){
                        this.setState({
                            validator: <Link to={"/validator/"+result.address} >{result.description.moniker}</Link>
                        }) 
                    }
                    else {
                        this.setState({
                            validator: msg.value.validator_address
                        })
                    }
                });
                Meteor.call('Transactions.findUser', msg.value.delegator_address, (err, result) => {
                    if (err){
                        console.log(err);
                    }
                    else if (result){
                        this.setState({
                            delegator: <Link to={"/validator/"+result.address} >{result.description.moniker}</Link>
                        }) 
                    }
                    else {
                        this.setState({
                            delegator: msg.value.delegator_address
                        })
                    }
                });
                break;
            case "cosmos-sdk/MsgUnjail":
                Meteor.call('Transactions.findUser', msg.value.address, (err, result) => {
                    if (err){
                        console.log(err);
                    }
                    else if (result){
                        this.setState({
                            delegator: <Link to={"/validator/"+result.address} >{result.description.moniker}</Link>
                        }) 
                    }
                    else {
                        this.setState({
                            delegator: msg.value.address
                        })
                    }
                });
                break;
        }
    }

    componentDidMount(){
        this.updateState();
    }

    componentDidUpdate(prevProps){
        if (this.props != prevProps){
            this.updateState();
        }
    }

    render(){
        console.log(this.props);
        let msg = this.props.msg;
        switch (msg.type){
            // bank
            case "cosmos-sdk/MsgSend":
                let amount = '';
                for (let a in msg.value.amount){
                    if (a > 0){
                        amount += ', '+numeral(msg.value.amount[a].amount).format("0,0")+" "+msg.value.amount[a].denom;
                    }
                    else{
                        amount += numeral(msg.value.amount[a].amount).format("0,0")+" "+msg.value.amount[a].denom;
                    }
                }
                return <p><Account address={msg.value.from_address} /> {(this.props.invalid)?"failed to ":''}<MsgType type={msg.type} /> <em className="text-success">{amount}</em> to <span className="address"><Account address={msg.value.to_address} /></span>.</p>
            case "cosmos-sdk/MsgMultiSend":
                return <MultiSend msg={msg} />
            
            // staking
            case "cosmos-sdk/MsgCreateValidator":
                return <p>{this.state.delegator} {(this.props.invalid)?"failed to ":''}<MsgType type={msg.type} /> operating at <span className="address">{this.state.validator}</span> with moniker <Link to="#">{msg.value.description.moniker}</Link>.</p>
            case "cosmos-sdk/MsgEditValidator":
                return <p>{this.state.validator} {(this.props.invalid)?"failed to ":''}<MsgType type={msg.type} /></p>
            case "cosmos-sdk/MsgDelegate":
                return <p><span className="address">{this.state.delegator}</span> {(this.props.invalid)?"failed to ":''}<MsgType type={msg.type} /> <em className="text-warning">{numeral(msg.value.amount).format("0,0")} {msg.value.denom}</em> to <span className="address">{this.state.validator}</span>.</p>
            case "cosmos-sdk/MsgUndelegate":
                return <p><span className="address">{this.state.delegator}</span> {(this.props.invalid)?"failed to ":''}<MsgType type={msg.type} /> <em className="text-warning">{numeral(msg.value.shares_amount).format("0,0")} shares</em> from <span className="address">{this.state.validator}</span>.</p>
            case "cosmos-sdk/MsgBeginRedelegate":
                return <p><span className="address">{this.state.delegator}</span> {(this.props.invalid)?"failed to ":''}<MsgType type={msg.type} /> <em className="text-warning">{numeral(msg.value.shares_amount).format("0,0")} shares</em> from <span className="address">{this.state.sourceValidator}</span> to <span className="address">{this.state.validator}</span>.</p>
            
            // gov
            case "cosmos-sdk/MsgSubmitProposal":
                return <p><Account address={msg.value.proposer} /> {(this.props.invalid)?"failed to ":''}<MsgType type={msg.type} /> with title <Link to={"/proposals/"+this.props.tags[2].value}>{msg.value.title}</Link>.</p>
            case "cosmos-sdk/MsgDeposit":
                return <p><Account address={msg.value.depositor} /> {(this.props.invalid)?"failed to ":''}<MsgType type={msg.type} /> <em className="text-info">{msg.value.amount.map((amount,i) =>{
                    if (i>0){
                        return " ,"+numeral(amount.amount).format("0,0")+" "+amount.denom;
                    }
                    else{
                        return numeral(amount.amount).format("0,0")+" "+amount.denom;
                    }
                })}</em> to <Link to={"/proposals/"+msg.value.proposal_id}>proposal {msg.value.proposal_id}</Link>.</p>
            case "cosmos-sdk/MsgVote":
                return <p><Account address={msg.value.voter} /> {(this.props.invalid)?"failed to ":''}<MsgType type={msg.type} />  <Link to={"/proposals/"+msg.value.proposal_id}>proposal {msg.value.proposal_id}</Link> with a <em className="text-info">{msg.value.option}</em>.</p>
            
            // distribution
            case "cosmos-sdk/MsgWithdrawValidatorCommission":
                return <p><span className="address">{this.state.validator}</span> {(this.props.invalid)?"failed to ":''}<MsgType type={msg.type} />.</p>
            case "cosmos-sdk/MsgWithdrawDelegationReward":
                return <p><span className="address">{this.state.delegator}</span> {(this.props.invalid)?"failed to ":''}<MsgType type={msg.type} /> from <span className="address">{this.state.validator}</span>.</p>
            case "cosmos-sdk/MsgModifyWithdrawAddress":
                return <p><Account address={msg.value.delegator_address}/> {(this.props.invalid)?"failed to ":''}<MsgType type={msg.type} /></p>
    
            // slashing
            case "cosmos-sdk/MsgUnjail":
                return <p><span className="address">{msg.value.address}</span> {(this.props.invalid)?"failed to ":''}<MsgType type={msg.type} />.</p>
            
            // ibc
            case "cosmos-sdk/IBCTransferMsg":
                return <MsgType type={msg.type} />
            case "cosmos-sdk/IBCReceiveMsg":
                return <MsgType type={msg.type} />
    
            default:
                return <div>{JSON.stringify(msg.value)}</div>
        }
    }
}