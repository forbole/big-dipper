import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Validators } from '/imports/api/validators/validators.js';
import { Chain } from '/imports/api/chain/chain.js';
import List from './List.jsx';

export default ValidatorListContainer = withTracker((props) => {
    let validatorsHandle;
    let chainHandle;
    let loading = true;

    if (Meteor.isClient){
        validatorsHandle = Meteor.subscribe('validators.all');
        chainHandle = Meteor.subscribe('chain.status');
        loading = !validatorsHandle.ready() && !chainHandle.ready();    
    }
    let validatorsCond = {};
    // console.log(props);
    if (props.inactive){
        validatorsCond = {
            status: { $ne:'BOND_STATUS_BONDED' }
        }
        // validatorsCond = {
        //     $or: [
        //         { status: 'BOND_STATUS_UNBONDED' },
        //         { status: 'BOND_STATUS_BONDED' }
        //         // { jailed: true }
        //     ]
        // }
    }
    else{
        validatorsCond = {
            status: 'BOND_STATUS_BONDED'
        }
    }

    let options = {};

    // console.log(validatorsCond);
    switch(props.priority){
    case 0:
        options = {
            sort:{
                "description.moniker": props.monikerDir,
                "commission.commission_rates.rate": props.commissionDir,
                uptime: props.uptimeDir,
                tokens: props.votingPowerDir,
                self_delegation: props.selfDelDir
            }
        }
        break;
    case 1:
        options = {
            sort:{
                tokens: props.votingPowerDir,
                "description.moniker": props.monikerDir,
                uptime: props.uptimeDir,
                "commission.commission_rates.rate": props.commissionDir,
                self_delegation: props.selfDelDir
            }
        }
        break;
    case 2:
        options = {
            sort:{
                uptime: props.uptimeDir,
                "description.moniker": props.monikerDir,
                tokens: props.votingPowerDir,
                "commission.commission_rates.rate": props.commissionDir,
                self_delegation: props.selfDelDir,
            }
        }
        break;
    case 3:
        options = {
            sort:{
                "commission.commission_rates.rate": props.commissionDir,
                "description.moniker": props.monikerDir,
                tokens: props.votingPowerDir,
                uptime: props.uptimeDir,
                self_delegation: props.selfDelDir
            }
        }
        break;
    case 4:
        options = {
            sort:{
                self_delegation: props.selfDelDir,
                "description.moniker": props.monikerDir,
                "commission.commission_rates.rate": props.commissionDir,
                tokens: props.votingPowerDir,
                uptime: props.uptimeDir,
            }
        }
        break;
    case 5:
        options = {
            sort:{
                status: props.statusDir,
                jailed: props.jailedDir,
                "description.moniker": props.monikerDir,
            }
        }
        break;
    case 6:
        options = {
            sort:{
                jailed: props.jailedDir,
                status: props.statusDir,
                "description.moniker": props.monikerDir,
            }
        }
        break;
    }

    let validators;
    let chainStatus;
    let validatorsExist;

    if (Meteor.isServer || !loading){
        validators = Validators.find(validatorsCond,options).fetch();
        chainStatus = Chain.findOne({chainId:Meteor.settings.public.chainId});

        if (Meteor.isServer){
            // loading = false;
            validatorsExist = !!validators && !!chainStatus;
        }
        else{
            validatorsExist = !loading && !!validators && !!chainStatus;
        }
        
    }
    // console.log(props.state.limit);
    return {
        loading,
        validatorsExist,
        validators: validatorsExist ? validators : {},
        chainStatus: validatorsExist ? chainStatus : {}
    };
})(List);
