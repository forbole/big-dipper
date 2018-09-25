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

import { Link } from 'react-router-dom';

export default class Footer extends React.Component {
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
        <Navbar color="light" light expand="md" fixed="bottom" id="footer">
          <span className="text-muted">Forbole Limited &copy;2018. </span>
            <Nav className="ml-auto" navbar>
              <NavItem>
                <NavLink href="https://www.github.com/forbole/big_dipper" target="_blank"><i className="fab fa-github"></i> Fork me!</NavLink>
              </NavItem>
            </Nav>
        </Navbar>
    );
  }
}