import React, {Component } from 'react';
import { MsgType } from './MsgType.jsx';
import { Link } from 'react-router-dom';
import numeral from 'numeral';

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
            case "cosmos-sdk/Send":
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
            case "cosmos-sdk/Undelegate":
                Meteor.call('Transactions.findUser', msg.value.delegator_addr, (err, result) => {
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
                            delegator: msg.value.delegator_addr
                        })
                    }
                });
                Meteor.call('Transactions.findUser', msg.value.validator_addr, (err, result) => {
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
                            validator: msg.value.validator_addr
                        })
                    }
                });
                break;
            case "cosmos-sdk/BeginRedelegate":    
                Meteor.call('Transactions.findUser', msg.value.delegator_addr, (err, result) => {
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
                            delegator: msg.value.delegator_addr
                        })
                    }
                });
                Meteor.call('Transactions.findUser', msg.value.validator_src_addr, (err, result) => {
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
                            sourceValidator: msg.value.validator_src_addr
                        })
                    }
                });
                Meteor.call('Transactions.findUser', msg.value.validator_dst_addr, (err, result) => {
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
                            validator: msg.value.validator_dst_addr
                        })
                    }
                });
                break;

            case "cosmos-sdk/MsgWithdrawValidatorCommission":
                Meteor.call('Transactions.findUser', msg.value.validator_addr, (err, result) => {
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
                            validator: msg.value.validator_addr
                        })
                    }
                });
                break;
            case "cosmos-sdk/MsgWithdrawDelegationReward":
                Meteor.call('Transactions.findUser', msg.value.validator_addr, (err, result) => {
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
                            validator: msg.value.validator_addr
                        })
                    }
                });
                Meteor.call('Transactions.findUser', msg.value.delegator_addr, (err, result) => {
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
                            delegator: msg.value.delegator_addr
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
        // console.log(this.props);
        let msg = this.props.msg;
        switch (msg.type){
            // bank
            case "cosmos-sdk/Send":
                let amount = '';
                for (let a in msg.value.amount){
                    if (a > 0){
                        amount += ', '+numeral(msg.value.amount[a].amount).format("0,0")+" "+msg.value.amount[a].denom;
                    }
                    else{
                        amount += numeral(msg.value.amount[a].amount).format("0,0")+" "+msg.value.amount[a].denom;
                    }
                }
                return <p>{this.state.from} {(this.props.invalid)?"failed to ":''}<MsgType type={msg.type} /> <em className="text-success">{amount}</em> to <span className="address">{this.state.to}</span>.</p>
            case "cosmos-sdk/MultiSend":
                return <MsgType type={msg.type} />
            
            // staking
            case "cosmos-sdk/MsgCreateValidator":
                return <p>{this.state.delegator} {(this.props.invalid)?"failed to ":''}<MsgType type={msg.type} /> operating at <span className="address">{this.state.validator}</span> with moniker <Link to="#">{msg.value.description.moniker}</Link>.</p>
            case "cosmos-sdk/MsgEditValidator":
                return <p>{this.state.validator} {(this.props.invalid)?"failed to ":''}<MsgType type={msg.type} /></p>
            case "cosmos-sdk/MsgDelegate":
                return <p><span className="address">{this.state.delegator}</span> {(this.props.invalid)?"failed to ":''}<MsgType type={msg.type} /> <em className="text-warning">{numeral(msg.value.value.amount).format("0,0")} {msg.value.value.denom}</em> to <span className="address">{this.state.validator}</span>.</p>
            case "cosmos-sdk/Undelegate":
                return <p><span className="address">{this.state.delegator}</span> {(this.props.invalid)?"failed to ":''}<MsgType type={msg.type} /> <em className="text-warning">{numeral(msg.value.shares_amount).format("0,0")} </em> from <span className="address">{this.state.validator}</span>.</p>
            case "cosmos-sdk/BeginRedelegate":
                return <p><span className="address">{this.state.delegator}</span> {(this.props.invalid)?"failed to ":''}<MsgType type={msg.type} /> <em className="text-warning">{numeral(msg.value.shares_amount).format("0.0")}</em> from <span className="address">{this.state.sourceValidator}</span> to <span className="address">{this.state.validator}</span>.</p>
            
            // gov
            case "cosmos-sdk/MsgSubmitProposal":
                return <MsgType type={msg.type} />
            case "cosmos-sdk/MsgDeposit":
                return <MsgType type={msg.type} />
            case "cosmos-sdk/MsgVote":
                return <MsgType type={msg.type} />
            
            // distribution
            case "cosmos-sdk/MsgWithdrawValidatorCommission":
                return <p><span className="address">{this.state.validator}</span> {(this.props.invalid)?"failed to ":''}<MsgType type={msg.type} />.</p>
            case "cosmos-sdk/MsgWithdrawDelegationReward":
                return <p><span className="address">{this.state.delegator}</span> {(this.props.invalid)?"failed to ":''}<MsgType type={msg.type} /> from <span className="address">{this.state.validator}</span>.</p>
            case "cosmos-sdk/MsgModifyWithdrawAddress":
                return <MsgType type={msg.type} />
    
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