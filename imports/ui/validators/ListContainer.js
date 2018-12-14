import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Validators } from '/imports/api/validators/validators.js';
import { Chain } from '/imports/api/chain/chain.js';
import List from './List.jsx';

export default ValidatorListContainer = withTracker((props) => {
    const validatorsHandle = Meteor.subscribe('validators.all');
    const chainHandle = Meteor.subscribe('chain.status');
    const loading = !validatorsHandle.ready() && !chainHandle.ready();
    let validatorsCond = {};
    if (props.jailed != undefined){
        validatorsCond = {
            jailed:props.jailed
        }
    }
    let options = {};
    console.log(props);
    switch(props.priority){
        case 0:
            options = {
                sort:{
                    "description.moniker": props.monikerDir,
                    uptime: props.uptimeDir,
                    voting_power: props.votingPowerDir,
                    lastSeen: props.lastSeenDir
                }
            }
            break;
        case 1:
            options = {
                sort:{
                    voting_power: props.votingPowerDir,
                    "description.moniker": props.monikerDir,
                    uptime: props.uptimeDir,
                    lastSeen: props.lastSeenDir
                }
            }
            break;
        case 2:
            options = {
                sort:{
                    uptime: props.uptimeDir,
                    "description.moniker": props.monikerDir,
                    voting_power: props.votingPowerDir,
                    lastSeen: props.lastSeenDir
                }
            }
            break;
        case 3:
            options = {
                sort:{
                    lastSeen: props.lastSeenDir,
                    voting_power: props.votingPowerDir,
                    "description.moniker": props.monikerDir,
                    uptime: props.uptimeDir
                }
            }
            break;
    }
    const validators = Validators.find(validatorsCond,options).fetch();
    const chainStatus = Chain.findOne({chainId:Meteor.settings.public.chainId});
    const validatorsExist = !loading && !!validators && !!chainStatus;
    // console.log(props.state.limit);
    return {
        loading,
        validatorsExist,
        validators: validatorsExist ? validators : {},
        chainStatus: validatorsExist ? chainStatus : {}
    };
})(List);
