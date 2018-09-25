import React from 'react';
import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem } from 'reactstrap';

import { BrowserRouter as Router, Route, Link } from 'react-router-dom';

export default class Header extends React.Component {
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.state = {
      isOpen: false
    };
  }
  toggle() {
    this.setState({
      isOpen: !this.state.isOpen
    }, ()=>{
      console.log(this.state.isOpen);
    });
  }
  render() {
    return (
        <Navbar color="primary" dark expand="md" fixed="top">
          <NavbarBrand tag={Link} to="/">The Big Dipper</NavbarBrand>
          <NavbarToggler onClick={this.toggle} />
          <Collapse isOpen={this.state.isOpen} navbar>
            <Nav className="ml-auto" navbar>
            <NavItem>
                <NavLink tag={Link} to="/blocks">Blocks</NavLink>
              </NavItem>
              <UncontrolledDropdown nav inNavbar>
                <DropdownToggle nav caret>
                  Validators
                </DropdownToggle>
                <DropdownMenu right>
                  <DropdownItem tag={Link} to="/validators">
                    Active Validators
                  </DropdownItem>
                  <DropdownItem tag={Link} to="/validators/candidates">
                    Validators Candidates
                  </DropdownItem>
                  <DropdownItem divider />
                  <DropdownItem tag={Link} to="/validators/revoked">
                    Revoked Validators
                  </DropdownItem>
                </DropdownMenu>
              </UncontrolledDropdown>
            </Nav>
          </Collapse>
        </Navbar>
    );
  }
}