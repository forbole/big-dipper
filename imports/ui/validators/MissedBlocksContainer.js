import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Validators } from '/imports/api/validators/validators.js';
import { Status } from '/imports/api/status/status.js';
import { MissedBlocksStats } from '../../api/records/records.js';
import MissedBlocks from './MissedBlocks.jsx';

export default MissedBlocksContainer = withTracker((props) => {
    const statusHandle = Meteor.subscribe('status.status');
    const validatorsHandle = Meteor.subscribe('validator.details', props.match.params.address);
    let missedBlockHandle;
    if (props.type == 'voter'){
        missedBlockHandle = Meteor.subscribe('missedblocks.validator', props.match.params.address, 'voter');
    }    
    else{
        missedBlockHandle = Meteor.subscribe('missedblocks.validator', props.match.params.address, 'proposer');
    }
    const loading = !validatorsHandle.ready() && !statusHandle.ready() && !missedBlockHandle.ready();
    const validator = Validators.findOne({address:props.match.params.address});
    const status = Status.findOne({chainId:Meteor.settings.public.chainId});
    let missedBlocks;
    if (props.type == 'voter'){
        missedBlocks = MissedBlocksStats.find({voter:props.match.params.address}).fetch();
    }
    else {
        missedBlocks = MissedBlocksStats.find({proposer:props.match.params.address}).fetch();
    }
    const validatorExist = !loading && !!validator;
    const statusExist = !loading && !!status;
    const missedBlocksExist = !loading && !!missedBlocks;
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
