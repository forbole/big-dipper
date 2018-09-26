import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Chain } from '/imports/api/chain/chain.js';
import Consensus from './Consensus.jsx';

export default ConsensusContainer = withTracker((curr) => {
    const consensusHandle = Meteor.subscribe('chain.status');
    const loading = !consensusHandle.ready();
    const consensus = Chain.findOne({chainId:Meteor.settings.public.chainId});
    const consensusExist = !loading && !!consensus;
    // console.log(props.state.limit);
    return {
        loading,
        consensusExist,
        consensus: consensusExist ? consensus : {}
    };
})(Consensus);

