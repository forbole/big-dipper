import React, {Component } from 'react';
import { MsgType } from './MsgType.jsx';
import { Link } from 'react-router-dom';
import numeral from 'numeral';

export default class Activites extends Component {
    constructor(props){
        super(props);
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
                return <p>{msg.value.from_address} {(this.props.invalid)?"failed to ":''}<MsgType type={msg.type} /> <em className="text-success">{amount}</em> to <span className="address">{msg.value.to_address}</span>.</p>
            case "cosmos-sdk/MultiSend":
                return <MsgType type={msg.type} />
            
            // staking
            case "cosmos-sdk/MsgCreateValidator":
                return <p>{msg.value.delegator_address} {(this.props.invalid)?"failed to ":''}<MsgType type={msg.type} /> operating at <span className="address">{msg.value.validator_address}</span> with moniker <Link to="#">{msg.value.description.moniker}</Link>.</p>
            case "cosmos-sdk/MsgEditValidator":
                return <MsgType type={msg.type} />
            case "cosmos-sdk/MsgDelegate":
                return <p><span className="address">{msg.value.delegator_addr}</span> {(this.props.invalid)?"failed to ":''}<MsgType type={msg.type} /> <em className="text-warning">{numeral(msg.value.value.amount).format("0,0")} {msg.value.value.denom}</em> to <span className="address">{msg.value.validator_addr}</span>.</p>
            case "cosmos-sdk/Undelegate":
                return <p><span className="address">{msg.value.delegator_addr}</span> {(this.props.invalid)?"failed to ":''}<MsgType type={msg.type} /> <em className="text-warning">{numeral(msg.value.shares_amount).format("0,0")} </em> from <span className="address">{msg.value.validator_addr}</span>.</p>
            case "cosmos-sdk/BeginRedelegate":
                return <p><span className="address">{msg.value.delegator_addr}</span> {(this.props.invalid)?"failed to ":''}<MsgType type={msg.type} /> <em className="text-warning">{numeral(msg.value.shares_amount).format("0.0")}</em> from <span className="address">{msg.value.validator_src_addr}</span> to <span className="address">{msg.value.validator_dst_addr}</span>.</p>
            
            // gov
            case "cosmos-sdk/MsgSubmitProposal":
                return <MsgType type={msg.type} />
            case "cosmos-sdk/MsgDeposit":
                return <MsgType type={msg.type} />
            case "cosmos-sdk/MsgVote":
                return <MsgType type={msg.type} />
            
            // distribution
            case "cosmos-sdk/MsgWithdrawValidatorCommission":
                return <p><span className="address">{msg.value.validator_addr}</span> {(this.props.invalid)?"failed to ":''}<MsgType type={msg.type} />.</p>
            case "cosmos-sdk/MsgWithdrawDelegationReward":
                return <p><span className="address">{msg.value.delegator_addr}</span> {(this.props.invalid)?"failed to ":''}<MsgType type={msg.type} /> from <span className="address">{msg.value.validator_addr}</span>.</p>
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