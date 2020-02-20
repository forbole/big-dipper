import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Blockscon } from '/imports/api/blocks/blocks.js';
import { Validators } from '/imports/api/validators/validators.js';

import SignersChart from './SignersChart.jsx'

export default SignersChartContainer = withTracker((props) => {
    let heightHandle;
    let validatorHandle;
    let loading = true;

    if (Meteor.isClient){
        heightHandle = Meteor.subscribe('blocks.height', props.limit);
        validatorHandle = Meteor.subscribe('validators.all');
        loading = !heightHandle.ready() && !validatorHandle.ready();
    }

    let blocks;
    let blocksExist;
    let validators;
    let validatorsExist;

    if (Meteor.isServer || !loading){
        blocks = Blockscon.find({}, {sort: {height:-1}}).fetch();
        validators =  Validators.find({
                status: 2,
                jailed: false
            },{
                sort:{
                    voting_power:-1,
                    uptime: -1,
                    limit: 96
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
        validators: validatorsExist ? validators: {}
    };
})(SignersChart);
