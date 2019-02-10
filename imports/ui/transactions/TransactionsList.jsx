import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Table, Badge, Container, Row, Col,
    Nav, NavItem, NavLink, Card, CardBody } from 'reactstrap';
import List from './ListContainer.js';

export default class Transactions extends Component{
    constructor(props){
        super(props);
        this.state = {
            limit: 30,
            monikerDir: 1,
            votingPowerDir: -1,
            uptimeDir: -1,
            proposerDir: -1,
            priority: 2
        }
    }

    render(){
        return <div>
            <h1 className="d-none d-lg-block">Transactions</h1>
            <List limit={this.state.limit} />
        </div>
    }
}