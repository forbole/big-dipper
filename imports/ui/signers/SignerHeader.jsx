import React, { Component } from 'react';
import { Row, Col } from 'reactstrap';
import i18n from 'meteor/universe:i18n';

const T = i18n.createComponent();
class SignerHeader extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        return(
            <Row className="header text-nowrap d-none d-sm-flex">
                <Col xs={1}><i className="far fa-id-badge"></i> <span className="d-none d-md-inline"><T>validators.moniker</T></span></Col>
                <Col xs={4}><i className="fas fa-at"></i> <span className="d-none d-md-inline"><T>validators.operatorAddress</T></span></Col>
                <Col xs={3}><i className="fas fa-desktop"></i> <span className="d-none d-md-inline"><T>validators.website</T></span></Col>
                <Col xs={1}><i className="fas fa-hashtag"></i> <span className="d-none d-md-inline"><T>signers.signed</T></span></Col>
                <Col xs={1}><i className="fas fa-exclamation-circle"></i> <span className="d-none d-md-inline"><T>signers.percentMissed</T></span></Col>
                <Col xs={2}><i className="fas fa-clock"></i> <span className="d-none d-md-inline"><T>validators.lastSeen</T></span></Col>
            </Row>
        );
    }
}

export default SignerHeader;