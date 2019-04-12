import React, { Component } from 'react';
import { Row, Col } from 'reactstrap';

class HeaderRecord extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        return(
            <Row className="header text-nowrap d-none d-sm-flex">                
                <Col sm={2}><i className="fas fa-database"></i> <span className="d-none d-md-inline">Height</span></Col>
                <Col sm={2}><i className="fas fa-hashtag"></i> <span className="d-none d-md-inline">Hash</span></Col>
                <Col sm={3} md={2} lg={3}><i className="material-icons">perm_contact_calendar</i> <span className="d-none d-md-inline">Proposer</span></Col>
                <Col sm={1} md={2}><i className="fas fa-sync"></i> <span className="d-none d-md-inline">No. of Txs</span></Col>
                <Col sm={4} lg={3}><i className="far fa-clock"></i> <span className="d-none d-md-inline">Time (UTC)</span></Col>
            </Row>
        );
    }
}

export default HeaderRecord;