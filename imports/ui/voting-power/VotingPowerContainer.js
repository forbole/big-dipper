import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Validators } from '/imports/api/validators/validators.js';
import VotingPower from './VotingPower.jsx';

export default VotingPowerContainer = withTracker((props) => {
    const chartHandle = Meteor.subscribe('validators.voting_power');
    const loading = !chartHandle.ready();
    const stats = Validators.find({},{sort:{voting_power:-1}}).fetch();
    const statsExist = !loading && !!stats;
    return {
        loading,
        statsExist,
        stats: statsExist ? stats : {}
    };
})(VotingPower);

