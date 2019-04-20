import React,{ Component } from 'react';
import {
  Badge,
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  // Input,
  // InputGroup,
  // InputGroupAddon,
  // Button,
  // UncontrolledDropdown,
  // DropdownToggle,
  // DropdownMenu,
  // DropdownItem 
} from 'reactstrap';
import { Link } from 'react-router-dom';
import SearchBar from './SearchBar.jsx';

export default class Header extends Component {
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
        <Navbar color="primary" dark expand="lg" fixed="top">
          <NavbarBrand tag={Link} to="/"><img src="/img/big-dipper.svg" className="img-fluid logo"/> <span className="d-none d-xl-inline-block">The Big Dipper&nbsp;</span><Badge color="secondary">beta</Badge> <Badge color="primary">{Meteor.settings.public.chainId}</Badge></NavbarBrand>
          <SearchBar id="header-search" history={this.props.history} />
          <NavbarToggler onClick={this.toggle} />
          <Collapse isOpen={this.state.isOpen} navbar>
            <Nav className="ml-auto text-nowrap" navbar>
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