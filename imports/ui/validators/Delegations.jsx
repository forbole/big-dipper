import React, { Component } from 'react';

export default class ValidatorDelegations extends Component{
    constructor(props){
        super(props);
    }

    componentDidMount(){
        Meteor.call('Validators.getAllDelegations', this.props.address, (error, result) => {
            if (error){
                console.log(error);
            }

            if (result){
                console.log(result);
            }
        })
    }

    render(){
        return <div>Delegations</div>
    }
}