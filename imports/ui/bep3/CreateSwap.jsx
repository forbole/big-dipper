import React, { Component } from 'react';
import { Table, UncontrolledCollapse, Button, CardBody, Card} from 'reactstrap';
import i18n from 'meteor/universe:i18n';
import Coin from '/both/utils/coins.js';
import PropTypes from 'prop-types';
import Account from '../components/Account.jsx';
import moment from 'moment';
import numbro from 'numbro';
import { Link } from 'react-router-dom';


const T = i18n.createComponent(); 



export default class CreateSwap extends Component {
    constructor(props) {
        super(props)
        this.state = {
            swap: null
        }
    }


    componentDidMount() {
        Meteor.call('bep3.createSwap', (error, result) => {
            if (!error){
                console.info(result);
                this.setState({ swap: result})
            }
        })
    }



    render(){
        console.log(this.props)
        if (this.props.receipientOtherChain){
        return <div><Button className="ledger-buttons-group my-2" color="primary" id="toggler" size="sm"><T>transactions.info</T>  </Button>
            <UncontrolledCollapse toggler="#toggler">
            <Table responsive>
                <tbody>
                    <tr>
                        <th scope="row"><T>bep3.swap.from</T></th>
                        <td>{<Account address={this.props.from}/>}</td>
                    </tr>
                    <tr>
                        <th scope="row"><T>bep3.swap.to</T></th>
                        <td>{<Account address={this.props.to}/>}</td>
                    </tr>
                    <tr>
                        <th scope="row"><T>bep3.swap.recipient</T></th>
                     <td><a target="_blank" href={"https://explorer.binance.org/address/" + this.props.receipientOtherChain}>{this.props.receipientOtherChain}</a></td>
                    </tr>
                    <tr>
                        <th scope="row"><T>bep3.swap.sender</T></th>
                        <td><a target="_blank" href={"https://explorer.binance.org/address/" + this.props.senderOtherChain}>{this.props.senderOtherChain}</a></td>
                    </tr>
                    <tr>
                        <th scope="row"><T>bep3.swap.randomNumber</T></th>
                        <td>{this.props.randomHash}</td>
                    </tr>
                    <tr>
                        <th scope="row"><T>bep3.swap.timestamp</T></th>
                        <td>{moment.unix(this.props.timestamp).utc().fromNow()}</td>
                    </tr>
                    <tr>
                        <th scope="row"><T>bep3.swap.amount</T></th>
                        <td>{this.props.amount? <span className={'coin'}>{new Coin((this.props.amount[0].amount), this.props.amount[0].denom).toString(4)}</span>:null}</td>
                    </tr>
                    <tr>
                        <th scope="row"><T>bep3.swap.expectedIncome</T></th>
                        <td>{this.props.expectedIncome}</td>
                    </tr>
                    <tr>
                        <th scope="row"><T>bep3.swap.heightSpan</T></th>
                        <td>{this.props.heightSpan}</td>
                    </tr>
                    <tr>
                        <th scope="row"><T>bep3.swap.crossChain</T></th>
                        <td>{this.props.crossChain ? <i className="material-icons text-success">check_circle</i> : <i className="material-icons text-danger" >cancel</i>}</td>
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

CreateSwap.propTypes = {
    receipientOtherChain: PropTypes.string.isRequired,
    senderOtherChain: PropTypes.string.isRequired,
    randomHash: PropTypes.string.isRequired,
    timestamp: PropTypes.string,
    amount: PropTypes.array.isRequired, 
    expectedIncome: PropTypes.string,
    heightSpan: PropTypes.string,
    crossChain: PropTypes.string,
}
