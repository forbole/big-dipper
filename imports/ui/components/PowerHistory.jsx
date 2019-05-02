import React from 'react';
import { Card, CardFooter, CardBody, Col, Row, Badge } from 'reactstrap';
import momemt from 'moment';
import numbro from 'numbro';
import Account from './Account.jsx';

export default class PowerHistory extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        tx : "",
        diff: <span className={"text-"+((props.votingPower - props.prevVotingPower>0)?"success":"danger")+" vp-diff"}>({numbro(props.votingPower - props.prevVotingPower).format("+0,0")})</span>
    }

    Meteor.call('Transactions.findDelegation', this.props.address, this.props.height, (err, result) => {
        if (err){
            console.log(err);
        }
        if (result){
            // console.log(result);
            let self = this;
            this.setState({
                tx: result.map((msg, i) => <CardFooter key={i} className="text-secondary"><Row>
                    <Col xs={12} sm={8}>
                    {(msg.tx.value.msg && msg.tx.value.msg.length > 0)?msg.tx.value.msg.map((m, j) => {
                        switch (m.type){
                            case "cosmos-sdk/MsgBeginRedelegate":
                                return <Row key={j}>
                                    <Col xs={12}>
                                        <Row>
                                            <Col xs={4}>Delegator</Col>
                                            <Col xs={8} className="address" data-delegator-address={m.value.delegator_address}><Account address={m.value.delegator_address} /></Col>
                                        </Row>
                                    </Col>
                                    <Col xs={12}>
                                        <Row>
                                            <Col xs={4}>{(this.props.address == m.value.validator_dst_address)?'From':'To'}</Col>
                                            <Col xs={8} className="address" data-validator-address={(this.props.address == m.value.validator_dst_address)?m.value.validator_src_address:m.value.validator_dst_address}><Account address={(this.props.address == m.value.validator_dst_address)?m.value.validator_src_address:m.value.validator_dst_address} /></Col>
                                        </Row>
                                    </Col>
                                    <Col xs={12}>
                                        <Row>
                                            <Col xs={4}>Amount</Col>
                                            <Col xs={8}>{numbro(m.value.amount.amount).format('0,0')} {m.value.amount.denom}</Col>
                                        </Row>
                                    </Col>
                                </Row>
                            case "cosmos-sdk/MsgDelegate":
                                if (m.value.validator_address == self.props.address){      
                                    return <Row key={j}>
                                        <Col xs={12}>
                                            <Row>
                                                <Col xs={4}>Delegator</Col>
                                                <Col xs={8} className="address" data-delegator-address={m.value.delegator_address}><Account address={m.value.delegator_address} /></Col>
                                            </Row>
                                        </Col>
                                        <Col xs={12}>
                                            <Row>
                                                <Col xs={4}>Amount</Col>
                                                <Col xs={8}>{numbro(m.value.amount.amount).format('0,0')} {m.value.amount.denom}</Col>
                                            </Row>
                                        </Col>
                                    </Row>
                                }
                                else{
                                    return;
                                }
                            case "cosmos-sdk/MsgCreateValidator":
                                return <Row key={j}>
                                    <Col xs={12}>
                                        <Row>
                                            <Col xs={4}>Delegator</Col>
                                            <Col xs={8} className="address" data-delegator-address={m.value.delegator_address}><Account address={m.value.delegator_address} /></Col>
                                        </Row>
                                    </Col>
                                    <Col xs={12}>
                                        <Row>
                                            <Col xs={4}>Amount</Col>
                                            <Col xs={8}>{numbro(m.value.value.amount).format('0,0')} {m.value.value.denom}</Col>
                                        </Row>
                                    </Col>
                                </Row>
                            case "cosmos-sdk/MsgUndelegate":
                                return <Row key={j}>
                                    <Col xs={12}>
                                        <Row>
                                            <Col xs={4}>Delegator</Col>
                                            <Col xs={8} className="address" data-delegator-address={m.value.delegator_address}><Account address={m.value.delegator_address} /></Col>
                                        </Row>
                                    </Col>
                                    <Col xs={12}>
                                        <Row>
                                            <Col xs={4}>Amount</Col>
                                            <Col xs={8}>{numbro(m.value.amount.amount).format('0,0')} {m.value.amount.denom}</Col>
                                        </Row>
                                    </Col>
                                </Row>

                        }
                    }):''}</Col>
                    <Col xs={12} sm={4}>
                    <Row>
                        <Col xs={12}>
                            <Row>
                            {(msg.tx.value.msg && msg.tx.value.msg.length > 0)?msg.tx.value.msg.map((m,j) => {
                                switch (m.type){
                                    case "cosmos-sdk/MsgBeginRedelegate":
                                        return <Col key={j}><Badge color="success">Redelegate</Badge></Col>;
                                    case "cosmos-sdk/MsgDelegate":
                                        if (m.value.validator_address == self.props.address){
                                            return <Col key={j}><Badge color="success">Delegate</Badge></Col>;
                                        }
                                        else
                                            return;    
                                    case "cosmos-sdk/MsgCreateValidator":
                                        return <Col key={j}><Badge color="warning">Create Validator</Badge></Col>;
                                    case "cosmos-sdk/MsgUnjail":
                                        return <Col key={j}><Badge color="info">Unjail</Badge></Col>;
                                    case "cosmos-sdk/MsgUndelegate":
                                        return <Col key={j}><Badge color="danger">Undelegate</Badge></Col>;
                                }
                            }):''}
                            </Row>
                            <Row>
                                <Col xs={4} sm={6}>Fee</Col>
                                <Col xs={8} sm={6}>{(msg.tx.value.fee.amount&& msg.tx.value.fee.amount.length>0)?msg.tx.value.fee.amount.map((amount,i)=>{
                                    if (i > 0){
                                        return <span key={i}> ,{numbro(amount.amount).format('0,0')} {amount.denom}</span>
                                    }
                                    else{
                                        return <span key={i}>{numbro(amount.amount).format('0,0')} {amount.denom}</span>
                                    }
                                }):'0'}</Col>
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

