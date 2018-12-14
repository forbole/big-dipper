import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Table, Badge, Container, Row, Col,
    Nav, NavItem, NavLink } from 'reactstrap';
import List from './ListContainer.js';

export default class Validators extends Component{
    constructor(props){
        super(props);
        this.state = {
            monikerDir: 1,
            votingPowerDir: -1,
            uptimeDir: -1,
            proposerDir: -1,
            priority: 2
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
                if (this.state.proposerDir==1){this.setState({proposerDir:-1});}
                else{this.setState({proposerDir:1});}
                this.setState({priority:3});
                break;
        }
    }

    render() {
        let title = "All";
        let desc = "Here is a list of all validators.";
        if (this.props.jailed != undefined){
            if (this.props.jailed){
                title = "Jailed";
                desc = 'These validators have been jailed. If you know any of them, please ask them to unjail.';
            }
            else {
                title = "Active";
                desc = "Here is a list of active validators.";
            }
        }
        return <div>
        <h1>{title +" Validators"} <Badge color="primary">{Meteor.settings.public.chainId}</Badge></h1>
        <Nav pills>
            <NavItem>
                <NavLink tag={Link} to="/validators" active={this.props.match.path=="/validators"}>All</NavLink>
            </NavItem>
            <NavItem>
                <NavLink tag={Link} to="/validators/active" active={this.props.match.path=="/validators/active"}>Active</NavLink>
            </NavItem>
            <NavItem>
                <NavLink tag={Link} to="/validators/jailed"  active={this.props.match.path=="/validators/jailed"}>Jailed</NavLink>
            </NavItem>
        </Nav>
        <p className="lead">{desc}</p>
        <Row>
            <Col md={12}>
                <Table striped className="validator-list">
                    <thead>
                        <tr>
                            <th className="d-none d-md-table-cell counter">&nbsp;</th>
                            <th className="moniker" onClick={(e) => this.toggleDir(0,e)}><i className="material-icons">perm_contact_calendar</i> <span className="d-none d-sm-inline">Moniker</span> {(this.state.monikerDir==1)?<i className="material-icons">arrow_drop_up</i>:<i className="material-icons">arrow_drop_down</i>}</th>
                            <th className="voting-power" onClick={(e) => this.toggleDir(1,e)}><i className="material-icons">power</i> <span className="d-none d-sm-inline">Voting Power</span> {(this.state.votingPowerDir==1)?<i className="material-icons">arrow_drop_up</i>:<i className="material-icons">arrow_drop_down</i>}</th>
                            <th className="status"><i className="material-icons">toggle_on</i> <span className="d-none d-sm-inline">Status</span></th>
                            <th className="uptime" onClick={(e) => this.toggleDir(2,e)}><i className="material-icons">flash_on</i> <span className="d-none d-sm-inline">Uptime ({Meteor.settings.public.uptimeWindow} <i className="fas fa-cube"></i>)</span> {(this.state.uptimeDir==1)?<i className="material-icons">arrow_drop_up</i>:<i className="material-icons">arrow_drop_down</i>}</th>
                            <th className="proposer-priority text-right" onClick={(e) => this.toggleDir(3,e)}><i className="material-icons">swap_vertical_circle</i> <span className="d-none d-sm-inline">Proposer Priority</span> {(this.state.proposerDir==1)?<i className="material-icons">arrow_drop_up</i>:<i className="material-icons">arrow_drop_down</i>}</th>
                        </tr>
                    </thead>
                    {(this.props.jailed != undefined)?<List 
                            jailed={this.props.jailed} 
                            monikerDir={this.state.monikerDir} 
                            votingPowerDir={this.state.votingPowerDir} 
                            uptimeDir={this.state.uptimeDir}
                            proposerDir={this.state.proposerDir} 
                            priority={this.state.priority}
                        />:<List 
                            monikerDir={this.state.monikerDir} 
                            votingPowerDir={this.state.votingPowerDir}
                            uptimeDir={this.state.uptimeDir}
                            proposerDir={this.state.proposerDir}
                            priority={this.state.priority}
                        />}
                </Table>
            </Col>
        </Row>
        </div>
    }

}