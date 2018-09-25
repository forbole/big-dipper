import React from 'react';
import { Row, Col, Card, CardImg, CardText, CardBody,
    CardTitle, CardSubtitle, Button } from 'reactstrap';
import moment from 'moment';

export default class ChainStatus extends React.Component {
    constructor(props) {
      super(props);
    }

    render(){
        if (this.props.loading){
            return <div>loading</div>
        }
        else {
            return(
                <Row className="status text-center">
                    <Col md="3">
                        <Card body>
                            <CardTitle>Latest Block Height</CardTitle>
                            <CardText><span className="display-4 value text-primary">{this.props.status.latestBlockHeight}</span>{moment(this.props.status.latestBlockTime).format("D MMM YYYY hh:mm:ssa Z")}</CardText>   
                        </Card>
                    </Col>
                    <Col md="3">
                        <Card body>
                            <CardTitle>Average Block Time</CardTitle>
                            <CardText><span className="display-4 value text-primary">{(this.props.status.blockTime/1000).toFixed(2)}</span>seconds</CardText>   
                        </Card>
                    </Col>
                    <Col md="3">
                        <Card body>
                            <CardTitle>Active Validators</CardTitle>
                            <CardText><span className="display-4 value text-primary">{this.props.status.validators}</span>out of {this.props.status.totalValidators} validators</CardText>   
                        </Card>
                    </Col>
                    <Col md="3">
                        <Card body>
                            <CardTitle>Online Voting Power</CardTitle>
                            <CardText><span className="display-4 value text-primary">{this.props.status.activeVotingPower}</span>from {this.props.status.totalVotingPower} tokens delegated</CardText>   
                        </Card>
                    </Col>
                </Row>
            )
        }
    }
}