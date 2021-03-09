import React from 'react';
import { Card, CardFooter, CardBody, Col, Row, Badge } from 'reactstrap';
import momemt from 'moment';
import numbro from 'numbro';
import Account from './Account.jsx';
import i18n from 'meteor/universe:i18n';
import Coin from '/both/utils/coins.js'

const T = i18n.createComponent();
export default class PowerHistory extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tx : "",
            diff: <span className={"text-"+((props.votingPower - props.prevVotingPower>0)?"success":"danger")+" vp-diff"}>({numbro(props.votingPower - props.prevVotingPower).format("+0,0")})</span>
        }

        if (props.votingPower > 0){      
            Meteor.call('Transactions.findDelegation', this.props.address, this.props.height, (err, result) => {
                if (err){
                // console.log(err);
                }
                if (result){
                    let self = this;
                    this.setState({
                        tx: result.map((msg, i) => <CardFooter key={i} className="text-secondary"><Row>
                            <Col xs={12} sm={8}>
                                {(msg.tx.body.messages && msg.tx.body.messages.length > 0)?msg.tx.body.messages.map((m, j) => {
                                    switch (m["@type"]){
                                    case "/cosmos.staking.v1beta1.MsgBeginRedelegate":
                                        return <Row key={j}>
                                            <Col xs={12}>
                                                <Row>
                                                    <Col xs={4}><T>validators.delegator</T></Col>
                                                    <Col xs={8} className="address" data-delegator-address={m.delegator_address}><Account address={m.delegator_address} /></Col>
                                                </Row>
                                            </Col>
                                            <Col xs={12}>
                                                <Row>
                                                    <Col xs={4}>{(this.props.address == m.validator_dst_address)?<T>activities.from</T>:<T>activities.to</T>}</Col>
                                                    <Col xs={8} className="address" data-validator-address={(this.props.address == m.validator_dst_address)?m.validator_src_address:m.validator_dst_address}><Account address={(this.props.address == m.validator_dst_address)?m.validator_src_address:m.validator_dst_address} /></Col>
                                                </Row>
                                            </Col>
                                            <Col xs={12}>
                                                <Row>
                                                    <Col xs={4}><T>validators.amount</T></Col>
                                                    <Col xs={8}>{new Coin(m.amount.amount, m.amount.denom).toString()}</Col>
                                                    
                                                </Row>
                                            </Col>
                                        </Row>
                                    case "/cosmos.staking.v1beta1.MsgDelegate":
                                        if (m.validator_address == self.props.address){
                                            return <Row key={j}>
                                                <Col xs={12}>
                                                    <Row>
                                                        <Col xs={4}><T>validators.delegator</T></Col>
                                                        <Col xs={8} className="address" data-delegator-address={m.delegator_address}><Account address={m.delegator_address} /></Col>
                                                    </Row>
                                                </Col>
                                                <Col xs={12}>
                                                    <Row>
                                                        <Col xs={4}><T>validators.amount</T></Col>
                                                        <Col xs={8}>{new Coin(m.amount.amount, m.amount.denom).toString()}</Col>
                                                    </Row>
                                                </Col>
                                            </Row>
                                        }
                                        else{
                                            return;
                                        }
                                    case "/cosmos.staking.v1beta1.MsgCreateValidator":
                                        return <Row key={j}>
                                            <Col xs={12}>
                                                <Row>
                                                    <Col xs={4}><T>validators.delegator</T></Col>
                                                    <Col xs={8} className="address" data-delegator-address={m.delegator_address}><Account address={m.delegator_address} /></Col>
                                                </Row>
                                            </Col>
                                            <Col xs={12}>
                                                <Row>
                                                    <Col xs={4}><T>validators.amount</T></Col>
                                                    <Col xs={8}>{new Coin(m.value.amount, m.value.denom).toString()}</Col>
                                                </Row>
                                            </Col>
                                        </Row>
                                    case "/cosmos.staking.v1beta1.MsgUndelegate":
                                        return <Row key={j}>
                                            <Col xs={12}>
                                                <Row>
                                                    <Col xs={4}><T>validators.delegator</T></Col>
                                                    <Col xs={8} className="address" data-delegator-address={m.delegator_address}><Account address={m.delegator_address} /></Col>
                                                </Row>
                                            </Col>
                                            <Col xs={12}>
                                                <Row>
                                                    <Col xs={4}><T>validators.amount</T></Col>
                                                    <Col xs={8}>{new Coin(m.amount.amount, m.amount.denom).toString()}</Col>
                                                </Row>
                                            </Col>
                                        </Row>

                                    }
                                }):''}</Col>
                            <Col xs={12} sm={4}>
                                <Row>
                                    <Col xs={12}>
                                        <Row>
                                            {(msg.tx.body.messages && msg.tx.body.messages.length > 0)?msg.tx.body.messages.map((m,j) => {
                                                switch (m["@type"]){
                                                case "/cosmos.staking.v1beta1.MsgBeginRedelegate":
                                                    return <Col key={j}><Badge color="success"><T>messageTypes.redelegate</T></Badge></Col>;
                                                case "/cosmos.staking.v1beta1.MsgDelegate":
                                                    if (m.validator_address == self.props.address){
                                                        return <Col key={j}><Badge color="success"><T>messageTypes.delegate</T></Badge></Col>;
                                                    }
                                                    else
                                                        return;
                                                case "/cosmos.staking.v1beta1.MsgCreateValidator":
                                                    return <Col key={j}><Badge color="warning"><T>messageTypes.createValidator</T></Badge></Col>;
                                                case "/cosmos.staking.v1beta1.MsgUnjail":
                                                    return <Col key={j}><Badge color="info"><T>messageTypes.unjail</T></Badge></Col>;
                                                case "/cosmos.staking.v1beta1.MsgUndelegate":
                                                    return <Col key={j}><Badge color="danger"><T>messageTypes.undelegate</T></Badge></Col>;
                                                }
                                            }):''}
                                        </Row>
                                        <Row>
                                            <Col xs={4} sm={6}><T>transactions.fee</T></Col>
                                            <Col xs={8} sm={6}>{(msg.tx.auth_info.fee.amount&& msg.tx.auth_info.fee.amount.length>0)?msg.tx.auth_info.fee.amount.map((amount,i)=> new Coin(amount.amount, amount.denom).toString()).join(' ,'):'0'}</Col>
                                        </Row>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                        </CardFooter>)
                    })
                }
            });
        }
    }

    render() {
        let changeClass = "";
        switch (this.props.type){
        case 'up':
            changeClass = "fas fa-chevron-circle-up";
            break;
        case 'down':
            changeClass = "fas fa-chevron-circle-down";
            break;
        case 'remove':
            changeClass = "fas fa-minus-circle";
            break;
        default:
            changeClass = "fas fa-plus-circle";
        }
        return (
            <Card className={this.props.type}>
                <CardBody>
                    <Row>
                        <Col xs={2} className={(this.props.type == 'down' || this.props.type == 'remove')?'text-danger':(this.props.type == 'up'?'text-success':'text-warning')}><i className={changeClass}></i> </Col>
                        <Col xs={10} sm={6} ><span className="voting-power">{numbro(this.props.prevVotingPower).format('0,0')}</span> <i className="material-icons text-info">arrow_forward</i> <span className="voting-power">{numbro(this.props.votingPower).format('0,0')}</span> {this.state.diff}</Col>
                        <Col xs={{size:10, offset:2}} sm={{offset:0, size:4}} className="text-secondary"><i className="fas fa-cube"></i> {numbro(this.props.height).format('0,0')}<br/><i className="far fa-clock"></i> {momemt.utc(this.props.time).format("D MMM YYYY, h:mm:ssa z")}</Col>
                    </Row>
                </CardBody>
                {this.state.tx}
            </Card>
        );
    }
}

