import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Validators } from '/imports/api/validators/validators.js';
import { Status } from '/imports/api/status/status.js';
import { MissedBlocksStats } from '../../api/records/records.js';
import MissedBlocks from './MissedBlocks.jsx';

export default MissedBlocksContainer = withTracker((props) => {
    let statusHandle;
    let validatorsHandle;
    let missedBlockHandle;
    let loading = true;

    if (Meteor.isClient){
        statusHandle = Meteor.subscribe('status.status');
        validatorsHandle = Meteor.subscribe('validator.details', props.match.params.address);

        if (props.type == 'voter'){
            missedBlockHandle = Meteor.subscribe('missedblocks.validator', props.match.params.address, 'voter');
        }
        else{
            missedBlockHandle = Meteor.subscribe('missedblocks.validator', props.match.params.address, 'proposer');
        }

        loading = !validatorsHandle.ready() && !statusHandle.ready() && !missedBlockHandle.ready();
    }


    let validator;
    let status;
    let missedBlocks;
    let validatorExist;
    let statusExist;
    let missedBlocksExist;

    if (Meteor.isServer || !loading){
        validator = Validators.findOne({address:props.match.params.address});
        status = Status.findOne({chainId:Meteor.settings.public.chainId});
        if (props.type == 'voter'){
            missedBlocks = MissedBlocksStats.find({voter:props.match.params.address}, {sort:{count:-1}}).fetch();
        }
        else {
            missedBlocks = MissedBlocksStats.find({proposer:props.match.params.address}, {sort:{count:-1}}).fetch();
        }

        if (Meteor.isServer){
            loading = false;
            validatorExist = !!validator;
            statusExist = !!status;
            missedBlocksExist = !!missedBlocks;
        }
        else{
            validatorExist = !loading && !!validator;
            statusExist = !loading && !!status;
            missedBlocksExist = !loading && !!missedBlocks;
        }
    }

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
