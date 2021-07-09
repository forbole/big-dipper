import React, {Component } from 'react';
import { MsgType } from './MsgType.jsx';
import { Link } from 'react-router-dom';
import Account from '../components/Account.jsx';
import i18n from 'meteor/universe:i18n';
import Coin from '/both/utils/coins.js'
import ReactJson from 'react-json-view'
import { Table, Collapse } from 'reactstrap';
import _ from 'lodash';

const T = i18n.createComponent();

MultiSend = (props) => {
    return <div>
        <p><T>activities.senders</T>
            <ul>
                {props.msg.inputs.map((data,i) =>{
                    return <li key={i}><Account address={data.address}/> <T>activities.sent</T> {data.coins.map((coin, j) =>{
                        return <span key={j} className="text-success">{new Coin(coin.amount, coin.denom).toString(6)}</span>
                    })}
                    </li>
                })}
            </ul>
            <T>activities.receivers</T>
            <ul>
                {props.msg.outputs.map((data,i) =>{
                    return <li key={i}><Account address={data.address}/> <T>activities.received</T> {data.coins.map((coin,j) =>{
                        return <span key={j} className="text-success">{new Coin(coin.amount, coin.denom).toString(6)}</span>
                    })}</li>
                })}
            </ul>
        </p>
    </div>
}

export default class Activites extends Component {
    constructor(props){
        super(props);
        this.toggle = this.toggle.bind(this);

        this.state = {
            isOpen: false
        };
    }

