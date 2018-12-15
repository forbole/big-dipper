import React, { Component } from 'react';

class HeaderRecord extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        return(
            <thead>
                <tr>
                    <th className="height"><i className="fas fa-database"></i> <span className="d-none d-sm-inline">Height</span></th>
                    <th className="hash"><i className="fas fa-hashtag"></i> <span className="d-none d-sm-inline">Hash</span></th>
                    <th className="proposer"><i className="material-icons">perm_contact_calendar</i> <span className="d-none d-sm-inline">Proposer</span></th>
                    <th className="no-of-txs"><i className="fas fa-sync"></i> <span className="d-none d-sm-inline">No. of Txs</span></th>
                    <th className="time"><i className="far fa-clock"></i> <span className="d-none d-sm-inline">Time (UTC)</span></th>
                </tr>
            </thead>
        );
    }
}

export default HeaderRecord;