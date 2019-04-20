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
  Input,
  InputGroup,
  InputGroupAddon,
  Button,
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

  handleSearch = (e) => {
    if (e.key === 'Enter') {
      // console.log(e.target.value);
    }
  }

  render() {
    return (
        <Navbar color="primary" dark expand="lg" fixed="top">
          <NavbarBrand tag={Link} to="/"><img src="/img/big-dipper.svg" className="img-fluid logo"/> <span className="d-none d-xl-inline-block">The Big Dipper&nbsp;</span><Badge color="secondary">beta</Badge> <Badge color="primary">{Meteor.settings.public.chainId}</Badge></NavbarBrand>
          <InputGroup className="d-none d-lg-flex" id="header-search">
              <Input placeholder="Search tx / block / address" onKeyDown={this.handleSearch}/>
          </InputGroup>
          <NavbarToggler onClick={this.toggle} />
          <Collapse isOpen={this.state.isOpen} navbar>
            <Nav className="ml-auto text-nowrap" navbar>
              {/* <UncontrolledDropdown nav inNavbar>
                <DropdownToggle nav caret>
                  Validators
                </DropdownToggle>
                <DropdownMenu right>
                  <DropdownItem tag={Link} to="/validators">
                    Active Validators
                  </DropdownItem>
                  <DropdownItem divider />
                  <DropdownItem tag={Link} to="/validators/jailed">
                    Jailed Validators
                  </DropdownItem>
                </DropdownMenu>
              </UncontrolledDropdown> */}
              <NavItem>
                <NavLink tag={Link} to="/validators">Validators</NavLink>
              </NavItem>
              <NavItem>
                <NavLink tag={Link} to="/blocks">Blocks</NavLink>
              </NavItem>
              <NavItem>
                <NavLink tag={Link} to="/transactions">Transactions</NavLink>
              </NavItem>
              <NavItem>
                <NavLink tag={Link} to="/proposals">Proposals</NavLink>
              </NavItem>
              <NavItem>
                <NavLink tag={Link} to="/voting-power-distribution">Voting Power</NavLink>
              </NavItem>
            </Nav>
          </Collapse>
        </Navbar>
    );
  }
}