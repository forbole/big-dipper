import React, {Component } from 'react';
import { MsgType } from './MsgType.jsx';
import { Link } from 'react-router-dom';
import Account from '../components/Account.jsx';
import i18n from 'meteor/universe:i18n';
import Coin from '/both/utils/coins.js'
import ReactJson from 'react-json-view'
import _ from 'lodash';

const T = i18n.createComponent();

MultiSend = (props) => {
    return <div>
        <p><T>activities.single</T> <MsgType type={props.msg.type} /> <T>activities.happened</T></p>
        <p><T>activities.senders</T>
            <ul>
                {props.msg.inputs.map((data,i) =>{
                    return <li key={i}><Account address={data.address}/> <T>activities.sent</T> {data.coins.map((coin, j) =>{
                        return <span key={j} className="text-success">{new Coin(coin.amount, coin.denom).toString()}</span>
                    })}
                    </li>
                })}
            </ul>
            <T>activities.receivers</T>
            <ul>
                {props.msg.outputs.map((data,i) =>{
                    return <li key={i}><Account address={data.address}/> <T>activities.received</T> {data.coins.map((coin,j) =>{
                        return <span key={j} className="text-success">{new Coin(coin.amount, coin.denom).toString()}</span>
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
        const msg = this.props.msg;
        const events = [];
        for (let i in this.props.events){
            events[this.props.events[i].type] = this.props.events[i].attributes
        }
        
        switch (msg["@type"]){
        // bank
        case "/cosmos.bank.v1beta1.MsgSend":
            let amount = '';
            amount = msg.amount.map((coin) => new Coin(coin.amount, coin.denom).toString()).join(', ')
            return <p><Account address={msg.from_address} /> {(this.props.invalid)?<T>activities.failedTo</T>:''}<MsgType type={msg["@type"]} /> <span className="text-success">{amount}</span> <T>activities.to</T> <span className="address"><Account address={msg.to_address} /></span><T>common.fullStop</T></p>
        case "/cosmos.bank.v1beta1.MsgMultiSend":
            return <MultiSend msg={msg} />

            // staking
        case "/cosmos.staking.v1beta1.MsgCreateValidator":
            return <p><Account address={msg.delegator_address}/> {(this.props.invalid)?<T>activities.failedTo</T>:''}<MsgType type={msg["@type"]} /> <T>activities.operatingAt</T> <span className="address"><Account address={msg.validator_address}/></span> <T>activities.withMoniker</T> <Link to="#">{msg.description.moniker}</Link><T>common.fullStop</T></p>
        case "/cosmos.staking.v1beta1.MsgEditValidator":
            return <p><Account address={msg.address}/> {(this.props.invalid)?<T>activities.failedTo</T>:''}<MsgType type={msg["@type"]} /></p>
        case "/cosmos.staking.v1beta1.MsgDelegate":
            return <p><Account address={msg.delegator_address}/> {(this.props.invalid)?<T>activities.failedTo</T>:''}<MsgType type={msg["@type"]} /> <span className="text-warning">{new Coin(msg.amount.amount, msg.amount.denom).toString(6)}</span> <T>activities.to</T> <Account address={msg.validator_address} /><T>common.fullStop</T></p>
        case "/cosmos.staking.v1beta1.MsgUndelegate":
            return <p><Account address={msg.delegator_address} /> {(this.props.invalid)?<T>activities.failedTo</T>:''}<MsgType type={msg["@type"]} /> <span className="text-warning">{new Coin(msg.amount.amount, msg.amount.denom).toString(6)}</span> <T>activities.from</T> <Account address={msg.validator_address} /><T>common.fullStop</T></p>
        case "/cosmos.staking.v1beta1.MsgBeginRedelegate":
            return <p><Account address={msg.delegator_address} /> {(this.props.invalid)?<T>activities.failedTo</T>:''}<MsgType type={msg["@type"]} /> <span className="text-warning">{new Coin(msg.amount.amount, msg.amount.denom).toString(6)}</span> <T>activities.from</T> <Account address={msg.validator_src_address} /> <T>activities.to</T> <Account address={msg.validator_dst_address} /><T>common.fullStop</T></p>

            // gov
        case "/cosmos.gov.v1beta1.MsgSubmitProposal":
            const proposalId = _.get(this.props, 'events[2].attributes[0].value', null)
            const proposalLink = proposalId ? `/proposals/${proposalId}` : "#";
            return <p><Account address={msg.proposer} /> <MsgType type={msg["@type"]} /> <T>activities.withTitle</T> <Link to={proposalLink}>{msg.content.value.title}</Link><T>common.fullStop</T></p>
        case "/cosmos.gov.v1beta1.MsgDeposit":
            return <p><Account address={msg.depositor} /> {(this.props.invalid)?<T>activities.failedTo</T>:''}<MsgType type={msg["@type"]} /> <em className="text-info">{msg.amount.map((amount,i) =>new Coin(amount.amount, amount.denom).toString(6)).join(', ')}</em> <T>activities.to</T> <Link to={"/proposals/"+msg.proposal_id}><T>proposals.proposal</T> {msg.proposal_id}</Link><T>common.fullStop</T></p>
        case "/cosmos.gov.v1beta1.MsgVote":
            return <p><Account address={msg.voter} /> {(this.props.invalid)?<T>activities.failedTo</T>:''}<MsgType type={msg["@type"]} />  <Link to={"/proposals/"+msg.proposal_id}><T>proposals.proposal</T> {msg.proposal_id}</Link> <T>activities.withA</T> <em className="text-info">{msg.option}</em><T>common.fullStop</T></p>

            // distribution
        case "/cosmos.distribution.v1beta1.MsgWithdrawValidatorCommission":
            return <p><Account address={msg.validator_address} /> {(this.props.invalid)?<T>activities.failedTo</T>:''}<MsgType type={msg["@type"]} /><T> {(!this.props.invalid)?<T _purify={false} amount={new Coin(parseInt(events['withdraw_commission'][0].value), events['withdraw_commission'][0].value.replace(/[0-9]/g, '')).toString(6)}>activities.withAmount</T>:''}common.fullStop</T></p>
        case "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward":
            return <p><Account address={msg.delegator_address}/> {(this.props.invalid)?<T>activities.failedTo</T>:''}<MsgType type={msg["@type"]} /> {(!this.props.invalid)?<T _purify={false} amount={new Coin(parseInt(events['withdraw_rewards'][0].value), events['withdraw_rewards'][0].value.replace(/[0-9]/g, '')).toString(6)}>activities.withAmount</T>:''} <T>activities.from</T> <Account address={msg.validator_address} /><T>common.fullStop</T></p>
        case "/cosmos.distribution.v1beta1.MsgModifyWithdrawAddress":
            return <p><Account address={msg.delegator_address}/> {(this.props.invalid)?<T>activities.failedTo</T>:''}<MsgType type={msg["@type"]} /></p>

            // slashing
        case "/cosmos.slashing.v1beta1.MsgUnjail":
            return <p><Account address={msg.address}/> {(this.props.invalid)?<T>activities.failedTo</T>:''}<MsgType type={msg["@type"]} /><T>common.fullStop</T></p>

            // ibc
        case "/cosmos.IBCTransferMsg":
            return <MsgType type={msg["@type"]} />
        case "/cosmos.IBCReceiveMsg":
            return <MsgType type={msg["@type"]} />

        default:
            return <div><ReactJson src={msg} /></div>
        }
    }
}
