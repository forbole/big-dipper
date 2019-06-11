import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Card, Table, Row, Col, Nav, NavItem, NavLink, Spinner } from 'reactstrap';
import moment from 'moment';
import { Meteor } from 'meteor/meteor';
import numbro from 'numbro';
import i18n from 'meteor/universe:i18n';
import PChart from '../components/Chart.jsx';
import Account from '../components/Account.jsx';

const T = i18n.createComponent();
const displayTime = (time) => {
    return moment.utc(time).format("D MMM YYYY, h:mm:ssa");
}
let DOWNTIMECHUCK = 4;
const aggregateData = (missedRecords) => {
    let aggregatedMissedRecords = [];
    let isChainOngoing = false;
    missedRecords.forEach((record, i) => {
        let length = aggregatedMissedRecords.length;
        if (isChainOngoing) {
            let chain = aggregatedMissedRecords[length - 1];
            if (chain.blocks[chain.blocks.length - 1].blockHeight - record.blockHeight == 1) {
                chain.blocks.push(record);
            } else {
                aggregatedMissedRecords.push(record);
                isChainOngoing = false;
            }

        } else if (length >= DOWNTIMECHUCK && (aggregatedMissedRecords[length - DOWNTIMECHUCK].blockHeight - record.blockHeight) == DOWNTIMECHUCK) {
            let chain = {
                blocks: aggregatedMissedRecords.splice(length - DOWNTIMECHUCK)
            }
            chain.blocks.push(record);
            aggregatedMissedRecords.push(chain);
            isChainOngoing = true;
        } else {
            aggregatedMissedRecords.push(record);
        }
    })
    return aggregatedMissedRecords;
}

class MissedBlocksTable extends Component{
    constructor(props){
        super(props);

        this.state = {
            expandedRow: -1
        }
    }
    toggleExpansion(e) {
        let targetIndex = Number(e.target.dataset.index);
        this.setState({expandedRow: this.state.expandedRow === targetIndex? -1:targetIndex});
    }

    renderExpandIcon(index) {
        return <i className="material-icons" onClick={this.toggleExpansion.bind(this)} data-index={index}> {(this.state.expandedRow === index)?'arrow_drop_down':'arrow_right'}</i>
    }

    renderSubRow(record, index) {
        return this.renderRow(record, 'sub'+index, null, true);
    }

    renderRow(record, index, _, isSub=false) {
        if (record.blocks) {
            let isExpanded = this.state.expandedRow === index;
            let chainSize = record.blocks.length;
            let startBlock = record.blocks[chainSize - 1];
            let lastBlock = record.blocks[0];
            let mainRow = [<tr className='main-row' key={index}>
                <td className='caret' rowSpan={isExpanded?chainSize + 1:1}>{this.renderExpandIcon(index)}</td>
                <td colSpan='2'>
                    {`${startBlock.blockHeight} - ${lastBlock.blockHeight}`}
                </td>
                <td colSpan='4'>
                    {`${displayTime(startBlock.time)} - ${displayTime(lastBlock.time)}`}
                </td>
            </tr>]
            let subRows = isExpanded?record.blocks.map(this.renderSubRow.bind(this)):[];
            return mainRow.concat(subRows);
        }
        else {
            return <tr key={index} className={isSub?'sub-row':'main-row'}>
                <td colSpan={isSub?1:2}>{ record.blockHeight }</td>
                <td><Account address={record[this.props.type=='voter'?'proposer':'voter']}/></td>
                <td>{ displayTime(record.time) }</td>
                <td>{ record.timeDiff + ' ms'}</td>
                <td>{ record.missCount }</td>
                <td>{ numbro(record.missCount / record.totalCount).format('0.0%') }</td>
            </tr>
        }
    }

