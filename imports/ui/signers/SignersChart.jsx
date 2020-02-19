import React, { Component } from 'react';
import {Row, Col, Spinner, Card, CardBody, Container} from 'reactstrap';
import i18n from 'meteor/universe:i18n';
import Signer from "./signer";
import numbro from "numbro";
import SentryBoundary from '../components/SentryBoundary.jsx';
import {HorizontalBar} from 'react-chartjs-2';

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

        if (this.props.blocks != prevProps.blocks){
            if (this.props.blocks.length > 0 && this.props.validators.length > 0){
                for(let i = 0; i < this.props.validators.length; i++) {
                    let validator = this.props.validators[i]
                    signersObj[validator.address] = {
                        moniker: validator.description.moniker,
                        operatorAddress: validator.operator_address,
                        address: validator.address,
                        website: validator.description.website,
                        numSigned: 0
                    }
                }

                for(let j = 0; j < this.props.blocks.length; j++) {
                    let block = this.props.blocks[j]
                    for(let k = 0; k < block.validators.length; k++) {
                        if(signersObj[block.validators[k]] !== undefined) {
                            signersObj[block.validators[k]].numSigned++
                        }
                    }
                }

                for (const sig of Object.values(signersObj)) {
                    labels.push(sig.moniker)
                    data.push(sig.numSigned)
                    let percentSigned = (sig.numSigned / this.props.blocks.length) * 100.0
                    let colour = 'rgba(8, 189, 28, 0.8)'
                    if(percentSigned <= 98) {
                        colour = 'rgba(255, 189, 28, 0.8)'
                    }
                    if(percentSigned <= 90) {
                        colour = 'rgba(189, 8, 28, 0.8)'
                    }
                    backgroundColors.push(colour);
                    signersArray.push(sig)
                }

                let chartHeight = 50*data.length;

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