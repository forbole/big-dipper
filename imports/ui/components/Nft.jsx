/* eslint-disable camelcase */

import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import { Link } from 'react-router-dom';
import { Validators } from '/imports/api/validators/validators.js';


export default class Nft extends Component{
    constructor(props){
        super(props);

        this.state = {
            address: `/Nft/${this.props.address}`,
            moniker: this.props.address,
            validator: null,
            homepage: window?.location?.pathname === '/' ? true : false
        }
    }

    getFields() {
        return {address:1, description:1, operator_address:1, delegator_address:1, profile_url:1};
    }

    getNft = () => {
        let address = this.props.address;
        let validator = Validators.findOne(
            {$or: [{operator_address:address}, {delegator_address:address}, {address:address}]},
            {fields: this.getFields() });
        if (validator)
            this.setState({
                address: `/validator/${validator?.operator_address}`,
                moniker: validator?.description?.moniker ?? validator?.operator_address,
                validator: validator
            });
        else
            this.setState({
                address: `/validator/${address}`,
                moniker: address,
                validator: null
            });
    }

    updateNft = () => {
        let address = this.props.address;
        Meteor.call('Nfts.findUser', this.props.address, this.getFields(), (error, result) => {
            if (result){
                // console.log(result);
                this.setState({
                    address: `/validator/${result?.operator_address}`,
                    moniker: result?.description?.moniker ?? result?.operator_address,
                    validator: result
                });
            }
        })
    }


    componentDidMount(){
        if (this.props.sync)
            this.getNft();
        else
            this.updateNft();
    }

    componentDidUpdate(prevProps){
        if (this.props.address != prevProps.address){
            if (this.props.sync) {
                this.getNft();
            }
            else {
                this.setState({
                    address: `/Nft/${this.props.address}`,
                    moniker: this.props.address,
                    validator: null
                });
                this.updateNft();
            }
        }
    }

    userIcon(){
        let signedInAddress = localStorage.getItem(CURRENTUSERADDR);
        if (signedInAddress === this.props.address) {
            return <i className="material-icons account-icon">account_box</i>
        }
    }

    render(){
        return <span className={this.state.homepage == true ? "tx-list-homepage" : (this.props.copy)?"tx-list-homepage copy":"tx-list-homepage"} style={{wordBreak: 'break-all'}}>
            <Link style={{color:'#FF00E5'}} to={this.state.address}>{this.userIcon()}{this.state.moniker}</Link>
        </span>
    }
}
  