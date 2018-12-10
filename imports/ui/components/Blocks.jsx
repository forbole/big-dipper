import React from 'react';
// import {
//   Navbar,
//   Nav,
//   NavItem,
//   NavLink } from 'reactstrap';

export default class Block extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
        <div className={this.props.exists?'full-block':'empty-block'}></div>
    );
  }
}