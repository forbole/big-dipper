import React, { Component } from 'react';

class HeaderRecord extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        return(
            <thead>
                <tr>
                    <th className="height"><i className="fas fa-database"></i> Height</th>
                    <th className="hash"><i className="fas fa-hashtag"></i> Hash</th>
                    <th className="no-of-txs"><i className="fas fa-sync"></i> No. of Txs</th>
                    <th className="time"><i className="far fa-clock"></i> Time (UTC)</th>
                </tr>
            </thead>
        );
    }
}

export default HeaderRecord;