    toggle() {
        this.setState({
            isOpen: !this.state.isOpen
        }, () => {
        });
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
            amount = msg.amount.map((coin) => new Coin(coin.amount, coin.denom).toString(6)).join(', ')
            return <p><Account address={msg.from_address} /> {(this.props.invalid)?<T>activities.failedTo</T>:''}<MsgType type={msg["@type"]} /> <span className="text-success">{amount}</span> <T>activities.to</T> <span className="address"><Account address={msg.to_address} /></span><T>common.fullStop</T></p>
        case "/cosmos.bank.v1beta1.MsgMultiSend":
            return <div>
                <Account address={msg.inputs[0].address} /> {(this.props.invalid) ? <T>activities.failedTo</T> : ''}<MsgType type={msg["@type"]} />
                <div className="d-inline">
                    <span className="float-right"><i className="material-icons" onClick={this.toggle}>{this.state.isOpen ? 'arrow_drop_down' : 'arrow_left'}</i></span>
                    <Collapse isOpen={this.state.isOpen}>
                        <MultiSend msg={msg} />
                    </Collapse>
                </div>
            </div>

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
            return <p><Account address={msg.validator_address} /> {(this.props.invalid)?<T>activities.failedTo</T>:''}<MsgType type={msg["@type"]} /> {(!this.props.invalid)?<T _purify={false} amount={new Coin(parseInt(events['withdraw_commission'][0].value), events['withdraw_commission'][0].value.replace(/[0-9]/g, '')).toString(6)}>activities.withAmount</T>:''}  <T>common.fullStop</T></p>
        case "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward":
            return <p><Account address={msg.delegator_address} /> {(this.props.invalid) ? <T>activities.failedTo</T> : ''}<MsgType type={msg["@type"]} /> {(!this.props.invalid) ? events['withdraw_rewards'][0].value ? <T _purify={false} amount={new Coin(parseInt(events['withdraw_rewards'][0].value), events['withdraw_rewards'][0].value.replace(/[0-9]/g, '')).toString(6)}>activities.withAmount</T> : null :''} <T>activities.from</T> <Account address={msg.validator_address} /><T>common.fullStop</T></p>
        case "/cosmos.distribution.v1beta1.MsgModifyWithdrawAddress":
            return <p><Account address={msg.delegator_address}/> {(this.props.invalid)?<T>activities.failedTo</T>:''}<MsgType type={msg["@type"]} /></p>

            // slashing
        case "/cosmos.slashing.v1beta1.MsgUnjail":
            return <p><Account address={msg.address}/> {(this.props.invalid)?<T>activities.failedTo</T>:''}<MsgType type={msg["@type"]} /><T>common.fullStop</T></p>

            // ibc
        case "/cosmos.IBCTransferMsg":
            return <div>
                <Account address={msg.signer} /> {(this.props.invalid) ? <T>activities.failedTo</T> : ''}<MsgType type={msg["@type"]} />
            </div>
        case "/cosmos.IBCReceiveMsg":
            return <div>
                <Account address={msg.signer} /> {(this.props.invalid) ? <T>activities.failedTo</T> : ''}<MsgType type={msg["@type"]} /> 
            </div>

            // IBC Client
        case "/ibc.core.client.v1.MsgCreateClient":
            return <div>
                <Account address={msg.signer} /> {(this.props.invalid) ? <T>activities.failedTo</T> : ''}<MsgType type={msg["@type"]} />
                <div className="d-inline">
                    <span className="float-right"><i className="material-icons" onClick={this.toggle}>{this.state.isOpen ? 'arrow_drop_down' : 'arrow_left'}</i></span>
                    <Collapse isOpen={this.state.isOpen}>
                        <Table striped className="mt-3">
                            <tbody>
                                <tr>
                                    <th><T>common.chainID</T></th>
                                    <td>{msg?.client_state?.chain_id}</td>
                                </tr>

                            </tbody>
                        </Table>
                    </Collapse>
                </div>
            </div>
        case "/ibc.core.client.v1.MsgUpdateClient":
            return <div>
                <Account address={msg.signer} /> {(this.props.invalid) ? <T>activities.failedTo</T> : ''}<MsgType type={msg["@type"]} /> 
                <div className="d-inline">
                    <span className="float-right"><i className="material-icons" onClick={this.toggle} >{this.state.isOpen ? 'arrow_drop_down' : 'arrow_left'}</i></span>
                    <Collapse isOpen={this.state.isOpen} style={{paddingBottom: this.state.isOpen ? "1rem" : "0"}}>
                        <Table striped className="mt-3">
                            <tbody>
                                <tr>
                                    <th><T>common.chainID</T></th>
                                    <td>{msg?.header?.signed_header?.header?.chain_id}</td>
                                </tr>
                                <tr>
                                    <th><T>common.clientID</T></th>
                                    <td>{msg?.client_id}</td>
                                </tr>
                            </tbody>
                        </Table>
                    </Collapse>
                </div>
            </div>
        case "/ibc.core.client.v1.MsgUpgradeClient": 
            return <div>
                <Account address={msg.signer} /> {(this.props.invalid) ? <T>activities.failedTo</T> : ''}<MsgType type={msg["@type"]} />
                <div className="d-inline">
                    <span className="float-right"><i className="material-icons" onClick={this.toggle} >{this.state.isOpen ? 'arrow_drop_down' : 'arrow_left'}</i></span>
                    <Collapse isOpen={this.state.isOpen} style={{ paddingBottom: this.state.isOpen ? "1rem" : "0" }}>
                        <Table striped className="mt-3">
                            <tbody>
                                <tr>
                                    <th><T>common.clientID</T></th>
                                    <td>{msg?.client_id}</td>
                                </tr>
                                <tr>
                                    <th><T>common.proofUpgradeClient</T></th>
                                    <td>{msg?.proof_upgrade_client}</td>
                                </tr>
                                <tr>
                                    <th><T>common.proofUpgradeConsensusState</T></th>
                                    <td>{msg?.proof_upgrade_consensus_state}</td>
                                </tr>
                            </tbody>
                        </Table>
                    </Collapse>
                </div>
            </div>
        case "/ibc.core.client.v1.MsgSubmitMisbehaviour":
            return <div>
                <Account address={msg.signer} /> {(this.props.invalid) ? <T>activities.failedTo</T> : ''}<MsgType type={msg["@type"]} />
                <div className="d-inline">
                    <span className="float-right"><i className="material-icons" onClick={this.toggle} >{this.state.isOpen ? 'arrow_drop_down' : 'arrow_left'}</i></span>
                    <Collapse isOpen={this.state.isOpen} style={{ paddingBottom: this.state.isOpen ? "1rem" : "0" }}>
                        <Table striped className="mt-3">
                            <tbody>
                                <tr>
                                    <th><T>common.clientID</T></th>
                                    <td>{msg?.client_id}</td>
                                </tr>
                                <tr>
                                    <th><T>common.misbehaviour</T></th>
                                    <td>{msg?.misbehaviour}</td>
                                </tr>
                            </tbody>
                        </Table>
                    </Collapse>
                </div>
            </div>
        case "/ibc.core.client.v1.Height":
            return <div>
                <Account address={msg.signer} /> {(this.props.invalid) ? <T>activities.failedTo</T> : ''}<MsgType type={msg["@type"]} />
            </div>

            // IBC Channel
        case "/ibc.core.channel.v1.MsgAcknowledgement":
            return <div>
                <Account address={msg.signer} /> {(this.props.invalid) ? <T>activities.failedTo</T> : ''}<MsgType type={msg["@type"]} />
                <div className="d-inline">
                    <span className="float-right"><i className="material-icons" onClick={this.toggle}>{this.state.isOpen ? 'arrow_drop_down' : 'arrow_left'}</i></span>
                    <Collapse isOpen={this.state.isOpen}>
                        <Table striped className="mt-3">
                            <tbody>
                                <tr>
                                    <th><T>common.sourceChannel</T></th>
                                    <td>{msg?.packet?.source_channel}</td>
                                </tr>
                                <tr>
                                    <th><T>common.destinationChannel</T></th>
                                    <td>{msg?.packet?.destination_channel}</td>
                                </tr>
                                <tr>
                                    <th><T>common.data</T></th>
                                    <td className="wrap-long-text">{msg?.packet?.data}</td>
                                </tr>
                                <tr>
                                    <th><T>common.acknowledgement</T></th>
                                    <td className="wrap-long-text">{msg?.acknowledgement}</td>
                                </tr>
                                <tr>
                                    <th><T>common.proofAcknowledgement</T></th>
                                    <td className="wrap-long-text">{msg?.proof_acked}</td>
                                </tr>
                            </tbody>
                        </Table>
                    </Collapse>
                </div>
            </div>
        case "/ibc.core.channel.v1.Channel":
            return <div>
                <Account address={msg.signer} /> {(this.props.invalid) ? <T>activities.failedTo</T> : ''}<MsgType type={msg["@type"]} />
            </div>
        case "/ibc.core.channel.v1.Counterparty":
            return <div>
                <Account address={msg.signer} /> {(this.props.invalid) ? <T>activities.failedTo</T> : ''}<MsgType type={msg["@type"]} />
            </div>
        case "/ibc.core.channel.v1.Packet":
            return <div>
                <Account address={msg.signer} /> {(this.props.invalid) ? <T>activities.failedTo</T> : ''}<MsgType type={msg["@type"]} />
            </div>
        case "/ibc.core.channel.v1.MsgChannelCloseConfirm":
            return <div>
                <Account address={msg.signer} /> {(this.props.invalid) ? <T>activities.failedTo</T> : ''}<MsgType type={msg["@type"]} />
                <div className="d-inline">
                    <span className="float-right"><i className="material-icons" onClick={this.toggle}>{this.state.isOpen ? 'arrow_drop_down' : 'arrow_left'}</i></span>
                    <Collapse isOpen={this.state.isOpen}>
                        <Table striped className="mt-3">
                            <tbody>
                                <tr>
                                    <th><T>common.portID</T></th>
                                    <td>{msg?.port_id}</td>
                                </tr>
                                <tr>
                                    <th><T>common.channelID</T></th>
                                    <td>{msg?.channel_id}</td>
                                </tr>
                                <tr>
                                    <th><T>common.proof</T></th>
                                    <td className="wrap-long-text">{msg?.proof_init}</td>
                                </tr>
                            </tbody>
                        </Table>
                    </Collapse>
                </div>
            </div>
        case "/ibc.core.channel.v1.MsgChannelCloseInit":
            return <div>
                <Account address={msg.signer} /> {(this.props.invalid) ? <T>activities.failedTo</T> : ''}<MsgType type={msg["@type"]} />
                <div className="d-inline">
                    <span className="float-right"><i className="material-icons" onClick={this.toggle}>{this.state.isOpen ? 'arrow_drop_down' : 'arrow_left'}</i></span>
                    <Collapse isOpen={this.state.isOpen}>
                        <Table striped className="mt-3">
                            <tbody>
                                <tr>
                                    <th><T>common.portID</T></th>
                                    <td>{msg?.port_id}</td>
                                </tr>
                                <tr>
                                    <th><T>common.channelID</T></th>
                                    <td>{msg?.channel_id}</td>
                                </tr>
                            </tbody>
                        </Table>
                    </Collapse>
                </div>
            </div>
        case "/ibc.core.channel.v1.MsgChannelOpenAck":
            return <div>
                <Account address={msg.signer} /> {(this.props.invalid) ? <T>activities.failedTo</T> : ''}<MsgType type={msg["@type"]} />
                <div className="d-inline">
                    <span className="float-right"><i className="material-icons" onClick={this.toggle}>{this.state.isOpen ? 'arrow_drop_down' : 'arrow_left'}</i></span>
                    <Collapse isOpen={this.state.isOpen}>
                        <Table striped className="mt-3">
                            <tbody>
                                <tr>
                                    <th><T>common.portID</T></th>
                                    <td>{msg?.port_id}</td>
                                </tr>
                                <tr>
                                    <th><T>common.channelID</T></th>
                                    <td>{msg?.channel_id}</td>
                                </tr>
                                <tr>
                                    <th><T>common.counterpartyChannelID</T></th>
                                    <td>{msg?.counterparty_channel_id}</td>
                                </tr>
                                <tr>
                                    <th><T>common.counterpartyVersion</T></th>
                                    <td>{msg?.counterparty_version}</td>
                                </tr>
                                <tr>
                                    <th><T>common.proof</T></th>
                                    <td>{msg?.proof_try}</td>
                                </tr>
                            </tbody>
                        </Table>
                    </Collapse>
                </div>
            </div>
        case "/ibc.core.channel.v1.MsgChannelOpenConfirm":
            return <div>
                <Account address={msg.signer} /> {(this.props.invalid) ? <T>activities.failedTo</T> : ''}<MsgType type={msg["@type"]} />
                <div className="d-inline">
                    <span className="float-right"><i className="material-icons" onClick={this.toggle}>{this.state.isOpen ? 'arrow_drop_down' : 'arrow_left'}</i></span>
                    <Collapse isOpen={this.state.isOpen}>
                        <Table striped className="mt-3">
                            <tbody>
                                <tr>
                                    <th><T>common.portID</T></th>
                                    <td>{msg?.port_id}</td>
                                </tr>
                                <tr>
                                    <th><T>common.channelID</T></th>
                                    <td>{msg?.channel_id}</td>
                                </tr>
                                <tr>
                                    <th><T>common.proofAcknowledgement</T></th>
                                    <td className="wrap-long-text">{msg?.proof_ack}</td>
                                </tr>
                            </tbody>
                        </Table>
                    </Collapse>
                </div>
            </div>
        case "/ibc.core.channel.v1.MsgChannelOpenInit":
            return <div>
                <Account address={msg.signer} /> {(this.props.invalid) ? <T>activities.failedTo</T> : ''}<MsgType type={msg["@type"]} />
                <div className="d-inline">
                    <span className="float-right"><i className="material-icons" onClick={this.toggle}>{this.state.isOpen ? 'arrow_drop_down' : 'arrow_left'}</i></span>
                    <Collapse isOpen={this.state.isOpen}>
                        <Table striped className="mt-3">
                            <tbody>
                                <tr>
                                    <th><T>common.portID</T></th>
                                    <td>{msg?.port_id}</td>
                                </tr>
                                <tr>
                                    <th><T>common.channel</T></th>
                                    <td>{msg?.channel}</td>
                                </tr>
                            </tbody>
                        </Table>
                    </Collapse>
                </div>
            </div>
        case "/ibc.core.channel.v1.MsgChannelOpenTry":
            return <div>
                <Account address={msg.signer} /> {(this.props.invalid) ? <T>activities.failedTo</T> : ''}<MsgType type={msg["@type"]} />
                <div className="d-inline">
                    <span className="float-right"><i className="material-icons" onClick={this.toggle}>{this.state.isOpen ? 'arrow_drop_down' : 'arrow_left'}</i></span>
                    <Collapse isOpen={this.state.isOpen}>
                        <Table striped className="mt-3">
                            <tbody>
                                <tr>
                                    <th><T>common.portID</T></th>
                                    <td>{msg?.port_id}</td>
                                </tr>
                                <tr>
                                    <th><T>common.channel</T></th>
                                    <td>{msg?.channel}</td>
                                </tr>
                                <tr>
                                    <th><T>common.counterpartyVersion</T></th>
                                    <td>{msg?.counterparty_version}</td>
                                </tr>
                                <tr>
                                    <th><T>common.proof</T></th>
                                    <td>{msg?.proof_init}</td>
                                </tr>
                            </tbody>
                        </Table>
                    </Collapse>
                </div>
            </div>
        case "/ibc.core.channel.v1.MsgRecvPacket":
            return <div>
                <Account address={msg.signer} /> {(this.props.invalid) ? <T>activities.failedTo</T> : ''}<MsgType type={msg["@type"]} /> 
                <div className="d-inline">
                    <span className="float-right"><i className="material-icons" onClick={this.toggle}>{this.state.isOpen ? 'arrow_drop_down' : 'arrow_left'}</i></span>
                    <Collapse isOpen={this.state.isOpen}>
                        <Table striped className="mt-3">
                            <tbody>
                                <tr>
                                    <th><T>common.sourceChannel</T></th>
                                    <td>{msg?.packet?.source_channel}</td>
                                </tr>
                                <tr>
                                    <th><T>common.destinationChannel</T></th>
                                    <td>{msg?.packet?.destination_channel}</td>
                                </tr>
                                <tr>
                                    <th><T>common.proofCommitment</T></th>
                                    <td className="wrap-long-text">{msg?.proof_commitment}</td>
                                </tr>
                            </tbody>
                        </Table>
                    </Collapse>
                </div>
            </div>
        case "/ibc.core.channel.v1.MsgTimeout":
            return <div>
                <Account address={msg.signer} /> {(this.props.invalid) ? <T>activities.failedTo</T> : ''}<MsgType type={msg["@type"]} />
            </div>
        case "/ibc.core.channel.v1.MsgTimeoutOnClose":
            return <div>
                <Account address={msg.signer} /> {(this.props.invalid) ? <T>activities.failedTo</T> : ''}<MsgType type={msg["@type"]} />
            </div>

            // IBC Connection
        case "/ibc.core.connection.v1.MsgConnectionOpenAck":
            return <div>
                <Account address={msg.signer} /> {(this.props.invalid) ? <T>activities.failedTo</T> : ''}<MsgType type={msg["@type"]} />
                <div className="d-inline">
                    <span className="float-right"><i className="material-icons" onClick={this.toggle}>{this.state.isOpen ? 'arrow_drop_down' : 'arrow_left'}</i></span>
                    <Collapse isOpen={this.state.isOpen}>
                        <Table striped className="mt-3">
                            <tbody>
                                <tr>
                                    <th><T>common.connectionID</T></th>
                                    <td>{msg?.connection_id}</td>
                                </tr>
                                <tr>
                                    <th><T>common.counterpartyConnectionID</T></th>
                                    <td>{msg?.counterparty_connection_id}</td>
                                </tr>
                                <tr>
                                    <th><T>common.proof</T></th>
                                    <td className="wrap-long-text">{msg?.proof_try}</td>
                                </tr>
                                <tr>
                                    <th><T>common.proofClient</T></th>
                                    <td className="wrap-long-text">{msg?.proof_client}</td>
                                </tr>
                            </tbody>
                        </Table>
                    </Collapse>
                </div>
            </div>
        case "/ibc.core.connection.v1.MsgConnectionOpenConfirm":
            return <div>
                <Account address={msg.signer} /> {(this.props.invalid) ? <T>activities.failedTo</T> : ''}<MsgType type={msg["@type"]} /> 
                <div className="d-inline">
                    <span className="float-right"><i className="material-icons" onClick={this.toggle}>{this.state.isOpen ? 'arrow_drop_down' : 'arrow_left'}</i></span>
                    <Collapse isOpen={this.state.isOpen}>
                        <Table striped className="mt-3">
                            <tbody>
                                <tr>
                                    <th><T>common.connectionID</T></th>
                                    <td>{msg?.connection_id}</td>
                                </tr>
                                <tr>
                                    <th><T>common.proofAcknowledgement</T></th>
                                    <td className="wrap-long-text">{msg?.proof_ack}</td>
                                </tr>

                            </tbody>
                        </Table>
                    </Collapse>
                </div>
            </div>      
        case "/ibc.core.connection.v1.MsgConnectionOpenInit":
            return <div>
                <Account address={msg.signer} /> {(this.props.invalid) ? <T>activities.failedTo</T> : ''}<MsgType type={msg["@type"]} />
                <div className="d-inline">
                    <span className="float-right"><i className="material-icons" onClick={this.toggle}>{this.state.isOpen ? 'arrow_drop_down' : 'arrow_left'}</i></span>
                    <Collapse isOpen={this.state.isOpen}>
                        <Table striped className="mt-3">
                            <tbody>
                                <tr>
                                    <th><T>common.clientID</T></th>
                                    <td>{msg?.client_id}</td>
                                </tr>
                                <tr>
                                    <th><T>common.counterparty</T></th>
                                    <td>{msg?.counterparty}</td>
                                </tr>

                            </tbody>
                        </Table>
                    </Collapse>
                </div>
            </div>
        case "/ibc.core.connection.v1.MsgConnectionOpenTry":
            return <div>
                <Account address={msg.signer} /> {(this.props.invalid) ? <T>activities.failedTo</T> : ''}<MsgType type={msg["@type"]} /> 
                <div className="d-inline">
                    <span className="float-right"><i className="material-icons" onClick={this.toggle}>{this.state.isOpen ? 'arrow_drop_down' : 'arrow_left'}</i></span>
                    <Collapse isOpen={this.state.isOpen}>
                        <Table striped className="mt-3">
                            <tbody>
                                <tr>
                                    <th><T>common.chainID</T></th>
                                    <td>{msg?.client_state?.chain_id}</td>
                                </tr>
                                <tr>
                                    <th><T>common.clientID</T></th>
                                    <td>{msg?.client_id}</td>
                                </tr>
                                <tr>
                                    <th><T>common.counterpartyClientID</T></th>
                                    <td>{msg?.counterparty?.client_id}</td>
                                </tr>
                                <tr>
                                    <th><T>common.counterpartyConnectionID</T></th>
                                    <td>{msg?.counterparty?.connection_id}</td>
                                </tr>

                            </tbody>
                        </Table>
                    </Collapse>
                </div>    
            </div>
        case "/ibc.core.connection.v1.ConnectionEnd":
            return <div>
                <Account address={msg.signer} /> {(this.props.invalid) ? <T>activities.failedTo</T> : ''}<MsgType type={msg["@type"]} />
            </div>
        case "/ibc.core.connection.v1.Counterparty":
            return <div>
                <Account address={msg.signer} /> {(this.props.invalid) ? <T>activities.failedTo</T> : ''}<MsgType type={msg["@type"]} />
            </div>
        case "/ibc.core.connection.v1.Version":
            return <div>
                <Account address={msg.signer} /> {(this.props.invalid) ? <T>activities.failedTo</T> : ''}<MsgType type={msg["@type"]} />
            </div>

        // IBC Application
        case "/ibc.applications.transfer.v1.MsgTransfer":
            return <div>
                <Account address={msg.sender} /> {(this.props.invalid) ? <p className="ml-1"> <T>activities.failedTo</T></p> : ''}<MsgType type={msg["@type"]} /><T>activities.to</T> <span className="address"> <Account address={msg.receiver} /></span><T>common.fullStop</T>
                <div className="d-inline">
                    <span className="float-right"><i className="material-icons" onClick={this.toggle}>{this.state.isOpen ? 'arrow_drop_down' : 'arrow_left'}</i></span>
                    <Collapse isOpen={this.state.isOpen}>
                        <Table striped className="mt-3">
                            <tbody>
                                <tr>
                                    <th><T>common.token</T></th>
                                    <td>{new Coin(msg?.token?.amount, msg?.token?.denom).toString(6)}</td>
                                </tr>
                                <tr>
                                    <th><T>common.sourceChannel</T></th>
                                    <td>{msg?.source_channel}</td>
                                </tr>
                            </tbody>
                        </Table>
                    </Collapse>
                </div>
            </div>

        default:
            return <div><ReactJson src={msg} /></div>
        }
    }
}
