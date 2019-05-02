import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Chain, ChainStates } from '/imports/api/chain/chain.js';
import ChainStatus from './ChainStatus.jsx';

export default ChainStatusContainer = withTracker((curr) => {
    const statusHandle = Meteor.subscribe('chain.status');
    const chainStatesHandle = Meteor.subscribe('chainStates.latest');
    const loading = !statusHandle.ready() && !chainStatesHandle.ready();
    const status = Chain.findOne({chainId:Meteor.settings.public.chainId});
    const states = ChainStates.findOne({});
    const statusExist = !loading && !!status && !!states;
    // console.log(props.state.limit);
    return {
        loading,
        statusExist,
        status: statusExist ? status : {},
        states: statusExist ? states : {}
    };
})(ChainStatus);

