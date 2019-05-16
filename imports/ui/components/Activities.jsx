import React, {Component } from 'react';
import { MsgType } from './MsgType.jsx';
import { Link } from 'react-router-dom';
import numbro from 'numbro';
import Account from '../components/Account.jsx';
import i18n from 'meteor/universe:i18n';

const T = i18n.createComponent();

MultiSend = (props) => {
    return <div>
        <p><T>activities.single</T> <MsgType type={props.msg.type} /> <T>activities.happened</T></p>
        <p><T>activities.senders</T>
            <ul>
                {props.msg.value.inputs.map((data,i) =>{
                    return <li key={i}><Account address={data.address}/> <T>activities.sent</T> {data.coins.map((coin, j) =>{
                        return <em key={j} className="text-success">{numbro(coin.amount).format("0,0")} {coin.denom}</em>
                    })}
                    </li>
                })}
            </ul>
            <T>activities.receivers</T>
            <ul>
                {props.msg.value.outputs.map((data,i) =>{
                    return <li key={i}><Account address={data.address}/> <T>activities.received</T> {data.coins.map((coin,j) =>{
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
        case "irishub/bank/Send":
            let amount = '';
            for (let a in msg.value.inputs[0].coins){
                if (a > 0){
                    amount += ', '+numbro(msg.value.inputs[0].coins[a].amount).format("0,0a")+" "+msg.value.inputs[0].coins[a].denom;
                }
                else{
                    amount += numbro(msg.value.inputs[0].coins[a].amount).format("0,0a")+" "+msg.value.inputs[0].coins[a].denom;
                }
            }
            return <p><Account address={msg.value.inputs[0].address} /> {(this.props.invalid)?<T>activities.failedTo</T>:''}<MsgType type={msg.type} /> <em className="text-success">{amount}</em> <T>activities.to</T> <Account address={msg.value.outputs[0].address} /><T>common.fullStop</T></p>
            // staking
        case "irishub/stake/MsgCreateValidator":
            return <p><Account address={msg.value.delegator_addr}/> {(this.props.invalid)?<T>activities.failedTo</T>:''}<MsgType type={msg.type} /> <T>activities.operatingAt</T> <span className="address"><Account address={msg.value.validator_addr}/></span> <T>activities.withMoniker</T> <Link to="#">{msg.value.description.moniker}</Link><T>common.fullStop</T></p>
        case "irishub/stake/MsgEditValidator":
            return <p><Account address={msg.value.address}/> {(this.props.invalid)?<T>activities.failedTo</T>:''}<MsgType type={msg.type} /> <T>activities.withValues</T> <div>
                <div><span className="label"><T>validators.moniker</T></span>: {msg.value.Description.moniker}</div>
                <div><span className="label"><T>validators.identity</T></span>: {msg.value.Description.identity}</div>
                <div><span className="label"><T>validators.website</T></span>: {msg.value.Description.website}</div>
                <div><span className="label"><T>validators.details</T></span>: {msg.value.Description.details}</div>
                <div><span className="label"><T>validators.commissionRate</T></span>: {(msg.value.commission_rate)?numbro(msg.value.commission_rate).format("0.00%"):<T>common.notAvailable</T>}</div>
            </div></p>
        case "irishub/stake/MsgDelegate":
            return <p><Account address={msg.value.delegator_addr}/> {(this.props.invalid)?<T>activities.failedTo</T>:''}<MsgType type={msg.type} /> <em className="text-warning">{numbro(msg.value.delegation.amount).format("0,0")} {msg.value.delegation.denom}</em> <T>activities.to</T> <Account address={msg.value.validator_addr} /><T>common.fullStop</T></p>
        case "irishub/stake/BeginUnbonding":
            return <p><Account address={msg.value.delegator_addr} /> {(this.props.invalid)?<T>activities.failedTo</T>:''}<MsgType type={msg.type} /> <em className="text-warning">{numbro(msg.value.shares_amount).format("0,0")} <T>accounts.shares</T></em> <T>activities.from</T> <Account address={msg.value.validator_addr} /><T>common.fullStop</T></p>
        case "irishub/stake/BeginRedelegate":
            return <p><Account address={msg.value.delegator_addr} /> {(this.props.invalid)?<T>activities.failedTo</T>:''}<MsgType type={msg.type} /> <em className="text-warning">{numbro(msg.value.delegation.amount).format("0,0")} {msg.value.delegation.denom}</em> <T>activities.from</T> <Account address={msg.value.validator_src_addr} /> <T>activities.to</T> <Account address={msg.value.validator_dst_addr} /><T>common.fullStop</T></p>
            
            // gov
        case "irishub/gov/MsgSubmitProposal":
            return <p><Account address={msg.value.proposer} /> {(this.props.invalid)?<T>activities.failedTo</T>:''}<MsgType type={msg.type} /> <T>activities.withTitle</T> <Link to={"/proposals/"+this.props.tags[2].value}>{msg.value.title}</Link><T>common.fullStop</T></p>
        case "irishub/gov/MsgDeposit":
            return <p><Account address={msg.value.depositor} /> {(this.props.invalid)?<T>activities.failedTo</T>:''}<MsgType type={msg.type} /> <em className="text-info">{msg.value.amount.map((amount,i) =>{
                if (i>0){
                    return " ,"+numbro(amount.amount).format("0,0")+" "+amount.denom;
                }
                else{
                    return numbro(amount.amount).format("0,0")+" "+amount.denom;
                }
            })}</em> <T>activities.to</T> <Link to={"/proposals/"+msg.value.proposal_id}><T>proposals.proposal</T> {msg.value.proposal_id}</Link><T>common.fullStop</T></p>
        case "irishub/gov/MsgVote":
            return <p><Account address={msg.value.voter} /> {(this.props.invalid)?<T>activities.failedTo</T>:''}<MsgType type={msg.type} />  <Link to={"/proposals/"+msg.value.proposal_id}><T>activities.proposal</T> {msg.value.proposal_id}</Link> <T>activities.withA</T> <em className="text-info">{msg.value.option}</em><T>common.fullStop</T></p>
            
            // distribution
        case "irishub/distr/MsgWithdrawDelegationRewardsAll":
            return <p><Account address={msg.value.delegator_addr} /> <MsgType type={msg.type} />.</p>    
        case "irishub/distr/MsgWithdrawValidatorRewardsAll":
            return <p><Account address={msg.value.validator_addr} /> {(this.props.invalid)?<T>activities.failedTo</T>:''}<MsgType type={msg.type} /><T>common.fullStop</T></p>
        case "irishub/distr/MsgWithdrawDelegationReward":
            return <p><Account address={msg.value.delegator_addr}/> {(this.props.invalid)?<T>activities.failedTo</T>:''}<MsgType type={msg.type} /> <T>activities.from</T> <Account address={msg.value.validator_addr} /><T>common.fullStop</T></p>
        case "irishub/distr/MsgModifyWithdrawAddress":
            return <p><Account address={msg.value.delegator_addr}/> {(this.props.invalid)?<T>activities.failedTo</T>:''}<MsgType type={msg.type} /></p>
    
            // slashing
        case "irishub/slashing/MsgUnjail":
            return <p><Account address={msg.value.delegator_addr}/> {(this.props.invalid)?<T>activities.failedTo</T>:''}<MsgType type={msg.type} /><T>common.fullStop</T></p>
            
    
        default:
            return <div>{JSON.stringify(msg.value)}</div>
        }
    }
}