    render() {
        return <Table className="missed-records-table">
            <thead><tr>
                <th colSpan='2'>Block Height</th>
                <th>{this.props.type=='voter'?'Proposer':'Voter'}</th>
                <th>Commit Time</th>
                <th>Block Time</th>
                <th>Missed Count</th>
                <th>Missed Ratio</th>
            </tr></thead>
            <tbody>
                {aggregateData(this.props.missedRecords).map(this.renderRow.bind(this))}
            </tbody>
        </Table>

    }
}
const BATCHSIZE = 15;
class TimeDistubtionChart extends Component{
    populateChartData() {
        let timeline = [];
        let breakdown = [];
        let i;
        for (i = 0;i < (7 * 24); i ++)
            breakdown.push(0);
        let prevBatch = null;
        this.props.missedRecords.forEach((record) => {
            let time = moment(record.time)
            breakdown[time.day() * 24 + time.hour()] += 1;
            if (prevBatch && time.diff(prevBatch) >= 0) {
                timeline[timeline.length - 1].y = timeline[timeline.length - 1].y + 1
            } else {
                prevBatch = time.minutes(Math.floor(time.minute()/BATCHSIZE) * BATCHSIZE).seconds(0);
                timeline.push({
                    x: prevBatch,
                    y: 1
                })
            }
        })


        return {
            timeline,
            breakdown
        }
    }

    populateTimelineChart(timeline) {
        let layout = [['yAxis','barPlot'],[null, 'xAxis']];
        let scales = [{
            scaleId: 'xScale',
            type: 'Time'
        }, {
            scaleId: 'yScale',
            type: 'Linear'
        }];
        let datasets = [{
            datasetId: 'timeline',
            data: timeline
        }];
        let components = {
            plots: [{
                plotId: 'barPlot',
                type: 'Bar',
                x: {
                    value: (d, i, ds) => d.x.toDate(),
                    scale: 'xScale'
                },
                y: {
                    value: (d, i, ds) => d.y,
                    scale: 'yScale'
                },
                datasets: ['timeline'],
                interactions: {
                    PanZoom: {
                        xScales: ['xScale'],
                        yScales: ['yScale']
                    }
                }
            }],
            axes: [{
                axisId: 'xAxis',
                type: 'Time',
                scale: 'xScale',
                orientation: 'bottom',
                interactions: {
                    PanZoom: {
                        xScales: ['xScale']
                    }
                }
            },{
                axisId: 'yAxis',
                type: 'Numeric',
                scale: 'yScale',
                orientation: 'left',
                interactions: {
                    PanZoom: {
                        yScales: ['yScale']
                    }
                }
            }],
        };
        let config = {
            height:'300px',
            width: '600px',
            margin: 'auto'
        }
        return {layout, datasets, scales, components, config};
    }

    populateBreakDownChart(breakdown) {
        let layout = [
            ['yAxis','heatMap'],
            [null, 'xAxis'],
            [null, 'colorLegend']
        ];
        let scales = [{
            scaleId: 'xScale',
            type: 'Category'
        }, {
            scaleId: 'yScale',
            type: 'Category'
        }, {
            scaleId: 'colorScale',
            type: 'InterpolatedColor'
        }];
        let datasets = [{
            datasetId: 'breakdown',
            data: breakdown
        }];
        const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
        let components = {
            plots: [{
                plotId: 'heatMap',
                type: 'Rectangle',
                x: {
                    value: (d, i, ds) => i % 24,
                    scale: 'xScale'
                },
                y: {
                    value: (d, i, ds) => daysOfWeek[Math.floor(i / 24)],
                    scale: 'yScale'
                },
                attrs: [{
                    attr: 'fill',
                    value: (d) => d,
                    scale: 'colorScale'
                }, {
                    attr: 'stroke',
                    value: 'rgba(0,0,0,0.5)'
                }],
                datasets: ['breakdown']
            }],
            axes: [{
                axisId: 'xAxis',
                type: 'Category',
                scale: 'xScale',
                orientation: 'bottom',
            },{
                axisId: 'yAxis',
                type: 'Category',
                scale: 'yScale',
                orientation: 'left',
                }
            ],
            legends: [{
                legendId: 'colorLegend',
                type: 'InterpolatedColor',
                plotIds: ['heatMap'],
                colorScaleId: 'colorScale',
            }],
        };
        let config = {
            height:'300px',
            width: '600px',
            margin: 'auto'
        }
        return {layout, datasets, scales, components, config};
    }
    render () {
        let data = this.populateChartData();
        return <Row>
            <Col md={6}><Card className='timeilne'>
                <PChart {...this.populateTimelineChart(data.timeline)} />
            </Card></Col>
            <Col md={6}><Card className='breakdown'>
                <PChart {...this.populateBreakDownChart(data.breakdown)} />
            </Card></Col>
        </Row>
    }
}

export {
    MissedBlocksTable,
    TimeDistubtionChart
}