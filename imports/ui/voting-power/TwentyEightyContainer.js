import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { VPDistributions } from '/imports/api/records/records.js';
import TwentyEighty from './TwentyEighty.jsx';

export default TwentyEightyContainer = withTracker((props) => {
    const chartHandle = Meteor.subscribe('vpDistribution.twentyEighty');
    const loading = !chartHandle.ready();
    const stats = VPDistributions.findOne({});
    const statsExist = !loading && !!stats;
    return {
        loading,
        statsExist,
        stats: statsExist ? stats : {}
    };
})(TwentyEighty);

