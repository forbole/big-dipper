import React, {Component } from 'react';
import { MsgType } from './MsgType.jsx';
import { Link } from 'react-router-dom';
import numbro from 'numbro';
import Account from '../components/Account.jsx';

MultiSend = (props) => {
    return <div>
        <p>A <MsgType type={props.msg.type} /> happened.</p>
        <p>The following sender(s)
            <ul>
               {props.msg.value.inputs.map((data,i) =>{
                    return <li key={i}><Account address={data.address}/> sent {data.coins.map((coin, j) =>{
                            return <em key={j} className="text-success">{numbro(coin.amount).format("0,0")} {coin.denom}</em>
                        })}
                    </li>
               })}
            </ul>
            to the following receipient(s)
            <ul>
               {props.msg.value.outputs.map((data,i) =>{
                    return <li key={i}><Account address={data.address}/> received {data.coins.map((coin,j) =>{
                        return <em key={j} className="text-success">{numbro(coin.amount).format("0,0")} {coin.denom}</em>
                    })}</li>
               })}
            </ul>
        </p>
    </div>
}

export default class Activites extends Component {
    constructor(props){
        super(props);
    }

    render(){
        // console.log(this.props);
        let msg = this.props.msg;
        switch (msg.type){
            // bank
            case "payMsgSend":
                let amount = '';
                for (let a in msg.value.amount){
                    if (a > 0){
                        amount += ', '+numbro(msg.value.amount[a].amount).format("0,0")+" "+msg.value.amount[a].denom;
                    }
                    else{
                        amount += numbro(msg.value.amount[a].amount).format("0,0")+" "+msg.value.amount[a].denom;
                    }
                }
                return <p><Account address={msg.value.from_address} /> {(this.props.invalid)?"failed to ":''}<MsgType type={msg.type} /> <em className="text-success">{amount}</em> to <span className="address"><Account address={msg.value.to_address} /></span>.</p>
            case "pay/MsgMultiSend":
                return <MultiSend msg={msg} />
            
            // staking
            case "cosmos-sdk/MsgCreateValidator":
                return <p><Account address={msg.value.delegator_address}/> {(this.props.invalid)?"failed to ":''}<MsgType type={msg.type} /> operating at <span className="address"><Account address={msg.value.validator_address}/></span> with moniker <Link to="#">{msg.value.description.moniker}</Link>.</p>
            case "cosmos-sdk/MsgEditValidator":
                return <p><Account address={msg.value.address}/> {(this.props.invalid)?"failed to ":''}<MsgType type={msg.type} /></p>
            case "cosmos-sdk/MsgDelegate":
                return <p><Account address={msg.value.delegator_address}/> {(this.props.invalid)?"failed to ":''}<MsgType type={msg.type} /> <em className="text-warning">{numbro(msg.value.amount.amount).format("0,0")} {msg.value.amount.denom}</em> to <Account address={msg.value.validator_address} />.</p>
            case "cosmos-sdk/MsgUndelegate":
                return <p><Account address={msg.value.delegator_address} /> {(this.props.invalid)?"failed to ":''}<MsgType type={msg.type} /> <em className="text-warning">{numbro(msg.value.amount.amount).format("0,0")} {msg.value.amount.denom}</em> from <Account address={msg.value.validator_address} />.</p>
            case "cosmos-sdk/MsgBeginRedelegate":
                return <p><Account address={msg.value.delegator_address} /> {(this.props.invalid)?"failed to ":''}<MsgType type={msg.type} /> <em className="text-warning">{numbro(msg.value.amount.amount).format("0,0")} {msg.value.amount.denom}</em> from <Account address={msg.value.validator_src_address} /> to <Account address={msg.value.validator_dst_address} />.</p>            
            
            // distribution
            case "cosmos-sdk/MsgWithdrawValidatorCommission":
                return <p><Account address={msg.value.validator_address} /> {(this.props.invalid)?"failed to ":''}<MsgType type={msg.type} />.</p>
            case "cosmos-sdk/MsgWithdrawDelegationReward":
                return <p><Account address={msg.value.delegator_address}/> {(this.props.invalid)?"failed to ":''}<MsgType type={msg.type} /> from <Account address={msg.value.validator_address} />.</p>
            case "cosmos-sdk/MsgModifyWithdrawAddress":
                return <p><Account address={msg.value.delegator_address}/> {(this.props.invalid)?"failed to ":''}<MsgType type={msg.type} /></p>
    
            // slashing
            case "cosmos-sdk/MsgUnjail":
                return <p><Account address={msg.value.delegator_address}/> {(this.props.invalid)?"failed to ":''}<MsgType type={msg.type} />.</p>
            
            // ibc
            case "cosmos-sdk/IBCTransferMsg":
                return <MsgType type={msg.type} />
            case "cosmos-sdk/IBCReceiveMsg":
                return <MsgType type={msg.type} />

            // market
            case "market/MsgSwap":
                return <p><Account address={msg.value.trader}/> {(this.props.invalid)?"failed to ":''}<MsgType type={msg.type} /> <em className="text-info">{numbro(msg.value.offer_coin.amount).format("0,0")} {msg.value.offer_coin.denom}</em> to <em className="text-info">{msg.value.ask_denom}</em>.</p>
        
            // oracle
            case "oracle/MsgPriceVote":
                return <p><Account address={msg.value.validator}/> {(this.props.invalid)?"failed to ":''}<MsgType type={msg.type} /> <em className="text-dark">{msg.value.denom}</em> at <em className="text-dark">{numbro(msg.value.price).format("0,0.0000")}</em>.</p>
            case "oracle/MsgPricePrevote":
                return <p><Account address={msg.value.validator}/> {(this.props.invalid)?"failed to ":''}<MsgType type={msg.type} /> <em className="text-dark">{msg.value.denom}</em>.</p>
                
            // budget
            case "budget/MsgSubmitProgram":
                return <p><MsgType type={msg.type} /></p>
            case "budget/MsgWithdrawProgram":
                return <p><MsgType type={msg.type} /></p>
            case "budget/MsgVoteProgram":
                return <p><MsgType type={msg.type} /></p>
            
            default:
                return <div>{JSON.stringify(msg.value)}</div>
        }
    }
}