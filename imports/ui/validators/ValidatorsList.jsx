import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Table, Badge, Container, Row, Col,
    Nav, NavItem, NavLink, Card, CardBody } from 'reactstrap';
import List from './ListContainer.js';

export default class Validators extends Component{
    constructor(props){
        super(props);
        this.state = {
            monikerDir: 1,
            votingPowerDir: -1,
            uptimeDir: -1,
            commissionDir: 1,
            selfDelDir: 1,
            priority: 3
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
        }
    }

    render() {
        let title = "Active";
        let desc = "Here is a list of active validators.";
        if (this.props.jailed != undefined){
            if (this.props.jailed){
                title = "Jailed";
                desc = 'These validators have been jailed. If you know any of them, please ask them to unjail.';
            }
            else {
                title = "Unbonding";
                desc = "Here is a list of unbonding validators.";
            }
        }

        return <div id="validator-list">
            <h1 className="d-none d-lg-block">{title +" Validators"}</h1>
            <Nav pills className="status-switch">
                <NavItem>
                    <NavLink tag={Link} to="/validators" active={(this.props.match.url == "/validators")}>Active</NavLink>
                </NavItem>
                <NavItem>
                    <NavLink tag={Link} to="/validators/unbonding" active={(this.props.match.url.indexOf("unbonding")>0)}>Unbonding</NavLink>
                </NavItem>
                <NavItem>
                    <NavLink tag={Link} to="/validators/jailed"  active={(this.props.match.url.indexOf("jailed")>0)}>Jailed</NavLink>
                </NavItem>
            </Nav>
            <p className="lead">{desc}</p>
            <Row className="validator-list">
                <Col md={12}>
                    <Card body>
                        <Row className="header">
                            <Col className="d-none d-md-block counter" md={1}>&nbsp;</Col>
                            <Col className="moniker" md={2} onClick={(e) => this.toggleDir(0,e)}><i className="material-icons">perm_contact_calendar</i> <span className="d-inline-block d-md-none d-lg-inline-block">Moniker</span> {(this.state.monikerDir==1)?<i className="material-icons">arrow_drop_up</i>:<i className="material-icons">arrow_drop_down</i>}</Col>
                            <Col className="voting-power" md={3} lg={2} onClick={(e) => this.toggleDir(1,e)}><i className="material-icons">power</i> <span className="d-inline-block d-md-none d-lg-inline-block">Voting Power</span> {(this.state.votingPowerDir==1)?<i className="material-icons">arrow_drop_up</i>:<i className="material-icons">arrow_drop_down</i>}</Col>
                            <Col className="status d-none d-md-block" md={1}><i className="material-icons">toggle_on</i> <span className="d-md-none d-lg-inline-block">Status</span></Col>
                            <Col className="self-delegation" md={1} onClick={(e) => this.toggleDir(4,e)}><i className="material-icons">equalizer</i> <span className="d-md-none d-lg-inline-block">Self%</span> {(this.state.selfDelDir==1)?<i className="material-icons">arrow_drop_up</i>:<i className="material-icons">arrow_drop_down</i>}</Col>
                            {(!this.props.jailed)?<Col className="commission" md={1} lg={2} onClick={(e) => this.toggleDir(3,e)}><i className="material-icons">call_split</i> <span className="d-inline-block d-md-none d-lg-inline-block">Comission</span> {(this.state.commissionDir==1)?<i className="material-icons">arrow_drop_up</i>:<i className="material-icons">arrow_drop_down</i>}</Col>:""}
                            {(!this.props.jailed)?<Col className="uptime" md={2} lg={3} onClick={(e) => this.toggleDir(2,e)}><i className="material-icons">flash_on</i> <span className="d-inline-block d-md-none d-lg-inline-block">Uptime ({Meteor.settings.public.uptimeWindow} <i className="fas fa-cube"></i>)</span> {(this.state.uptimeDir==1)?<i className="material-icons">arrow_drop_up</i>:<i className="material-icons">arrow_drop_down</i>}</Col>:''}
                            {(this.props.jailed)?<Col className="last-seen" md={3}><i className="far fa-clock"></i> <span className="d-md-none d-lg-inline-block">Last Seen (UTC)</span></Col>:''}
                        </Row>
                    </Card>
                    {(this.props.jailed != undefined)?<List 
                            jailed={this.props.jailed} 
                            monikerDir={this.state.monikerDir} 
                            votingPowerDir={this.state.votingPowerDir} 
                            uptimeDir={this.state.uptimeDir}
                            commissionDir={this.state.commissionDir}
                            selfDelDir={this.state.selfDelDir}
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