import React, { Component } from 'react';
import { MsgType } from './MsgType.jsx';
import { Link } from 'react-router-dom';
import Account from '../components/Account.jsx';
import ClaimSwap from '../bep3/ClaimSwap.jsx';
import CreateCDP from '../cdp/CreateCDP.jsx';
import DepositCDP from '../cdp/DepositCDP.jsx';
import WithdrawCDP from '../cdp/WithdrawCDP.jsx';
import DrawDebt from '../cdp/DrawDebt.jsx';
import RepayDebt from '../cdp/RepayDebt.jsx';
import CreateSwap from '../bep3/CreateSwap.jsx';
import { ListGroup, ListGroupItem, Table } from 'reactstrap';
import i18n from 'meteor/universe:i18n';
import Coin from '/both/utils/coins.js'
import JSONPretty from 'react-json-pretty';
import numbro from 'numbro';
import moment from 'moment';
import voca from 'voca';
import _ from 'lodash';

const T = i18n.createComponent();

MultiSend = (props) => {
    return <div>
        <p><T>activities.single</T> <MsgType type={props.msg.type} /> <T>activities.happened</T></p>
        <p><T>activities.senders</T>
            <ul>
                {props.msg.value.inputs.map((data, i) => {
                    return <li key={i}><Account address={data.address} /> <T>activities.sent</T> {data.coins.map((coin, j) => {
                        return <span key={j} className="text-success">{new Coin(coin.amount, coin.denom).toString()}</span>
                    })}
                    </li>
                })}
            </ul>
            <T>activities.receivers</T>
            <ul>
                {props.msg.value.outputs.map((data, i) => {
                    return <li key={i}><Account address={data.address} /> <T>activities.received</T> {data.coins.map((coin, j) => {
                        return <span key={j} className="text-success">{new Coin(coin.amount, coin.denom).toString()}</span>
                    })}</li>
                })}
            </ul>
        </p>
    </div>
}

