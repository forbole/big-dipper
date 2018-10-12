import React from 'react';
import {
  Badge,
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

import { Link } from 'react-router-dom';

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
          <NavbarBrand tag={Link} to="/">The Big Dipper <Badge color="secondary">beta</Badge></NavbarBrand>
          <NavbarToggler onClick={this.toggle} />
          <Collapse isOpen={this.state.isOpen} navbar>
            <Nav className="ml-auto" navbar>
              <UncontrolledDropdown nav inNavbar>
                <DropdownToggle nav caret>
                  Validators
                </DropdownToggle>
                <DropdownMenu right>
                  <DropdownItem tag={Link} to="/validators">
                    Active Validators
                  </DropdownItem>
                  <DropdownItem divider />
                  <DropdownItem tag={Link} to="/validators/revoked">
                    Revoked Validators
                  </DropdownItem>
                </DropdownMenu>
              </UncontrolledDropdown>
              <NavItem>
                <NavLink tag={Link} to="/blocks">Blocks</NavLink>
              </NavItem>
              <NavItem>
                <NavLink tag={Link} to="/proposals">Proposals</NavLink>
              </NavItem>
            </Nav>
          </Collapse>
        </Navbar>
    );
  }
}