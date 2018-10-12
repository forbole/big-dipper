import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Proposals } from '/imports/api/proposals/proposals.js';
import Proposal from './Proposal.jsx';

export default ProposalContainer = withTracker((props) => {
    // console.log(props);
    let proposalId = 0;
    if (props.match.params.id){
        proposalId = parseInt(props.match.params.id);
    }
    const proposalHandle = Meteor.subscribe('proposals.one', proposalId);
    const loading = !proposalHandle.ready();
    const proposal = Proposals.findOne({proposalId:proposalId});
    const proposalExist = !loading && !!proposal;
    // console.log(props.state.limit);
    return {
        loading,
        proposalExist,
        proposal: proposalExist ? proposal : {}
    };
})(Proposal);
