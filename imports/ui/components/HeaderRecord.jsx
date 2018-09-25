import React, { Component } from 'react';

class HeaderRecord extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        return(
            <thead>
                <tr>
                    <th className="innerblock1">Block Height</th>
                    <th className="innerblock2">Hash</th>
                    <th xs="3" className="innerblock">Number of Txs</th>
                    <th xs="3" className="innerblock">Block Time</th>
                </tr>
            </thead>
        );
    }
}

export default HeaderRecord;