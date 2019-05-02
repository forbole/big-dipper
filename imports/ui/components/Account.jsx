import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import { Link } from 'react-router-dom';

export default class Account extends Component{
    constructor(props){
        super(props);

        this.state = {
            address: this.props.address,
            moniker: this.props.address
        }
    }

    updateAccount = () => {
        let address = this.props.address;
        Meteor.call('Transactions.findUser', this.props.address, (error, result) => {
            if (result){
                // console.log(result);
                this.setState({
                    address: result.address,
                    moniker: result.description.moniker
                })
            }

        })
    }

    componentDidMount(){
        this.updateAccount();
    }

    componentDidUpdate(prevProps){
        if (this.props.address != prevProps.address){
            this.setState({
                address: this.props.address,
                moniker: this.props.address
            })
            this.updateAccount();
        }
    }

    render(){
        return <span className={(this.props.copy)?"address overflow-auto d-inline-block copy":"address overflow-auto d-inline"} >
            <Link to={"/validator/"+this.state.address}>{this.state.moniker}</Link>
        </span>
    }
}