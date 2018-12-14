import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Table, Badge, Container, Row, Col,
    Nav, NavItem, NavLink } from 'reactstrap';
import List from './ListContainer.js';

export default class Validators extends Component{
    constructor(props){
        super(props);
        
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
                            <th className="moniker"><i className="material-icons">perm_contact_calendar</i> <span className="d-none d-sm-inline">Moniker</span></th>
                            <th className="voting-power"><i className="material-icons">power</i> <span className="d-none d-sm-inline">Voting Power</span></th>
                            <th className="status"><i class="material-icons">toggle_on</i> <span className="d-none d-sm-inline">Status</span></th>
                            <th className="uptime"><i className="material-icons">flash_on</i> <span className="d-none d-sm-inline">Uptime (last {Meteor.settings.public.uptimeWindow} <i class="fas fa-cube"></i>)</span></th>
                            <th className="last-seen"><i className="material-icons">access_time</i> <span className="d-none d-sm-inline">Last Seen</span></th>
                        </tr>
                    </thead>
                    {(this.props.jailed != undefined)?<List jailed={this.props.jailed} />:<List />}
                </Table>
            </Col>
        </Row>
        </div>
    }

}