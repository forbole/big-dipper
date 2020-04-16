import React, { Component } from 'react';
import { Table, Spinner } from 'reactstrap';
import i18n from 'meteor/universe:i18n';
import Coin from '/both/utils/coins.js';
import PropTypes from 'prop-types';
import SentryBoundary from '../components/SentryBoundary.jsx';

const T = i18n.createComponent();

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
            return <Table responsive>
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
                        <td>{this.state.swap.expire_height}</td>
                    </tr>
                    <tr>
                        <th scope="row"><T>bep3.swap.timestamp</T></th>
                        <td>{this.state.swap.timestamp}</td>
                    </tr>

                    <tr>
                        <th scope="row"><T>bep3.swap.sender</T></th>
                        <td>{this.state.swap.sender}</td>
                    </tr>
                    <tr>
                        <th scope="row"><T>bep3.swap.recipient</T></th>
                        <td>{this.state.swap.recipient}</td>
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
                        <td>{this.state.swap.closed_block}</td>
                    </tr>
                    <tr>
                        <th scope="row"><T>bep3.swap.crossChain</T></th>
                        <td>{this.state.swap.cross_chain}</td>
                    </tr>
                    <tr>
                        <th scope="row"><T>bep3.swap.direction</T></th>
                        <td>{this.state.swap.direction}</td>
                    </tr>
                    <tr>
                        <th scope="row"><T>bep3.swap.amount</T></th>
                        <td>{this.state.swap.direction}</td>
                    </tr>
                    <tr>

                    </tr>
                </tbody>
            </Table>
        }
        else{
            return <div />
        }
    }
}

ClaimSwap.propTypes = {
    swapID: PropTypes.string.isRequired,
}
