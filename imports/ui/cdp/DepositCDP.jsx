import React, { Component } from 'react';
import { Table, Spinner, UncontrolledCollapse, Button, CardBody, Card} from 'reactstrap';
import i18n from 'meteor/universe:i18n';
import Coin from '/both/utils/coins.js';
import PropTypes from 'prop-types';
import SentryBoundary from '../components/SentryBoundary.jsx';
import { Badge } from 'reactstrap';
import Account from '../components/Account.jsx';


const T = i18n.createComponent(); 

export default class DepositCDP extends Component {
    constructor(props) {
        super(props)
        this.state = {
            depositCDP: null
        }
    }



    render(){
        if (this.props){
            return <div><Button className="ledger-buttons-group my-2" color="primary" id="toggler" size="sm"><T>transactions.info</T>  </Button>
         <UncontrolledCollapse toggler="#toggler">
            <Table responsive>
                    <tbody>
                        <br></br>
                        <tr>
                            <th scope="row"><T>cdp.owner</T></th>
                            <td>{this.props.address ? <Account address={this.props.address}/> : null}</td>
                        </tr>
                        <tr>
                            <th scope="row"><T>cdp.collateral</T></th>
                            <td>{this.props.collateral?
                            <span className={'coin'}>{new Coin((this.props.collateral[0].amount), this.props.collateral[0].denom).toString(4)}</span>:null}                        
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

DepositCDP.propTypes = {
    address: PropTypes.string.isRequired,
    collateral: PropTypes.array.isRequired
}
