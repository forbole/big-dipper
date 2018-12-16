import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Validators } from '/imports/api/validators/validators.js';
import { Status } from '/imports/api/status/status.js';
import { MissedBlocksStats } from '../../api/records/records.js';
import MissedBlocks from './MissedBlocks.jsx';

export default MissedBlocksContainer = withTracker((props) => {
    const statusHandle = Meteor.subscribe('status.status');
    const validatorsHandle = Meteor.subscribe('validator.details', props.match.params.address);
    const missedBlockHandle = Meteor.subscribe('missedblocks.validator', props.match.params.address);
    const loading = !validatorsHandle.ready() && !statusHandle.ready() && !missedBlockHandle.ready();
    const validator = Validators.findOne({address:props.match.params.address});
    const status = Status.findOne({chainId:Meteor.settings.public.chainId});
    const missedBlocks = MissedBlocksStats.find({voter:props.match.params.address}).fetch();
    const validatorExist = !loading && !!validator;
    const statusExist = !loading && !!status;
    const missedBlocksExist = !loading && !!missedBlocks;
    // console.log(props.state.limit);
    return {
        loading,
        validatorExist,
        statusExist,
        missedBlocksExist,
        validator: validatorExist ? validator : {},
        status: statusExist ? status : {},
        missedBlocks: missedBlocksExist ? missedBlocks : {}
    };
})(MissedBlocks);
