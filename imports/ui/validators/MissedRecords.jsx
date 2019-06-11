import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { CardHeader, CardBody, Card, Table, Row, Col, Nav, NavItem, NavLink, Spinner, Input } from 'reactstrap';
import moment from 'moment';
import { Meteor } from 'meteor/meteor';
import numbro from 'numbro';
import i18n from 'meteor/universe:i18n';
import PChart from '../components/Chart.jsx';
import Account from '../components/Account.jsx';
import { InfoIcon } from '../components/Icons.jsx'

const T = i18n.createComponent();
const displayTime = (time) => {
    return moment.utc(time).format("D MMM YYYY, h:mm:ssa");
}
const displayTimeRange = (time) => {
    let startTime = time.format("h:mm");
    let endTime = time.clone().add(BATCHSIZE, 'minute').format("h:mm");
    return `from ${startTime} to ${endTime} on ${time.format("D MMM YYYY")}`;
}
let DOWNTIMECHUCK = 4;

const groupData = (missedStats, missedRecords, target) => {
    let validatorsMap = {};
    missedRecords.forEach((record) => {
        let address = record[target];
        if (!validatorsMap[address]) {
            validatorsMap[address] = [];
        }
        validatorsMap[address].push(record)
    })

    let statsMap = {}
    missedStats.forEach((stats) => {
        let address = stats[target];
        statsMap[address] = stats;
    })

    return Object.keys(validatorsMap).map((address) => {
        return {
            address: address,
            records: validatorsMap[address],
            ...statsMap[address]
        }
    }).sort((a, b) => a.missCount - b.missCount);
}

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
            expandedRow: -1,
            expandedValidator: -1,
            groupByValidators: false
        }
    }

    toggleGroupByValidators = (e) => {
        this.setState({groupByValidators: e.target.checked})
    }

    toggleExpansion = (selection, e) => {
        let targetKey = e.target.dataset.key;
        this.setState({[selection]: this.state[selection] === targetKey? -1:targetKey});
    }

    renderExpandIcon = (selection, key) => {
        return <i className="material-icons" onClick={(e) => this.toggleExpansion(selection, e)} data-key={key}>
            {(this.state[selection] === key)?'arrow_drop_down':'arrow_right'}
        </i>
    }

    renderSubRow= (record, index) => {
        return this.renderRow(record, 'sub'+index, null, true);
    }

    renderRow = (record, index, isSub=false, grouped=false) => {
        if (record.blocks) {
            let isExpanded = Number(this.state.expandedRow) === index;
            let chainSize = record.blocks.length;
            let startBlock = record.blocks[chainSize - 1];
            let lastBlock = record.blocks[0];
            let mainRow = [<tr className='main-row' key={index}>
                <td className='caret' rowSpan={isExpanded?chainSize + 1:1}>{this.renderExpandIcon('expandedRow', index)}</td>
                <td colSpan='2'>
                    {`${startBlock.blockHeight} - ${lastBlock.blockHeight}`}
                </td>
                <td colSpan='5'>
                    {`${displayTime(startBlock.time)} - ${displayTime(lastBlock.time)}`}
                </td>
            </tr>]
            let subRows = isExpanded?record.blocks.map(this.renderSubRow):[];
            return mainRow.concat(subRows);
        }
        else {
            return <tr key={index} className={isSub?'sub-row':'main-row'}>
                <td colSpan={isSub?1:2}>{ record.blockHeight }</td>
                {grouped?null:<td><Account sync={true} address={record[this.props.type=='voter'?'proposer':'voter']}/></td>}
                <td>{ displayTime(record.time) }</td>
                <td>{ record.timeDiff + ' ms'}</td>
                <td>{ record.missCount }</td>
                <td>{ numbro(record.missCount / record.totalCount).format('0.0%') }</td>
                <td>{ `${record.precommitsCount}/${record.validatorsCount}` }</td>
            </tr>
        }
    }

    renderTable = (data, grouped=false) => {
        return <Table className="missed-records-table">
            <thead><tr>
                <th colSpan='2'>Block Height</th>
                {grouped?null:<th>{this.props.type=='voter'?'Proposer':'Voter'}</th>}
                <th>Commit Time</th>
                <th>Block Time</th>
                <th>Missed Count</th>
                <th>Missed Ratio<InfoIcon tooltipText='Missed ratio at the time of the block'/></th>
                <th>Signed Ratio<InfoIcon tooltipText='Number of voted validators to active validators'/></th>
            </tr></thead>
            <tbody>
                {aggregateData(data).map((record, index) => this.renderRow(record, index, grouped=grouped))}
            </tbody>
        </Table>
    }

    renderGroupedTable = () => {
        let target = this.props.type=='voter'?'proposer':'voter';
        let groupedData = groupData(this.props.missedStats, this.props.missedRecords, target);
        return <Table className='missed-records-grouped-table'>
            <thead><tr>
                <th></th>
                <th>{this.props.type=='voter'?'Proposer':'Voter'}</th>
                <th>Missed Count</th>
                <th>Total Count<InfoIcon tooltipText='Number of blocks proposed by same proposer where current validator is an active validator'/></th>
                <th>Missed Ratio</th>
            </tr></thead>
            {groupedData.map((validatorData) => {
                let address = validatorData.address;
                let isExpanded = this.state.expandedValidator === address;

                let mainRow = [<tr key={address} className={`validator-row ${isExpanded?'expanded':''}`}>
                    <td className='caret' rowSpan={isExpanded?2:1}>{this.renderExpandIcon('expandedValidator', address)}</td>
                    <td><Account sync={true} address={address}/></td>
                    <td>{validatorData.missCount}</td>
                    <td>{validatorData.totalCount}</td>
                    <td>{numbro(validatorData.missCount/validatorData.totalCount).format('0.00%')}</td>
                </tr>];
                let subRow = isExpanded?(<tr className='validator-row sub-row'><td colSpan={4}>{this.renderTable(validatorData.records, true)}</td></tr>):[];
                return mainRow.concat(subRow);
            })}
        </Table>
    }

    render() {
        return <Card className="missed-records-table-card">
            <CardHeader></CardHeader>
            <CardBody>
                <div className="float-right"> <Input type="checkbox" onClick={this.toggleGroupByValidators}/> Group By Validators</div>
                {this.state.groupByValidators?this.renderGroupedTable():this.renderTable(this.props.missedRecords)}
            </CardBody>
        </Card>

    }
}
const BATCHSIZE = 15;
const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
class TimeDistubtionChart extends Component{
    populateChartData() {
        let timeline = [];
        let breakdown = [];
        let i;
        for (i = 0;i < (7 * 24); i ++)
            breakdown.push({
                hour: i % 24,
                day: daysOfWeek[Math.floor(i / 24)],
                count: 0
            });
        let prevBatch = null;
        this.props.missedRecords.forEach((record) => {
            let time = moment.utc(record.time)
            breakdown[time.day() * 24 + time.hour()].count += 1;
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
                },
                tooltip: (c, p, data, ds) => `missed ${data.y} blocks ${displayTimeRange(data.x)}`
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
            width: '100%',
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
        let components = {
            plots: [{
                plotId: 'heatMap',
                type: 'Rectangle',
                x: {
                    value: (d, i, ds) => d.hour,
                    scale: 'xScale'
                },
                y: {
                    value: (d, i, ds) => d.day,
                    scale: 'yScale'
                },
                attrs: [{
                    attr: 'fill',
                    value: (d) => d.count,
                    scale: 'colorScale'
                }, {
                    attr: 'stroke',
                    value: 'rgba(200, 200, 200, 0.3)'
                }],
                datasets: ['breakdown'],
                tooltip: (c, p, data, ds) => `missed ${data.count} blocks on ${data.day} at ${data.hour}`
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
            width: '100%',
            margin: 'auto'
        }
        return {layout, datasets, scales, components, config};
    }
    render () {
        let data = this.populateChartData();
        return [
            <Card key='timeilne'>
                <CardHeader>History Missed Blocks</CardHeader>
                <CardBody>
                    <PChart {...this.populateTimelineChart(data.timeline)} />
                </CardBody>
            </Card>,
            <Card key='breakdown'>
                <CardHeader>Missed Blocks By Time of Day</CardHeader>
                <CardBody>
                    <PChart {...this.populateBreakDownChart(data.breakdown)} />
                </CardBody>
            </Card>
        ]
    }
}

export {
    MissedBlocksTable,
    TimeDistubtionChart
}