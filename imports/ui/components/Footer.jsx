import React from 'react';
import {
  Navbar,
  Nav,
  NavItem,
  NavLink } from 'reactstrap';

export default class Footer extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
        <Navbar color="light" light expand="md" fixed="bottom" id="footer">
            <span className="text-muted"><a href="https://www.forbole.com" target="_blank">Forbole Limited</a> &copy;2018. </span>
            <Nav className="ml-auto" navbar>
              <NavItem>
                <NavLink href="https://www.forbole.com/privacy-policy/" target="_blank">Privay Policy</NavLink>
              </NavItem>
              <NavItem>
                <NavLink href="https://www.github.com/forbole/big_dipper" target="_blank"><i className="fab fa-github"></i> Fork me!</NavLink>
              </NavItem>
            </Nav>
        </Navbar>
    );
  }
}