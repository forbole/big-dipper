import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { ChainStates } from '/imports/api/chain/chain.js';
import Chain from './ChainStates.jsx';
import { CoinStats } from '../../api/coin-stats/coin-stats.js';

export default ChainStatesContainer = withTracker((props) => {
    let chainStatesHandle;
    let loading = true;
    let chainStates;
    let coinStats;

    if (Meteor.isClient){
        chainStatesHandle = Meteor.subscribe('chainStates.latest');
        loading = !chainStatesHandle.ready();
    }

    if (Meteor.isServer || !loading){
        chainStates = ChainStates.findOne({}, {sort:{height:-1}, limit:1});
        coinStats = CoinStats.findOne({}, {sort:{last_updated_at:-1}, limit:1});
    }
    
    const chainStatesExist = !loading && !!chainStates;
    const coinStatsExist = !loading && !!coinStats;
    return {
        loading,
        chainStatesExist,
        chainStates: chainStatesExist ? chainStates : {},
        coinStats: coinStatsExist ? coinStats : {}
    };
})(Chain);