import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Chain, ChainStates } from '/imports/api/chain/chain.js';
import ChainStatus from './ChainStatus.jsx';

export default ChainStatusContainer = withTracker((curr) => {
    let statusHandle;
    let chainStatesHandle;
    let loading = true;

    if (Meteor.isClient) {
        statusHandle = Meteor.subscribe('chain.status');
        chainStatesHandle = Meteor.subscribe('chainStates.latest');
        loading = !statusHandle.ready() && !chainStatesHandle.ready();
    }

    let status;
    let states;
    if (Meteor.isServer || (!loading)) {
        status = Chain.find({chainId:Meteor.settings.public.chainId});
        states = ChainStates.find({}, {sort:{height:-1}, limit: 1});
    }
    const statusExist = !loading && !!status && !!states;
    return {
        loading,
        statusExist,
        status: statusExist ? status.fetch()[0] : {},
        states: statusExist ? states.fetch()[0] : {}
    };
})(ChainStatus);

