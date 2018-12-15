import React, { Component } from 'react';
// import { Table } from 'reactstrap';
import moment from 'moment';

export default class Block extends Component {
    constructor(props){
        super(props);
    }

    render() {
        return (
            <tr className="blockrow">
                <td className="innerblock1">{this.props.block.height}</td>
                <td className="innerblock2">{this.props.block.hash}</td>
                <td xs="3" className="innerblock">{this.props.block.transNum}</td>
                <td xs="3" className="innerblock">{moment.utc(this.props.block.time).format("D MMM YYYY, h:mm:ssa")}</td>
            </tr>
        );
    }
}