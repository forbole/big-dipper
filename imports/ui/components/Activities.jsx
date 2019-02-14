import React, {Component } from 'react';
import { MsgType } from './MsgType.jsx';
import { Link } from 'react-router-dom';
import numeral from 'numeral';

export default class Activites extends Component {
    constructor(props){
        super(props);
    }

    render(){
        console.log(this.props);
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
                return <p>{msg.value.from_address} <MsgType type={msg.type} /> <em className="text-success">{amount}</em> to {msg.value.to_address}.</p>
            case "cosmos-sdk/MultiSend":
                return <MsgType type={msg.type} />
            
            // staking
            case "cosmos-sdk/MsgCreateValidator":
                return <p>{msg.value.delegator_address} <MsgType type={msg.type} /> operating at {msg.value.validator_address} with moniker <Link to="#">{msg.value.description.moniker}</Link>.</p>
            case "cosmos-sdk/MsgEditValidator":
                return <MsgType type={msg.type} />
            case "cosmos-sdk/MsgDelegate":
                return <p>{msg.value.delegator_addr} <MsgType type={msg.type} /> <em className="text-warning">{numeral(msg.value.value.amount).format("0,0")} {msg.value.value.denom}</em> to {msg.value.validator_addr}.</p>
            case "cosmos-sdk/Undelegate":
                return <p>{msg.value.delegator_addr} <MsgType type={msg.type} /> <em className="text-warning">{numeral(msg.value.shares_amount).format("0,0")} </em> from {msg.value.validator_addr}.</p>
            case "cosmos-sdk/BeginRedelegate":
                return <p>{msg.value.delegator_addr} <MsgType type={msg.type} /> <em className="text-warning">{numeral(msg.value.shares_amount).format("0.0")}</em> from {msg.value.validator_src_addr} to {msg.value.validator_dst_addr}.</p>
            
            // gov
            case "cosmos-sdk/MsgSubmitProposal":
                return <MsgType type={msg.type} />
            case "cosmos-sdk/MsgDeposit":
                return <MsgType type={msg.type} />
            case "cosmos-sdk/MsgVote":
                return <MsgType type={msg.type} />
            
            // distribution
            case "cosmos-sdk/MsgWithdrawValidatorCommission":
                return <p>{msg.value.validator_addr} <MsgType type={msg.type} />.</p>
            case "cosmos-sdk/MsgWithdrawDelegationReward":
                return <p>{msg.value.delegator_addr} <MsgType type={msg.type} /> from {msg.value.validator_addr}.</p>
            case "cosmos-sdk/MsgModifyWithdrawAddress":
                return <MsgType type={msg.type} />
    
            // slashing
            case "cosmos-sdk/MsgUnjail":
                return <p>{msg.value.address} <MsgType type={msg.type} />.</p>
            
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