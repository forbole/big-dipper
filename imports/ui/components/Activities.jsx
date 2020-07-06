import React, {Component } from 'react';
import { MsgType } from './MsgType.jsx';
import { Link } from 'react-router-dom';
import Account from '../components/Account.jsx';
import i18n from 'meteor/universe:i18n';
import Coin from '/both/utils/coins.js'
import JSONPretty from 'react-json-pretty';
import _ from 'lodash';
import Starname from '../components/Starname.jsx';
import Msg from '../components/Msg.jsx';

const T = i18n.createComponent();

MultiSend = (props) => {
    return <div>
        <p><T>activities.single</T> <MsgType type={props.msg.type} /> <T>activities.happened</T></p>
        <p><T>activities.senders</T>
            <ul>
                {props.msg.value.inputs.map((data,i) =>{
                    return <li key={i}><Account address={data.address}/> <T>activities.sent</T> {data.coins.map((coin, j) =>{
                        return <span key={j} className="text-success">{new Coin(coin.amount, coin.denom).toString()}</span>
                    })}
                    </li>
                })}
            </ul>
            <T>activities.receivers</T>
            <ul>
                {props.msg.value.outputs.map((data,i) =>{
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
        const msgJson = encodeURIComponent( JSON.stringify( msg ) );
        const events = [];
        for (let i in this.props.events){
            events[this.props.events[i].type] = this.props.events[i].attributes
        }

        switch (msg.type){
        // starname
        case "domain/AddAccountCertificates":
            return <p><span className="text-primary"><Starname starname={`${msg.value.name}*${msg.value.domain}`} /></span> {(this.props.invalid)?<T>activities.failedTo</T>:''}<Msg msgJson={msgJson} /><T>common.fullStop</T></p>
        case "domain/DeleteAccount":
            return <p><Account address={msg.value.fee_payer.length?msg.value.fee_payer:msg.value.owner} /> {(this.props.invalid)?<T>activities.failedTo</T>:''}<Msg msgJson={msgJson} /> <span className="text-primary"><Starname starname={`${msg.value.name}*${msg.value.domain}`} /></span><T>common.fullStop</T></p>
        case "domain/DeleteAccountCertificates":
            return <p><span className="text-warning"><Starname starname={`${msg.value.name}*${msg.value.domain}`} /></span> {(this.props.invalid)?<T>activities.failedTo</T>:''}<Msg msgJson={msgJson} /><T>common.fullStop</T></p>
        case "domain/DeleteDomain":
            return <p><Account address={msg.value.fee_payer.length?msg.value.fee_payer:msg.value.owner} /> {(this.props.invalid)?<T>activities.failedTo</T>:''}<Msg msgJson={msgJson} /> <span className="text-primary">*{msg.value.domain}</span><T>common.fullStop</T></p>
        case "domain/RegisterAccount":
            return <p><Account address={msg.value.owner} /> {(this.props.invalid)?<T>activities.failedTo</T>:''}<Msg msgJson={msgJson} /> <span className="text-primary"><Starname starname={`${msg.value.name}*${msg.value.domain}`} /></span><T>common.fullStop</T></p>
        case "domain/RegisterDomain":
            return <p><Account address={msg.value.admin} /> {(this.props.invalid)?<T>activities.failedTo</T>:''}<Msg msgJson={msgJson} /> <span className="text-primary"><Starname starname={`*${msg.value.domain}`} /></span><T>common.fullStop</T></p>
        case "domain/RenewAccount":
            return <p><Account address={msg.value.signer} /> {(this.props.invalid)?<T>activities.failedTo</T>:''}<Msg msgJson={msgJson} /> <span className="text-primary"><Starname starname={`${msg.value.name}*${msg.value.domain}`} /></span><T>common.fullStop</T></p>
        case "domain/RenewDomain":
            return <p><Account address={msg.value.signer} /> {(this.props.invalid)?<T>activities.failedTo</T>:''}<Msg msgJson={msgJson} /> <span className="text-primary"><Starname starname={`*${msg.value.domain}`} /></span><T>common.fullStop</T></p>
        case "domain/ReplaceAccountResources":
            return <p><span className="text-primary"><Starname starname={`${msg.value.name}*${msg.value.domain}`} /></span> {(this.props.invalid)?<T>activities.failedTo</T>:''}<Msg msgJson={msgJson} /><T>common.fullStop</T></p>
        case "domain/SetAccountMetadata":
            return <p><span className="text-primary"><Starname starname={`${msg.value.name}*${msg.value.domain}`} /></span> {(this.props.invalid)?<T>activities.failedTo</T>:''}<Msg msgJson={msgJson} /><T>common.fullStop</T></p>
        case "domain/TransferAccount":
            return <p><Account address={msg.value.owner} /> {(this.props.invalid)?<T>activities.failedTo</T>:''}<Msg msgJson={msgJson} /> <span className="text-primary"><Starname starname={`${msg.value.name}*${msg.value.domain}`} /></span> <T>activities.to</T> <span className="address"><Account address={msg.value.new_owner} /></span><T>common.fullStop</T></p>
        case "domain/TransferDomainAll":
            return <p><Account address={msg.value.owner} /> {(this.props.invalid)?<T>activities.failedTo</T>:''}<Msg msgJson={msgJson} /> <span className="text-primary"><Starname starname={`*${msg.value.domain}`} /></span> <T>activities.to</T> <span className="address"><Account address={msg.value.new_admin} /></span><T>common.fullStop</T></p>

            // bank
        case "cosmos-sdk/MsgSend":
            let amount = '';
            amount = msg.value.amount.map((coin) => new Coin(coin.amount, coin.denom).toString()).join(', ')
            return <p><Account address={msg.value.from_address} /> {(this.props.invalid)?<T>activities.failedTo</T>:''}<Msg msgJson={msgJson} /> <span className="text-success">{amount}</span> <T>activities.to</T> <span className="address"><Account address={msg.value.to_address} /></span><T>common.fullStop</T></p>
        case "cosmos-sdk/MsgMultiSend":
            return <MultiSend msg={msg} />

            // staking
        case "cosmos-sdk/MsgCreateValidator":
            return <p><Account address={msg.value.delegator_address}/> {(this.props.invalid)?<T>activities.failedTo</T>:''}<Msg msgJson={msgJson} /> <T>activities.operatingAt</T> <span className="address"><Account address={msg.value.validator_address}/></span> <T>activities.withMoniker</T> <Link to="#">{msg.value.description.moniker}</Link><T>common.fullStop</T></p>
        case "cosmos-sdk/MsgEditValidator":
            return <p><Account address={msg.value.address}/> {(this.props.invalid)?<T>activities.failedTo</T>:''}<Msg msgJson={msgJson} /></p>
        case "cosmos-sdk/MsgDelegate":
            return <p><Account address={msg.value.delegator_address}/> {(this.props.invalid)?<T>activities.failedTo</T>:''}<Msg msgJson={msgJson} /> <span className="text-warning">{new Coin(msg.value.amount.amount, msg.value.amount.denom).toString(6)}</span> <T>activities.to</T> <Account address={msg.value.validator_address} /><T>common.fullStop</T></p>
        case "cosmos-sdk/MsgUndelegate":
            return <p><Account address={msg.value.delegator_address} /> {(this.props.invalid)?<T>activities.failedTo</T>:''}<Msg msgJson={msgJson} /> <span className="text-warning">{new Coin(msg.value.amount.amount, msg.value.amount.denom).toString(6)}</span> <T>activities.from</T> <Account address={msg.value.validator_address} /><T>common.fullStop</T></p>
        case "cosmos-sdk/MsgBeginRedelegate":
            return <p><Account address={msg.value.delegator_address} /> {(this.props.invalid)?<T>activities.failedTo</T>:''}<Msg msgJson={msgJson} /> <span className="text-warning">{new Coin(msg.value.amount.amount, msg.value.amount.denom).toString(6)}</span> <T>activities.from</T> <Account address={msg.value.validator_src_address} /> <T>activities.to</T> <Account address={msg.value.validator_dst_address} /><T>common.fullStop</T></p>

            // gov
        case "cosmos-sdk/MsgSubmitProposal":
            const proposalId = _.get(this.props, 'events[2].attributes[0].value', null)
            const proposalLink = proposalId ? `/proposals/${proposalId}` : "#";
            return <p><Account address={msg.value.proposer} /> <Msg msgJson={msgJson} /> <T>activities.withTitle</T> <Link to={proposalLink}>{msg.value.content.value.title}</Link><T>common.fullStop</T></p>
        case "cosmos-sdk/MsgDeposit":
            return <p><Account address={msg.value.depositor} /> {(this.props.invalid)?<T>activities.failedTo</T>:''}<Msg msgJson={msgJson} /> <em className="text-info">{msg.value.amount.map((amount,i) =>new Coin(amount.amount, amount.denom).toString(6)).join(', ')}</em> <T>activities.to</T> <Link to={"/proposals/"+msg.value.proposal_id}><T>proposals.proposal</T> {msg.value.proposal_id}</Link><T>common.fullStop</T></p>
        case "cosmos-sdk/MsgVote":
            return <p><Account address={msg.value.voter} /> {(this.props.invalid)?<T>activities.failedTo</T>:''}<Msg msgJson={msgJson} />  <Link to={"/proposals/"+msg.value.proposal_id}><T>proposals.proposal</T> {msg.value.proposal_id}</Link> <T>activities.withA</T> <em className="text-info">{msg.value.option}</em><T>common.fullStop</T></p>

            // distribution
        case "cosmos-sdk/MsgWithdrawValidatorCommission":
            return <p><Account address={msg.value.validator_address} /> {(this.props.invalid)?<T>activities.failedTo</T>:''}<Msg msgJson={msgJson} /><T> {(!this.props.invalid)?<T _purify={false} amount={new Coin(parseInt(events['withdraw_commission'][0].value), events['withdraw_commission'][0].value.replace(/[0-9]/g, '')).toString(6)}>activities.withAmount</T>:''}common.fullStop</T></p>
        case "cosmos-sdk/MsgWithdrawDelegationReward":
            return <p><Account address={msg.value.delegator_address}/> {(this.props.invalid)?<T>activities.failedTo</T>:''}<Msg msgJson={msgJson} /> {(!this.props.invalid)?<T _purify={false} amount={new Coin(parseInt(events['withdraw_rewards'][0].value), events['withdraw_rewards'][0].value.replace(/[0-9]/g, '')).toString(6)}>activities.withAmount</T>:''} <T>activities.from</T> <Account address={msg.value.validator_address} /><T>common.fullStop</T></p>
        case "cosmos-sdk/MsgModifyWithdrawAddress":
            return <p><Account address={msg.value.delegator_address}/> {(this.props.invalid)?<T>activities.failedTo</T>:''}<Msg msgJson={msgJson} /></p>

            // slashing
        case "cosmos-sdk/MsgUnjail":
            return <p><Account address={msg.value.address}/> {(this.props.invalid)?<T>activities.failedTo</T>:''}<Msg msgJson={msgJson} /><T>common.fullStop</T></p>

            // ibc
        case "cosmos-sdk/IBCTransferMsg":
            return <Msg msgJson={msgJson} />
        case "cosmos-sdk/IBCReceiveMsg":
            return <Msg msgJson={msgJson} />

        default:
            return <div><JSONPretty id="json-pretty" data={msg}></JSONPretty></div>
        }
    }
}
