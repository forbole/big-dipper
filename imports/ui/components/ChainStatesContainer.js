import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { ChainStates } from '/imports/api/chain/chain.js';
import Chain from './ChainStates.jsx';
import { CoinStats } from '../../api/coin-stats/coin-stats.js';

export default ChainStatesContainer = withTracker((props) => {
    const chainStatesHandle = Meteor.subscribe('chainStates.latest');
    const loading = !chainStatesHandle.ready();
    const chainStates = ChainStates.findOne({});
    const coinStats = CoinStats.findOne({});
    const chainStatesExist = !loading && !!chainStates;
    const coinStatsExist = !loading && !!coinStats;
    return {
        loading,
        chainStatesExist,
        chainStates: chainStatesExist ? chainStates : {},
        coinStats: coinStatsExist ? coinStats : {}
    };
})(Chain);