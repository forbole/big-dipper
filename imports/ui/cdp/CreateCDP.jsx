import React, { Component } from 'react';
import { Table, Spinner, UncontrolledCollapse, Button, CardBody, Card} from 'reactstrap';
import i18n from 'meteor/universe:i18n';
import Coin from '/both/utils/coins.js';
import PropTypes from 'prop-types';
import SentryBoundary from '../components/SentryBoundary.jsx';
import { Badge } from 'reactstrap';


const T = i18n.createComponent(); 

export default class CreateCDP extends Component {
    constructor(props) {
        super(props)
        this.state = {
            createCDP: null
        }
    }



    render(){
        if (this.state.createCDP){
            return <div><Button className="ledger-buttons-group my-2" color="primary" id="toggler_create_cdp" size="sm"><T>transactions.info</T>  </Button>
                <UncontrolledCollapse toggler="#toggler_create_cdp">
                    <Table responsive>
                        <tbody>
                            <tr>
                                <th scope="row"><T>activities.cdpCollateral</T></th>
                                <td>{(this.props.collateral)?<ListGroupItem>{new Coin(collateral.amount, collateral.denom).toString(6)}</ListGroupItem>:''}</td>
                            </tr>
                            <tr>
                                <th scope="row"><T>activities.cdpPricipal</T></th>
                                <td>{(this.props.principal)?<ListGroupItem>{new Coin(principal.amount, principal.denom).toString(6)}</ListGroupItem>:''}</td>
                            </tr>
                        </tbody>
                    </Table>
                </UncontrolledCollapse>
            </div>
        }
        else{
            return <div />
        }
    }
}

CreateCDP.propTypes = {
    collateral: PropTypes.object.isRequired,
    principal: PropTypes.object.isRequired
}
