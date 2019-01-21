import React from 'react';
import { Card, CardFooter, CardBody, Col, Row } from 'reactstrap';
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

    Meteor.call('Transactions.findDelegation', this.props.address, this.props.height-2, (err, result) => {
        if (err){
            console.log(err);
        }
        if (result){
            console.log(result);
            this.setState({
                tx: result.map((msg, i) => <CardFooter key={i}>
                    {msg.tx.value.msg.map((m, j) => {
                        if (m.type == "cosmos-sdk/MsgDelegate"){
                            return <Row key={j}>
                                <Col xs={12} sm={8}>Delegator: {m.value.delegator_addr}</Col>
                                <Col xs={6} sm={4}>Delegation: {m.value.delegation.amount} {m.value.delegation.denom}</Col>
                            </Row>
                        }
                    })}
                    <Row>
                        <Col xs={6} sm={12}>Fee: {msg.tx.value.fee.amount.map((amount,i)=>{
                            if (i > 0){
                                return <span> ,{amount.amount} {amount.denom}</span>
                            }
                            else{
                                return <span>{amount.amount} {amount.denom}</span>
                            }
                        })}</Col>
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
                <Col xs={{size:10, offset:2}} sm={{offset:0, size:4}} className="text-secondary"><i className="fas fa-cube"></i> {numeral(this.props.height).format('0,0')}<br/><i className="far fa-clock"></i> {momemt(this.props.time).format("D MMM YYYY, h:mm:ssa z")}</Col>
            </Row>
            </CardBody>
            {this.state.tx}
        </Card>
    );
  }
}

