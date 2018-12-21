import React from 'react';
import { Row, Col, Card, CardImg, CardText, CardBody,
    CardTitle, CardSubtitle, Button } from 'reactstrap';
import moment from 'moment';
import numeral from 'numeral';

export default class ChainStatus extends React.Component {
    constructor(props) {
      super(props);
    }

    render(){
        if (this.props.loading){
            return <div>loading</div>
        }
        else {
            if (!this.props.statusExist){
                return <div></div>
            }
            else{
                return(
                    <Row className="status text-center">
                        <Col lg={3} md={6}>
                            <Card body>
                                <CardTitle>Latest Block Height</CardTitle>
                                <CardText>
                                    <span className="display-4 value text-primary">{numeral(this.props.status.latestBlockHeight).format(0,0)}</span>
                                    {moment.utc(this.props.status.latestBlockTime).format("D MMM YYYY hh:mm:ssa z")}
                                </CardText>   
                            </Card>
                        </Col>
                        <Col lg={3} md={6}>
                            <Card body>
                                <CardTitle>Average Block Time</CardTitle>
                                <CardText>
                                    <span className="display-4 value text-primary">{(this.props.status.blockTime/1000).toFixed(2)}</span>seconds
                                </CardText>   
                            </Card>
                        </Col>
                        <Col lg={3} md={6}>
                            <Card body>
                                <CardTitle>Active Validators</CardTitle>
                                <CardText><span className="display-4 value text-primary">{this.props.status.validators}</span>out of {this.props.status.totalValidators} validators</CardText>   
                            </Card>
                        </Col>
                        <Col lg={3} md={6}>
                            <Card body>
                                <CardTitle>Online Voting Power</CardTitle>
                                <CardText><span className="display-4 value text-primary">{numeral(this.props.status.activeVotingPower).format('0,0.00a')}</span>from {numeral(this.props.status.totalVotingPower).format('0,0.00a')} tokens delegated</CardText>   
                            </Card>
                        </Col>
                    </Row>
                )
            }
        }
    }
}