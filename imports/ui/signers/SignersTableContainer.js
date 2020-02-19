import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Blockscon } from '/imports/api/blocks/blocks.js';
import { Validators } from '/imports/api/validators/validators.js';

import SignersTable from './SignersTable.jsx';

export default SignersTableContainer = withTracker((props) => {
    let heightHandle;
    let validatorHandle;
    let loading = true;

    if (Meteor.isClient){
        heightHandle = Meteor.subscribe('blocks.height', props.limit);
        validatorHandle = Meteor.subscribe('validators.voting_power');
        loading = !heightHandle.ready() && !validatorHandle.ready();
    }

    let blocks;
    let blocksExist;
    let validatorsExist;
    let validators;

    if (Meteor.isServer || !loading){
        blocks = Blockscon.find({}, {sort: {height:-1}}).fetch();
        // validators = Validators.find({},{sort:{voting_power:-1, height:-1, limit: 90}}).fetch();
        validators =  Validators.find({
                status: 2,
                jailed:false
            },{
                sort:{
                    voting_power:-1
                }
            }
        ).fetch();

        if (Meteor.isServer){
            // loading = false;
            blocksExist = !!blocks;
            validatorsExist = !!validators;
        }
        else{
            blocksExist = !loading && !!blocks;
            validatorsExist = !loading && !!validators;
        }
    }

    return {
        loading,
        blocksExist,
        validatorsExist,
        blocks: blocksExist ? blocks : {},
        validators: validators
    };
})(SignersTable);
