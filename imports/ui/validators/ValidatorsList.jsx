import React, { Component } from 'react';
import { Table, Badge, Container, Row, Col } from 'reactstrap';
import List from './ListContainer.js';

export default class Validators extends Component{
    constructor(props){
        super(props);
        
    }

    render() {
        return <div>
        <h1>{this.props.jailed?'Jailed ':''}Validators <Badge color="primary">{Meteor.settings.public.chainId}</Badge></h1>
        <p className="lead">{this.props.jailed?'These validators have been jailed. If you know any of them, please ask them to unjail.':'Here is a list of active validators.'}</p>
            <Row>
                <Col md={12}>
                    <Table striped className="validator-list">
                        <thead>
                            <tr>
                                <th className="d-none d-md-table-cell counter">&nbsp;</th>
                                <th className="moniker"><i className="material-icons">perm_contact_calendar</i> <span className="d-none d-sm-inline">Moniker</span></th>
                                <th className="voting-power"><i className="material-icons">power</i> <span className="d-none d-sm-inline">Voting Power</span></th>
                                <th className="status"><i class="material-icons">toggle_on</i> <span className="d-none d-sm-inline">Status</span></th>
                                <th className="uptime"><i className="material-icons">flash_on</i> <span className="d-none d-sm-inline">Uptime (last {Meteor.settings.public.uptimeWindow} blocks)</span></th>
                                <th className="last-seen"><i className="material-icons">access_time</i> <span className="d-none d-sm-inline">Last Seen</span></th>
                            </tr>
                        </thead>
                        <List jailed={this.props.jailed}/>
                    </Table>
                </Col>
            </Row>
        </div>
    }

}