export default class Activites extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        // console.log(this.props);
        const msg = this.props.msg;
        const events = [];
        for (let i in this.props.events) {
            events[this.props.events[i].type] = this.props.events[i].attributes
        }

        switch (msg.type) {
        // bank
        case "cosmos-sdk/MsgSend":
            let amount = '';
            amount = msg.value.amount.map((coin) => new Coin(coin.amount, coin.denom).toString()).join(', ')
            return <p><Account address={msg.value.from_address} /> {(this.props.invalid) ? <T>activities.failedTo</T> : ''}<MsgType type={msg.type} /> <span className="text-success">{amount}</span> <T>activities.to</T> <span className="address"><Account address={msg.value.to_address} /></span><T>common.fullStop</T></p>
        case "cosmos-sdk/MsgMultiSend":
            return <MultiSend msg={msg} />

            // BEP3
        case "bep3/MsgClaimAtomicSwap":
            return <div>
                <Account address={msg.value.from} /> {(this.props.invalid) ? <T>activities.failedTo</T> : ''} {(this.props.invalid) ? '' : <span><T>activities.madeA</T> <MsgType type={msg.type} /></span>}
                <ClaimSwap swapID={msg.value.swap_id} />
            </div>
        case "bep3/MsgCreateAtomicSwap":
            return <div>
                <Account address={msg.value.from} /> {(this.props.invalid) ? <T>activities.failedTo</T> : ''} {(this.props.invalid) ? '' : <span><T>activities.madeA</T> <MsgType type={msg.type} /></span>}
                <CreateSwap from={msg.value.from} to={msg.value.to} receipientOtherChain={msg.value.recipient_other_chain} senderOtherChain={msg.value.sender_other_chain}
                    randomHash={msg.value.random_number_hash} timestamp={msg.value.timestamp} amount={msg.value.amount} expectedIncome={msg.value.expected_income} heightSpan={msg.value.height_span} crossChain={msg.value.cross_chain} />
            </div>

            // CDP
        case "cdp/MsgCreateCDP":
            return <div>
                <div><Account address={msg.value.sender} /> {(this.props.invalid) ? <T>activities.failedTo</T> : ''}<MsgType type={msg.type} /> </div>
                <CreateCDP collateral={msg.value.collateral} principal={msg.value.principal} />
            </div>
        case "cdp/MsgDeposit":
            return <div><Account address={msg.value.depositor} /> {(this.props.invalid) ? <T>activities.failedTo</T> : ''}<MsgType type={msg.type} />
                <DepositCDP address={msg.value.owner} collateral={msg.value.collateral} />
            </div>
        case "cdp/MsgWithdraw":
            return <div>
                <div><Account address={msg.value.depositor} /> {(this.props.invalid) ? <T>activities.failedTo</T> : ''}<MsgType type={msg.type} /> </div>
                <WithdrawCDP depositor={msg.value.depositor} owner={msg.value.owner} collateral={msg.value.collateral} />
            </div>
        case "cdp/MsgDrawDebt":
            return <div>
                <div><Account address={msg.value.sender} /> {(this.props.invalid) ? <T>activities.failedTo</T> : ''}<MsgType type={msg.type} /> </div>
                <DrawDebt sender={msg.value.sender} cdp_denom={msg.value.cdp_denom} principal={msg.value.principal} />
            </div>
        case "cdp/MsgRepayDebt":
            return <div>
                <div><Account address={msg.value.sender} /> {(this.props.invalid) ? <T>activities.failedTo</T> : ''}<MsgType type={msg.type} /> </div>
                <RepayDebt sender={msg.value.sender} cdp_denom={msg.value.cdp_denom} payment={msg.value.payment} />
            </div>

            // Incentive
        case "incentive/MsgClaimUSDXMintingReward":
            return <div>
                <Account address={msg.value.sender} /> {(this.props.invalid) ? <T>activities.failedTo</T> : ''}<MsgType type={msg.type} />
                <Table striped className="mt-3">
                    <tbody>
                        {events['claim_reward'].map((reward, i) => {
                            if (i % 2 == 1) {
                                return <tr key={i}>
                                    <th>{voca.chain(reward.key).replace("_", " ").titleCase().value()}</th>
                                    <td>{new Coin(parseInt(reward.value), reward.value.match(/[a-z]*$/)[0]).toString()}</td>
                                </tr>
                            }
                        })}
                    </tbody>
                </Table>
            </div>
            // Pricefeed
        case "pricefeed/MsgPostPrice":
            return <div>
                <Account address={msg.value.from} /> {(this.props.invalid) ? <T>activities.failedTo</T> : ''}<MsgType type={msg.type} />
                <Table striped className="mt-3">
                    <thead>
                        <tr>
                            <th className="w-25">{msg.value.market_id}</th>
                            <td>{numbro(msg.value.price).formatCurrency({ mantissa: 6 })}</td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <th scope="row" className="w-25"><T>activities.priceExpiry</T></th>
                            <td>{moment.utc(msg.value.expiry).format('YYYY-MM-DD HH:mm:ss')}</td>
                        </tr>
                    </tbody>
                </Table>
            </div>
            //Auctions
        case "auction/MsgPlaceBid":
            return <div>
                <Account address={msg.value.from} /> {(this.props.invalid) ? <T>activities.failedTo</T> : ''}<MsgType type={msg.type} />
                <Table striped className="mt-3">
                    <thead>
                        <tr>
                            <th className="w-25">activities.auctionID</th>
                            <td>{msg.value.auction_id}</td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <th scope="row" className="w-25"><T>activities.amount</T></th>
                            <td>{new Coin(parseInt(msg.value.amount.amount), msg.value.amount.denom.match(/[a-z]*$/)[0]).toString()}</td>
                        </tr>
                    </tbody>
                </Table>
            </div>

            // staking
        case "cosmos-sdk/MsgCreateValidator":
            return <p><Account address={msg.value.delegator_address} /> {(this.props.invalid) ? <T>activities.failedTo</T> : ''}<MsgType type={msg.type} /> <T>activities.operatingAt</T> <span className="address"><Account address={msg.value.validator_address} /></span> <T>activities.withMoniker</T> <Link to="#">{msg.value.description.moniker}</Link><T>common.fullStop</T></p>
        case "cosmos-sdk/MsgEditValidator":
            return <p><Account address={msg.value.address} /> {(this.props.invalid) ? <T>activities.failedTo</T> : ''}<MsgType type={msg.type} /></p>
        case "cosmos-sdk/MsgDelegate":
            return <p><Account address={msg.value.delegator_address} /> {(this.props.invalid) ? <T>activities.failedTo</T> : ''}<MsgType type={msg.type} /> <span className="text-warning">{new Coin(msg.value.amount.amount, msg.value.amount.denom).toString(6)}</span> <T>activities.to</T> <Account address={msg.value.validator_address} /><T>common.fullStop</T></p>
        case "cosmos-sdk/MsgUndelegate":
            return <p><Account address={msg.value.delegator_address} /> {(this.props.invalid) ? <T>activities.failedTo</T> : ''}<MsgType type={msg.type} /> <span className="text-warning">{new Coin(msg.value.amount.amount, msg.value.amount.denom).toString(6)}</span> <T>activities.from</T> <Account address={msg.value.validator_address} /><T>common.fullStop</T></p>
        case "cosmos-sdk/MsgBeginRedelegate":
            return <p><Account address={msg.value.delegator_address} /> {(this.props.invalid) ? <T>activities.failedTo</T> : ''}<MsgType type={msg.type} /> <span className="text-warning">{new Coin(msg.value.amount.amount, msg.value.amount.denom).toString(6)}</span> <T>activities.from</T> <Account address={msg.value.validator_src_address} /> <T>activities.to</T> <Account address={msg.value.validator_dst_address} /><T>common.fullStop</T></p>

            // gov
        case "cosmos-sdk/MsgSubmitProposal":
            const proposalId = _.get(this.props, 'events[2].attributes[0].value', null)
            const proposalLink = proposalId ? `/proposals/${proposalId}` : "#";
            return <p><Account address={msg.value.proposer} /> <MsgType type={msg.type} /> <T>activities.withTitle</T> <Link to={proposalLink}>{msg.value.content.value.title}</Link><T>common.fullStop</T></p>
        case "cosmos-sdk/MsgDeposit":
            return <p><Account address={msg.value.depositor} /> {(this.props.invalid) ? <T>activities.failedTo</T> : ''}<MsgType type={msg.type} /> {msg.value.amount ? <em className="text-info">{msg.value.amount.map((amount, i) => new Coin(amount.amount, amount.denom).toString(6)).join(', ')}</em> : ''} <T>activities.to</T> <Link to={"/proposals/" + msg.value.proposal_id}><T>proposals.proposal</T> {msg.value.proposal_id}</Link><T>common.fullStop</T></p>
        case "cosmos-sdk/MsgVote":
            return <p><Account address={msg.value.voter} /> {(this.props.invalid) ? <T>activities.failedTo</T> : ''}<MsgType type={msg.type} />  <Link to={"/proposals/" + msg.value.proposal_id}><T>proposals.proposal</T> {msg.value.proposal_id}</Link> <T>activities.withA</T> <em className="text-info">{msg.value.option}</em><T>common.fullStop</T></p>

            // distribution
        case "cosmos-sdk/MsgWithdrawValidatorCommission":
            return <p><Account address={msg.value.validator_address} /> {(this.props.invalid) ? <T>activities.failedTo</T> : ''}<MsgType type={msg.type} /><T> {(!this.props.invalid) ? <T _purify={false} amount={new Coin(parseInt(events['withdraw_commission'][0].value), events['withdraw_commission'][0].value.replace(/[0-9]/g, '')).toString(6)}>activities.withAmount</T> : ''}common.fullStop</T></p>
        case "cosmos-sdk/MsgWithdrawDelegationReward":
            return <p><Account address={msg.value.delegator_address} /> {(this.props.invalid) ? <T>activities.failedTo</T> : ''}<MsgType type={msg.type} /> {(!this.props.invalid) ? msg.value.amount ? <T _purify={false} amount={msg.value.amount.map((amount, i) => new Coin(amount.amount, amount.denom).toString(6)).join(', ')}>activities.withAmount</T> : '' : ''} <T>activities.from</T> <Account address={msg.value.validator_address} /><T>common.fullStop</T> </p>
        case "cosmos-sdk/MsgModifyWithdrawAddress":
            return <p><Account address={msg.value.delegator_address} /> {(this.props.invalid) ? <T>activities.failedTo</T> : ''}<MsgType type={msg.type} /></p>

            // slashing
        case "cosmos-sdk/MsgUnjail":
            return <p><Account address={msg.value.address} /> {(this.props.invalid) ? <T>activities.failedTo</T> : ''}<MsgType type={msg.type} /><T>common.fullStop</T></p>

            // ibc
        case "cosmos-sdk/IBCTransferMsg":
            return <MsgType type={msg.type} />
        case "cosmos-sdk/IBCReceiveMsg":
            return <MsgType type={msg.type} />

        default:
            return <div><JSONPretty id="json-pretty" data={msg.value}></JSONPretty></div>
        }
    }
}
