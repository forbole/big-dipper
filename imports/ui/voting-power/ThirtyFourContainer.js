import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { VPDistributions } from '/imports/api/records/records.js';
import ThirtyFour from './ThirtyFour.jsx';

export default ThirtyFourContainer = withTracker((props) => {
    const chartHandle = Meteor.subscribe('vpDistribution.latest');
    const loading = !chartHandle.ready();
    const stats = VPDistributions.findOne({});
    const statsExist = !loading && !!stats;
    return {
        loading,
        statsExist,
        stats: statsExist ? stats : {}
    };
})(ThirtyFour);

