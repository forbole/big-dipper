import React from 'react';
import { Row, Col, Card, CardText, 
    CardTitle, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem, Spinner } from 'reactstrap';
import moment from 'moment';
import numbro from 'numbro';

export default class ChainStatus extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
          blockHeight: 0,
          blockTime: 0,
          averageBlockTime: 0,
          votingPower: 0,
          numValidators: 0,
          totalNumValidators: 0,
          avgBlockTimeType: "",
          avgVotingPowerType: "",
          blockTimeText: "All",
          votingPowerText: "Now"
      }
    }

    componentDidUpdate(prevProps){
        if (prevProps != this.props){
            this.setState({
                blockHeight: numbro(this.props.status.latestBlockHeight).format(0,0),
                blockTime: moment.utc(this.props.status.latestBlockTime).format("D MMM YYYY hh:mm:ssa z"),
                delegatedTokens: numbro(this.props.status.totalVotingPower).format('0,0.00a'),
                numValidators: this.props.status.validators,
                totalNumValidators: this.props.status.totalValidators,
                bondedTokens: numbro(this.props.states.bondedTokens/Meteor.settings.public.stakingFraction).format("0,0.00a")
            })

            switch (this.state.avgBlockTimeType){
                case "":
                    this.setState({
                        averageBlockTime: numbro(this.props.status.blockTime/1000).format('0,0.00')
                    })
                    break;
                case "m":
                    this.setState({
                        averageBlockTime: numbro(this.props.status.lastMinuteBlockTime/1000).format('0,0.00')
                    })
                    break;
                case "h":
                    this.setState({
                        averageBlockTime: numbro(this.props.status.lastHourBlockTime/1000).format('0,0.00')
                    })
                    break;
                case "d":
                    this.setState({
                        averageBlockTime: numbro(this.props.status.lastDayBlockTime/1000).format('0,0.00')
                    })
                    break;
            }

            switch (this.state.avgVotingPowerType){
                case "":
                    this.setState({
                        votingPower: numbro(this.props.status.activeVotingPower).format('0,0.00a'),
                    });
                    break;
                case "h":
                    this.setState({
                        votingPower: numbro(this.props.status.lastHourVotingPower).format('0,0.00a'),
                    });
                    break;
                case "d":
                    this.setState({
                        votingPower: numbro(this.props.status.lastDayVotingPower).format('0,0.00a'),
                    });
                    break;

            }

        }
    }

    handleSwitchBlockTime = (type,e) => {
        e.preventDefault();
        switch (type){
            case "":
                this.setState({
                    blockTimeText: "All",
                    avgBlockTimeType: "",
                    averageBlockTime: numbro(this.props.status.blockTime/1000).format('0,0.00')
                })
                break;
            case "m":
                this.setState({
                    blockTimeText: "1m",
                    avgBlockTimeType: "m",
                    averageBlockTime: numbro(this.props.status.lastMinuteBlockTime/1000).format('0,0.00')
                })
                break;
            case "h":
                this.setState({
                    blockTimeText: "1h",
                    avgBlockTimeType: "h",
                    averageBlockTime: numbro(this.props.status.lastHourBlockTime/1000).format('0,0.00')
                })
                break;
            case "d":
                this.setState({
                    blockTimeText: "1d",
                    avgBlockTimeType: "d",
                    averageBlockTime: numbro(this.props.status.lastDayBlockTime/1000).format('0,0.00')
                })
                break;

        }
    }

    handleSwitchVotingPower = (type,e) => {
        e.preventDefault();
        switch (type){
            case "":
                this.setState({
                    votingPowerText: "Now",
                    avgVotingPowerType: "",
                    votingPower: numbro(this.props.status.activeVotingPower).format('0,0.00a')
                })
                break;
            case "h":
                this.setState({
                    votingPowerText: "1h",
                    avgVotingPowerType: "h",
                    votingPower: numbro(this.props.status.lastHourVotingPower).format('0,0.00a')
                })
                break;
            case "d":
                this.setState({
                    votingPowerText: "1d",
                    avgVotingPowerType: "d",
                    votingPower: numbro(this.props.status.lastDayVotingPower).format('0,0.00a')
                })
                break;

        }
    }

    render(){
        if (this.props.loading){
            return <Spinner type="grow" color="primary" />
        }
        else {
            if (this.props.statusExist && this.props.status.prevotes){
                return(
                    <Row className="status text-center">
                        <Col lg={3} md={6}>
                            <Card body>
                                <CardTitle>Latest Block Height</CardTitle>
                                <CardText>
                                    <span className="display-4 value text-primary">{this.state.blockHeight}</span>
                                    {this.state.blockTime}
                                </CardText>   
                            </Card>
                        </Col>
                        <Col lg={3} md={6}>
                            <Card body>
                                <UncontrolledDropdown size="sm" className="more">
                                    <DropdownToggle>
                                        <i className="material-icons">more_vert</i>
                                    </DropdownToggle>
                                    <DropdownMenu>
                                        <DropdownItem onClick={(e) => this.handleSwitchBlockTime("", e)}>All Time</DropdownItem>
                                        {this.props.status.lastMinuteBlockTime?<DropdownItem onClick={(e) => this.handleSwitchBlockTime("m", e)}>Last Minute</DropdownItem>:''}
                                        {this.props.status.lastHourBlockTime?<DropdownItem onClick={(e) => this.handleSwitchBlockTime("h", e)}>Last Hour</DropdownItem>:''}
                                        {this.props.status.lastDayBlockTime?<DropdownItem onClick={(e) => this.handleSwitchBlockTime("d", e)}>Last Day</DropdownItem>:''}
                                    </DropdownMenu>
                                </UncontrolledDropdown>
                                <CardTitle>Average Block Time ({this.state.blockTimeText})</CardTitle>
                                <CardText>
                                    <span className="display-4 value text-primary">{this.state.averageBlockTime}</span>seconds
                                </CardText>   
                            </Card>
                        </Col>
                        <Col lg={3} md={6}>
                            <Card body>
                                <CardTitle>Active Validators</CardTitle>
                                <CardText><span className="display-4 value text-primary">{this.state.numValidators}</span>out of {this.state.totalNumValidators} validators</CardText>   
                            </Card>
                        </Col>
                        <Col lg={3} md={6}>
                            <Card body>
                                <UncontrolledDropdown size="sm" className="more">
                                    <DropdownToggle>
                                        <i className="material-icons">more_vert</i>
                                    </DropdownToggle>
                                    <DropdownMenu>
                                        <DropdownItem onClick={(e) => this.handleSwitchVotingPower("", e)}>Now</DropdownItem>
                                        {this.props.status.lastHourVotingPower?<DropdownItem onClick={(e) => this.handleSwitchVotingPower("h", e)}>Last Hour</DropdownItem>:''}
                                        {this.props.status.lastDayVotingPower?<DropdownItem onClick={(e) => this.handleSwitchVotingPower("d", e)}>Last Day</DropdownItem>:''}
                                    </DropdownMenu>
                                </UncontrolledDropdown>
                                <CardTitle>Online Voting Power ({this.state.votingPowerText})</CardTitle>
                                <CardText><span className="display-4 value text-primary">{this.state.votingPower}</span>from {this.state.bondedTokens} {Meteor.settings.public.stakingDenom}s delegated</CardText>   
                            </Card>
                        </Col>
                    </Row>
                )
            }
            else{
                return <div></div>
            }
        }
    }
}