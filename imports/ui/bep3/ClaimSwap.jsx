import React, { Component } from 'react';
import { Table, Spinner, UncontrolledCollapse, Button, CardBody, Card} from 'reactstrap';
import i18n from 'meteor/universe:i18n';
import Coin from '/both/utils/coins.js';
import PropTypes from 'prop-types';
import SentryBoundary from '../components/SentryBoundary.jsx';
import { Badge } from 'reactstrap';
import Account from '../components/Account.jsx';
import moment from 'moment';
import numbro from 'numbro';
import { Link } from 'react-router-dom';


const T = i18n.createComponent(); 

const BlockLink = (props) => {
    let height = props.height;
    return <Link to={"/blocks/"+height}>{numbro(height).format("0,0")}</Link>
}

export default class ClaimSwap extends Component {
    constructor(props) {
        super(props)
        this.state = {
            swap: null
        }
    }

    componentDidMount() {
        Meteor.call('bep3.getSwap', this.props.swapID, (error, result) => {
            if (!error){
                console.info(result);
                this.setState({ swap: result})
            }
        })
    }

    

    render(){
        if (this.state.swap){
        return <div><Button className="ledger-buttons-group my-2" color="primary" id="toggler" size="sm"><T>transactions.info</T>  </Button>
            <UncontrolledCollapse toggler="#toggler">
            <Table responsive>
                <tbody>
                    <tr>
                        <th scope="row"><T>bep3.swap.swapID</T></th>
                        <td>{this.props.swapID}</td>
                    </tr>
                    <tr>
                        <th scope="row"><T>bep3.swap.randomNumber</T></th>
                        <td>{this.state.swap.random_number_hash}</td>
                    </tr>
                    <tr>
                        <th scope="row"><T>bep3.swap.status</T></th>
                        <td>{this.state.swap.status}</td>
                    </tr>
                    <tr>
                        <th scope="row"><T>bep3.swap.expiredHeight</T></th>
                        <td>{ <BlockLink height={this.state.swap.expire_height}/> }</td>
                    </tr>
                    <tr>
                        <th scope="row"><T>bep3.swap.timestamp</T></th>
                        <td>{moment.unix(this.state.swap.timestamp).utc().fromNow()}</td>
                    </tr>

                    <tr>
                        <th scope="row"><T>bep3.swap.sender</T></th>
                        <td><Account address={this.state.swap.sender}/></td>
                    </tr>
                    <tr>
                        <th scope="row"><T>bep3.swap.recipient</T></th>
                        <td> <Account address={this.state.swap.recipient}/></td>
                    </tr>
                    <tr>
                        <th scope="row"><T>bep3.swap.senderOtherChain</T></th>
                        <td>{this.state.swap.sender_other_chain}</td>
                    </tr>
                    <tr>
                        <th scope="row"><T>bep3.swap.recipientOtherChain</T></th>
                        <td>{this.state.swap.recipient_other_chain}</td>
                    </tr>
                    <tr>
                        <th scope="row"><T>bep3.swap.closedBlock</T></th>
                        <td><BlockLink height={this.state.swap.closed_block}/></td>
                    </tr>
                    <tr>
                        <th scope="row"><T>bep3.swap.crossChain</T></th>
                        <td>{this.state.swap.cross_chain ? <i className="material-icons text-success">check_circle</i> : <i className="material-icons text-danger" >cancel</i>}</td>
                    </tr>
                    <tr>
                        <th scope="row"><T>bep3.swap.direction</T></th>
                    <td>  
                    <Badge size="lg" color="success">{this.state.swap.direction === 'Incoming' ? 
                   <span> <i className="material-icons">arrow_back</i> <span className="swap-direction">{this.state.swap.direction}</span> </span>: <span><span className="swap-direction">{this.state.swap.direction}</span> <i className="material-icons">arrow_forward</i></span>} </Badge>
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

ClaimSwap.propTypes = {
    swapID: PropTypes.string.isRequired,
}
