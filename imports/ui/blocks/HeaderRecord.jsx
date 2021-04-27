import React, { Component } from 'react';
import { Row, Col } from 'reactstrap';
import i18n from 'meteor/universe:i18n';

const T = i18n.createComponent();
class HeaderRecord extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        let homepage = window?.location?.pathname === '/' ? true : false;
        return(
            <Row className="header text-nowrap d-none d-sm-flex">                
                <Col sm={4} lg={homepage ? 4 : 3}><i className="far fa-clock"></i> <span className="d-none d-xl-inline"><T>common.time</T> (UTC)</span></Col>
                <Col sm={2}><i className="fas fa-hashtag"></i> <span className="d-none d-xl-inline"><T>common.hash</T></span></Col>
                <Col sm={3} md={2} lg={3}><i className="fas fa-portrait fa-lg"></i>  <span className="d-none d-xl-inline"><T>blocks.proposer</T></span></Col>
                {homepage ? <Col sm={1} md={1}><span className="d-xl-none"><i className="fas fa-sync"></i></span><span className="ml-n5 d-none d-xl-inline"><i className="fas fa-sync"></i> <span ><T>blocks.numOfTxs</T></span></span></Col> : <Col sm={1} md={2}><i className="fas fa-sync"></i> <span className="d-none d-xl-inline"><T>blocks.numOfTxs</T></span></Col>}
                <Col sm={2}><i className="fas fa-database"></i> <span className="d-none d-xl-inline"><T>common.height</T></span></Col>
            </Row>
        );
    }
}

export default HeaderRecord;