import React, { Component } from 'react';

class HeaderRecord extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        return(
            <thead>
                <tr>
                    <th className="height">Height</th>
                    <th className="hash">Hash</th>
                    <th className="no-of-txs">No. of Txs</th>
                    <th className="time">Time</th>
                </tr>
            </thead>
        );
    }
}

export default HeaderRecord;