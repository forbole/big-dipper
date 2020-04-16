import React, { Component } from 'react';
import { Table, Spinner, UncontrolledCollapse, Button, CardBody, Card, ListGroupItem} from 'reactstrap';
import i18n from 'meteor/universe:i18n';
import Coin from '/both/utils/coins.js';
import PropTypes from 'prop-types';
import SentryBoundary from '../components/SentryBoundary.jsx';
import Account from '../components/Account.jsx';


const T = i18n.createComponent(); 

export default class DrawDebt extends Component {
    constructor(props) {
        super(props)
        this.state = {
            swap: null
        }
    }


    render(){
        if (this.props){
        return <div><Button className="ledger-buttons-group my-2" color="primary" id="toggler" size="sm"><T>transactions.info</T>  </Button>
         <UncontrolledCollapse toggler="#toggler">
         <Table responsive>
                <tbody>
                    <tr>
                        <th scope="row"><T>cdp.sender</T></th>
                        <td>{this.props.sender ? <Account address={this.props.sender}/> : null}</td>
                    </tr>
                    <tr>
                        <th scope="row"><T>cdp.cdpDenom</T></th>
                        <td>{this.props.cdp_denom? this.props.cdp_denom : null}</td>
                    </tr>
                    <tr>
                        <th scope="row"><T>cdp.principal</T></th>
                        <td>{this.props.principal?
                        <span className={'coin'}>{new Coin((this.props.principal[0].amount), this.props.principal[0].denom).toString(4)}</span>:null}                        
                        </td>
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

DrawDebt.propTypes = {
    sender: PropTypes.string.isRequired,
    cdp_denom: PropTypes.string.isRequired,
    principal: PropTypes.array.isRequired
}
