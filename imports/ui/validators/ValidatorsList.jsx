import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Nav, NavItem, NavLink, Card } from 'reactstrap';
import List from './ListContainer.js';
import ChainStates from '../components/ChainStatesContainer.js'
import i18n from 'meteor/universe:i18n';

const T = i18n.createComponent();

const renderToggleIcon = (order) =>
    <i className="material-icons"> {(order == 1)?'arrow_drop_up':'arrow_drop_down'}</i>;

export default class Validators extends Component{
    constructor(props){
        super(props);
        this.state = {
            monikerDir: 1,
            votingPowerDir: -1,
            uptimeDir: -1,
            commissionDir: 1,
            selfDelDir: 1,
            statusDir: 1,
            jailedDir: 1,
            priority: 0
        }
    }

    toggleDir(field, e){
        e.preventDefault();
        switch(field){
            case 0:
                if (this.state.monikerDir==1){this.setState({monikerDir:-1});}
                else{this.setState({monikerDir:1});}
                this.setState({priority:0});
                break;
            case 1:
                if (this.state.votingPowerDir==1){this.setState({votingPowerDir:-1});}
                else{this.setState({votingPowerDir:1});}
                this.setState({priority:1});
                break;
            case 2:
                if (this.state.uptimeDir==1){this.setState({uptimeDir:-1});}
                else{this.setState({uptimeDir:1});}
                this.setState({priority:2});
                break;
            case 3:
                if (this.state.commissionDir==1){this.setState({commissionDir:-1});}
                else{this.setState({commissionDir:1});}
                this.setState({priority:3});
                break;
            case 4:
                if (this.state.selfDelDir==1){this.setState({selfDelDir:-1});}
                else{this.setState({selfDelDir:1});}
                this.setState({priority:4});
                break;
            case 5:
                if (this.state.statusDir==1){this.setState({statusDir:-1});}
                else{this.setState({statusDir:1});}
                this.setState({priority:5});
                break;
            case 6:
                if (this.state.jailedDir==1){this.setState({jailedDir:-1});}
                else{this.setState({jailedDir:1});}
                this.setState({priority:6});
                break;
        }
    }

    render() {
        let title = <T>validators.active</T>;
        let desc = <T>validators.listOfActive</T>;
        if (this.props.inactive){
            title = <T>validators.inactive</T>;
            desc = <T>validators.listOfInactive</T>;
        }

        return <div id="validator-list">
            <Row>
                <Col lg={3} xs={12}><h1 className="d-none d-lg-block">{title}</h1></Col>
                <Col lg={9} xs={12} className="text-lg-right"><ChainStates /></Col>
            </Row>
            <Nav pills className="status-switch">
                <NavItem>
                    <NavLink tag={Link} to="/validators" active={(this.props.match.url == "/validators")}>Active</NavLink>
                </NavItem>
                <NavItem>
                    <NavLink tag={Link} to="/validators/inactive"
                             active={(this.props.match.url.indexOf("inactive")>0)}>
                        Inactive
                    </NavLink>
                </NavItem>
            </Nav>
            <p className="lead">{desc}</p>
            <Row className="validator-list">
                <Col md={12}>
                    <Card body>
                        <Row className="header text-nowrap">
                            <Col className="d-none d-md-block counter" md={1}>&nbsp;</Col>
                            <Col className="moniker" md={2} onClick={(e) => this.toggleDir(0,e)}><i className="material-icons">perm_contact_calendar</i> <span className="d-inline-block d-md-none d-lg-inline-block"><T>validators.moniker</T></span> {renderToggleIcon(this.state.monikerDir)} </Col>
                            <Col className="voting-power" md={3} lg={2} onClick={(e) => this.toggleDir(1,e)}><i className="material-icons">power</i> <span className="d-inline-block d-md-none d-lg-inline-block"><T>common.votingPower</T></span> {renderToggleIcon(this.state.votingPowerDir)} </Col>
                            <Col className="self-delegation" md={1} onClick={(e) => this.toggleDir(4,e)}><i className="material-icons">equalizer</i> <span className="d-md-none d-lg-inline-block"><T>validators.selfPercentage</T></span> {renderToggleIcon(this.state.selfDelDir==1)} </Col>
                            {(!this.props.inactive)?<Col className="commission" md={1} lg={2} onClick={(e) => this.toggleDir(3,e)}><i className="material-icons">call_split</i> <span className="d-inline-block d-md-none d-lg-inline-block"><T>validators.commission</T></span> {renderToggleIcon(this.state.commissionDir==1)}</Col>:''}
                            {(!this.props.inactive)?<Col className="uptime" md={2} lg={3} onClick={(e) => this.toggleDir(2,e)}><i className="material-icons">flash_on</i> <span className="d-inline-block d-md-none d-lg-inline-block"><T>validators.uptime</T> ({Meteor.settings.public.uptimeWindow} <i className="fas fa-cube"></i>)</span> {renderToggleIcon(this.state.uptimeDir==1)}</Col>:''}
                            {(this.props.inactive)?<Col className="last-seen" md={3}><i className="far fa-clock"></i> <span className="d-md-none d-lg-inline-block"><T>validators.lastSeen</T> (UTC)</span></Col>:''}
                            {(this.props.inactive)?<Col className="bond-status d-none d-md-block" md={1} onClick={(e) => this.toggleDir(5,e)}><i className="material-icons">toggle_on</i> <span className="d-md-none d-lg-inline-block"><T>validators.status</T></span> {renderToggleIcon(this.state.statusDir)} </Col>:''}
                            {(this.props.inactive)?<Col className="jail-status d-none d-md-block" md={1} onClick={(e) => this.toggleDir(6,e)}><i className="material-icons">lock</i> <span className="d-md-none d-lg-inline-block"><T>validators.jailed</T></span> {renderToggleIcon(this.state.jailedDir)} </Col>:''}
                        </Row>
                    </Card>
                    {(this.props.inactive)?<List
                            inactive={this.props.inactive}
                            monikerDir={this.state.monikerDir}
                            votingPowerDir={this.state.votingPowerDir}
                            uptimeDir={this.state.uptimeDir}
                            commissionDir={this.state.commissionDir}
                            selfDelDir={this.state.selfDelDir}
                            statusDir={this.state.statusDir}
                            jailedDir={this.state.jailedDir}
                            priority={this.state.priority}
                            status={this.props.status}
                        />:<List
                            monikerDir={this.state.monikerDir}
                            votingPowerDir={this.state.votingPowerDir}
                            uptimeDir={this.state.uptimeDir}
                            commissionDir={this.state.commissionDir}
                            selfDelDir={this.state.selfDelDir}
                            priority={this.state.priority}
                        />}
                </Col>
            </Row>
        </div>
    }

}