import React from 'react';
import { Card, CardFooter, CardBody, Col, Row, Badge } from 'reactstrap';
import momemt from 'moment';
import numeral from 'numeral';
// import { VelocityComponent } from 'velocity-react';

export default class PowerHistory extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        tx : "",
        diff: <span className={"text-"+((props.votingPower - props.prevVotingPower>0)?"success":"danger")+" vp-diff"}>({numeral(props.votingPower - props.prevVotingPower).format("+0,0")})</span>
    }

    Meteor.call('Transactions.findDelegation', this.props.address, this.props.height, (err, result) => {
        if (err){
            console.log(err);
        }
        if (result){
            console.log(result);
            this.setState({
                tx: result.map((msg, i) => <CardFooter key={i} className="text-secondary"><Row>
                    <Col xs={12} sm={8}>
                    {(msg.tx.value.msg && msg.tx.value.msg.length > 0)?msg.tx.value.msg.map((m, j) => {
                        console.log(m);
                        switch (m.type){
                            case "cosmos-sdk/MsgBeginRedelegate":
                                return <Row key={j}>
                                    <Col xs={12}>
                                        <Row>
                                            <Col xs={4}>Delegator</Col>
                                            <Col xs={8} className="address" data-delegator-address={m.value.delegator_address}>{m.value.delegator_address}</Col>
                                        </Row>
                                    </Col>
                                    <Col xs={12}>
                                        <Row>
                                            <Col xs={4}>{(this.props.address == m.value.validator_dst_addr)?'From':'To'}</Col>
                                            <Col xs={8} className="address" data-validator-address={(this.props.address == m.value.validator_dst_addr)?m.value.validator_src_addr:m.value.validator_dst_addr}>{(this.props.address == m.value.validator_dst_addr)?m.value.validator_src_addr:m.value.validator_dst_addr}</Col>
                                        </Row>
                                    </Col>
                                    <Col xs={12}>
                                        <Row>
                                            <Col xs={4}>Shares</Col>
                                            <Col xs={8}>{numeral(m.value.shares_amount).format('0,0.00')}</Col>
                                        </Row>
                                    </Col>
                                </Row>
                            case "cosmos-sdk/MsgDelegate":
                                return <Row key={j}>
                                    <Col xs={12}>
                                        <Row>
                                            <Col xs={4}>Delegator</Col>
                                            <Col xs={8} className="address" data-delegator-address={m.value.delegator_address}>{m.value.delegator_address}</Col>
                                        </Row>
                                    </Col>
                                    <Col xs={12}>
                                        <Row>
                                            <Col xs={4}>Amount</Col>
                                            <Col xs={8}>{numeral(m.value.value.amount).format('0,0')} {m.value.value.denom}</Col>
                                        </Row>
                                    </Col>
                                </Row>
                            case "cosmos-sdk/MsgCreateValidator":
                                return <Row key={j}>
                                    <Col xs={12}>
                                        <Row>
                                            <Col xs={4}>Delegator</Col>
                                            <Col xs={8} className="address" data-delegator-address={m.value.delegator_address}>{m.value.delegator_address}</Col>
                                        </Row>
                                    </Col>
                                    <Col xs={12}>
                                        <Row>
                                            <Col xs={4}>Amount</Col>
                                            <Col xs={8}>{numeral(m.value.value.amount).format('0,0')} {m.value.value.denom}</Col>
                                        </Row>
                                    </Col>
                                </Row>
                            case "cosmos-sdk/Undelegate":
                                return <Row key={j}>
                                    <Col xs={12}>
                                        <Row>
                                            <Col xs={4}>Delegator</Col>
                                            <Col xs={8} className="address" data-delegator-address={m.value.delegator_address}>{m.value.delegator_address}</Col>
                                        </Row>
                                    </Col>
                                    <Col xs={12}>
                                        <Row>
                                            <Col xs={4}>Shares</Col>
                                            <Col xs={8}>{numeral(m.value.shares_amount).format('0,0.00')}</Col>
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
                                        return <Col key={j}><Badge color="success">Delegate</Badge></Col>;
                                    case "cosmos-sdk/MsgCreateValidator":
                                        return <Col key={j}><Badge color="warning">Create Validator</Badge></Col>;
                                    case "cosmos-sdk/MsgUnjail":
                                        return <Col key={j}><Badge color="info">Unjail</Badge></Col>;
                                    case "cosmos-sdk/Undelegate":
                                        return <Col key={j}><Badge color="danger">Undelegate</Badge></Col>;
                                }
                            }):''}
                            </Row>
                            <Row>
                                <Col xs={4} sm={6}>Fee</Col>
                                <Col xs={8} sm={6}>{(msg.tx.value.fee.amount&& msg.tx.value.fee.amount.length>0)?msg.tx.value.fee.amount.map((amount,i)=>{
                                    if (i > 0){
                                        return <span key={i}> ,{numeral(amount.amount).format('0,0')} {amount.denom}</span>
                                    }
                                    else{
                                        return <span key={i}>{numeral(amount.amount).format('0,0')} {amount.denom}</span>
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
                <Col xs={10} sm={6} ><span className="voting-power">{numeral(this.props.prevVotingPower).format('0,0')}</span> <i className="material-icons text-info">arrow_forward</i> <span className="voting-power">{numeral(this.props.votingPower).format('0,0')}</span> {this.state.diff}</Col>
                <Col xs={{size:10, offset:2}} sm={{offset:0, size:4}} className="text-secondary"><i className="fas fa-cube"></i> {numeral(this.props.height).format('0,0')}<br/><i className="far fa-clock"></i> {momemt.utc(this.props.time).format("D MMM YYYY, h:mm:ssa z")}</Col>
            </Row>
            </CardBody>
            {this.state.tx}
        </Card>
    );
  }
}

