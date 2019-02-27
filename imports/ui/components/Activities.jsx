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
            case "irishub/bank/Send":
                Meteor.call('Transactions.findUser', msg.value.inputs[0].address, (err, result) => {
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
                            from: msg.value.inputs[0].address
                        })
                    }
                });
                Meteor.call('Transactions.findUser', msg.value.outputs[0].address, (err, result) => {
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
                            to: msg.value.outputs[0].address
                        })
                    }
                });
                break;
            case "irishub/stake/MsgCreateValidator":
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
            case "irishub/stake/MsgEditValidator":
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
            case "irishub/stake/MsgDelegate":
            case "irishub/stake/Undelegate":
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
            case "irishub/stake/BeginRedelegate":    
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

            case "irishub/distr/MsgWithdrawValidatorRewardsAll":
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
            case "irishub/distr/MsgWithdrawDelegationReward":
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
            case "irishub/bank/Send":
                let amount = '';
                for (let a in msg.value.inputs[0].coins){
                    if (a > 0){
                        amount += ', '+numeral(msg.value.inputs[0].coins[a].amount).format("0,0a")+" "+msg.value.inputs[0].coins[a].denom;
                    }
                    else{
                        amount += numeral(msg.value.inputs[0].coins[a].amount).format("0,0a")+" "+msg.value.inputs[0].coins[a].denom;
                    }
                }
                return <p>{this.state.from} {(this.props.invalid)?"failed to ":''}<MsgType type={msg.type} /> <em className="text-success">{amount}</em> to <span className="address">{this.state.to}</span>.</p>
            // case "irishub/bank/MultiSend":
            //     return <MsgType type={msg.type} />
            
            // staking
            case "irishub/stake/MsgCreateValidator":
                return <p>{this.state.delegator} {(this.props.invalid)?"failed to ":''}<MsgType type={msg.type} /> operating at <span className="address">{this.state.validator}</span> with moniker <Link to="#">{msg.value.Description.moniker}</Link>.</p>
            case "irishub/stake/MsgEditValidator":
                return <p>{this.state.validator} {(this.props.invalid)?"failed to ":''}<MsgType type={msg.type} /></p>
            case "irishub/stake/MsgDelegate":
                return <p><span className="address">{this.state.delegator}</span> {(this.props.invalid)?"failed to ":''}<MsgType type={msg.type} /> <em className="text-warning">{numeral(msg.value.delegation.amount).format("0,0a")} {msg.value.delegation.denom}</em> to <span className="address">{this.state.validator}</span>.</p>
            case "irishub/stake/Undelegate":
                return <p><span className="address">{this.state.delegator}</span> {(this.props.invalid)?"failed to ":''}<MsgType type={msg.type} /> <em className="text-warning">{numeral(msg.value.shares_amount).format("0,0")} </em> from <span className="address">{this.state.validator}</span>.</p>
            case "irishub/stake/BeginRedelegate":
                return <p><span className="address">{this.state.delegator}</span> {(this.props.invalid)?"failed to ":''}<MsgType type={msg.type} /> <em className="text-warning">{numeral(msg.value.shares_amount).format("0.0")}</em> from <span className="address">{this.state.sourceValidator}</span> to <span className="address">{this.state.validator}</span>.</p>
            
            // gov
            case "irishub/gov/MsgSubmitProposal":
                return <MsgType type={msg.type} />
            case "irishub/gov/MsgDeposit":
                return <MsgType type={msg.type} />
            case "irishub/gov/MsgVote":
                return <MsgType type={msg.type} />
            
            // distribution
            case "irishub/distr/MsgWithdrawValidatorRewardsAll":
                return <p><span className="address">{this.state.validator}</span> {(this.props.invalid)?"failed to ":''}<MsgType type={msg.type} />.</p>
            case "irishub/distr/MsgWithdrawDelegationReward":
                return <p><span className="address">{this.state.delegator}</span> {(this.props.invalid)?"failed to ":''}<MsgType type={msg.type} /> from <span className="address">{this.state.validator}</span>.</p>
            case "irishub/distr/MsgModifyWithdrawAddress":
                return <MsgType type={msg.type} />
    
            // slashing
            case "irishub/slashing/MsgUnjail":
                return <p><span className="address">{msg.value.address}</span> {(this.props.invalid)?"failed to ":''}<MsgType type={msg.type} />.</p>
            
            // ibc
            // case "cosmos-sdk/IBCTransferMsg":
            //     return <MsgType type={msg.type} />
            // case "cosmos-sdk/IBCReceiveMsg":
            //     return <MsgType type={msg.type} />
    
            default:
                return <div>{JSON.stringify(msg.value)}</div>
        }
    }
}