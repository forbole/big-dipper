import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Chain } from '/imports/api/chain/chain.js';
import ChainStatus from './ChainStatus.jsx';

export default ChainStatusContainer = withTracker((curr) => {
    const statusHandle = Meteor.subscribe('chain.status');
    const loading = !statusHandle.ready();
    const status = Chain.findOne({chainId:Meteor.settings.public.chainId});
    const statusExist = !loading && !!status;
    // console.log(props.state.limit);
    return {
        loading,
        statusExist,
        status: statusExist ? status : {}
    };
})(ChainStatus);

