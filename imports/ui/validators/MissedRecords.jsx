import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Table, Row, Col, Nav, NavItem, NavLink, Spinner } from 'reactstrap';
import moment from 'moment';
import { Meteor } from 'meteor/meteor';
import { Helmet } from 'react-helmet';
import i18n from 'meteor/universe:i18n';
import PChart from '../components/Chart.jsx';

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
				<td>{ record.proposer }</td>
				<td>{ displayTime(record.time) }</td>
				<td>{ record.timeDiff }</td>
				<td>{ record.missCount }</td>
				<td>{ record.missCount / record.totalCount }</td>
			</tr>
		}
	}
    populateChartData() {
        let timeline = [];
        let breakdown = [];
        let i, j;
        for (i = 0;i < 7; i ++) {
            breakdown.push([])
            for (j = 0; j < 24; j ++)
                breakdown[i].push(0);
        }
        let prevBatch = null;
        this.props.missedRecords.forEach((record) => {
            let time = moment(record.time)
            breakdown[time.day()][time.hour()] += 1;
            if (prevBatch && time.diff(prevBatch) < ONEHOUR) {
                timeline[timeline.length - 1].y = timeline[timeline.length - 1].y + 1
            } else {
                timeline.push({
                    x: time.minutes(0).seconds(0),
                    y: 1
                })
            }
        })

        console.log(timeline)
        console.log(breakdown)
    }

    render() {
        this.populateChartData();
    	return <Table className="missed-records-table">
    		<thead><tr>
    			<th colSpan='2'> Block# </th>
    			<th> Proposer </th>
    			<th> Commit Time </th>
    			<th> Block Time </th>
    			<th> Missed Count </th>
    			<th> Missed Ratio </th>
    		</tr></thead>
    		<tbody>
    			{aggregateData(this.props.missedRecords).map(this.renderRow.bind(this))}
    		</tbody>
    	</Table>

    }
}
const ONEHOUR = 60 * 60 * 1000;
class TimeDistubtionChart extends Component{

    populateChartData() {
        let timeline = [];
        let breakdown = [];
        for (i = 0;i < 7; i ++) {
            breakdown.push([])
            for (j = 0; j < 24; j ++)
                breakdown[i].push(0);
        }
        let prevBatch = null;
        this.props.missedRecords.forEach((record) => {
            let time = moment(record.time)
            breakdown[time.day()][time.hour()] += 1;
            if (prevBatch && time.diff(prevBatch) < ONEHOUR) {
                timeline[timeline.length - 1].y = timeline[timeline.length - 1].y + 1
            } else {
                timeline.push({
                    x: time.minutes(0).seconds(0),
                    y: 1
                })
            }
        })


        let layout = [['linePlot']];
        let scales = [{
            scaleId: 'colorScale',
            type: 'Color',
            domain: ['Yes', 'Abstain', 'No', 'NoWithVeto', 'N/A'],
            range: ['#4CAF50', '#ff9800', '#e51c23', '#9C27B0', '#BDBDBD']
        }];
        let components = {
            plots: [{
                plotId: 'linePlot',
                type: 'Line',
                x: {
                    value: (d, i, ds) => d.votingPower
                },
                y: {
                    value: (d, i, ds) => d.votingPower
                },
                datasets: [this.state.breakDownSelection]
            }]
        };
        let config = {
            height:'300px',
            width: '300px',
            margin: 'auto'
        }
        return {layout, datasets, scales, components, config};
    }

}

export {
    MissedBlocksTable,
    TimeDistubtionChart
}