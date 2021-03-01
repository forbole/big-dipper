import React, { Component } from 'react';
import { Table, UncontrolledCollapse, Button} from 'reactstrap';
import i18n from 'meteor/universe:i18n';
import Coin from '/both/utils/coins.js';
import PropTypes from 'prop-types';
import Account from '../components/Account.jsx';



const T = i18n.createComponent();



export default class Liquidate extends Component {
    constructor(props) {
        super(props)
        this.state = {
            liquidate: null
        }
    }

    render() {
        if (this.props) {
            return <div><Button className="ledger-buttons-group my-2" color="primary" id="toggler_liquidate" size="sm"><T>transactions.info</T>  </Button>
                <UncontrolledCollapse toggler="#toggler_liquidate">
                    <Table responsive>
                        <tbody>
                            <tr>
                                <th scope="row"><T>cdp.owner</T></th>
                                <td>{this.props.address ? <Account address={this.props.address} /> : null}</td>
                            </tr>
                            <tr>
                                <th scope="row"><T>cdp.collateral</T></th>
                                <td>{this.props.collateral ?
                                    <span className='coin'>{new Coin((this.props.collateral.amount), this.props.collateral.denom).toString(4)}</span> : null}
                                </td>
                            </tr>
                        </tbody>
                    </Table>
                </UncontrolledCollapse>
            </div>
        }
        else {
            return <div />
        }
    }
}

Liquidate.propTypes = {
    address: PropTypes.string.isRequired,
    collateral: PropTypes.object.isRequired
}
