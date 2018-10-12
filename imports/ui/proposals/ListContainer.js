import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Proposals } from '/imports/api/proposals/proposals.js';
import List from './List.jsx';

export default ProposalListContainer = withTracker((props) => {
    const proposalsHandle = Meteor.subscribe('proposals.list');
    const loading = !proposalsHandle.ready();
    const proposals = Proposals.find({}).fetch();
    const proposalsExist = !loading && !!proposals;
    // console.log(props.state.limit);
    return {
        loading,
        proposalsExist,
        proposals: proposalsExist ? proposals : {}
    };
})(List);
