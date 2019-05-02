import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import { Link } from 'react-router-dom';

export default class Account extends Component{
    constructor(props){
        super(props);

        this.state = {
            address: <Link to={"/account/"+this.props.address}>{this.props.address}</Link>
        }
    }

    updateAccount = () => {
        Meteor.call('Transactions.findUser', this.props.address, (error, result) => {
            if (result){
                // console.log(result);
                this.setState({
                    address: <Link to={"/validator/"+result.address}>{result.description.moniker}</Link>
                })
            }
        })
    }

    componentDidMount(){
        this.updateAccount();
    }

    componentDidUpdate(prevProps){
        if (this.props != prevProps){
            this.updateAccount();
        }
    }

    render(){
        return <span className={(this.props.copy)?"address overflow-auto d-inline-block copy":"address overflow-auto d-inline"} >{this.state.address}</span>
    }
}