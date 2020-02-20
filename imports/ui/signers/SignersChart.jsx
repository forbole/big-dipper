import React, { Component } from 'react';
import {Row, Col, Spinner, Card, CardBody, Container} from 'reactstrap';
import i18n from 'meteor/universe:i18n';
import Signer from "./signer";
import numbro from "numbro";
import SentryBoundary from '../components/SentryBoundary.jsx';
import {HorizontalBar} from 'react-chartjs-2';
import SignerUtils from "./utils";

const T = i18n.createComponent();
class SignersChart extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: {},
            options: {},
            height: 0
        }
    }

    componentDidUpdate(prevProps){
        let signersArray = [];
        let signersObj = {};
        let labels = [];
        let data = [];
        let backgroundColors = [];

        if (this.props.blocks != prevProps.blocks && this.props.validators != prevProps.validators){
            if (this.props.blocks.length > 0 && this.props.validators.length > 0){
                signersObj = SignerUtils.process(this.props.validators, this.props.blocks)

                for (const sig of Object.values(signersObj)) {
                    labels.push(sig.moniker)
                    data.push(sig.numSigned)
                    let alpha = (sig.numSigned / this.props.blocks.length)
                    if(alpha < 0.3) alpha = 0.3

                    let colour = 'rgba(8, 189, 28, ' + alpha + ')'
                    backgroundColors.push(colour);
                    signersArray.push(sig)
                }

                let chartHeight = 35*data.length;

                this.setState(
                    {
                        data:{
                            labels:labels,
                            datasets: [
                                {
                                    label: 'Num blocks signed',
                                    data: data,
                                    backgroundColor: backgroundColors
                                }
                            ]
                        },
                        options:{
                            maintainAspectRatio: false,
                            scales: {
                                xAxes: [{
                                    ticks: {
                                        beginAtZero:true,
                                        userCallback: function(value, index, values) {
                                            // Convert the number to a string and splite the string every 3 charaters from the end
                                            return numbro(value).format("0,0");
                                        }
                                    }
                                }]
                            }
                        },
                        height: chartHeight
                    }
                )

            }
        }
    }

    render() {
        if (this.props.loading) {
            return (
                <Row>
                    <Col><Spinner type="grow" color="primary" /></Col>
                </Row>
            )
        }
        else if (this.props.blocks.length > 0 && this.state.data.hasOwnProperty('datasets')) {
            return (
                <Container fluid>
                    <h2>Num. Blocks Signed in last {this.props.blocks.length} blocks</h2>
                    <Card>
                        <CardBody id="signer-blocks-chart">
                            <SentryBoundary><HorizontalBar height={this.state.height} data={this.state.data} options={this.state.options} /></SentryBoundary>
                        </CardBody>
                    </Card>
                </Container>
            )
        }
        else{
            return <Row><Col><T>blocks.noBlock</T></Col></Row>
        }
    }
}

export default SignersChart;