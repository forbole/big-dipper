import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import { Link } from 'react-router-dom';

export default class Account extends Component{
    constructor(props){
        super(props);

        this.state = {
            address: this.props.address
        }
    }

    componentDidMount(){
        Meteor.call('Transactions.findUser', this.props.address, (error, result) => {
            if (result){
                // console.log(result);
                this.setState({
                    address: <Link to={"/validator/"+result.address}>{result.description.moniker}</Link>
                })
            }
        })
    }

    render(){
        return <div>{this.state.address}</div>
    }
}