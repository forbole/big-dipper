import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Validators } from '/imports/api/validators/validators.js';
import { Chain } from '/imports/api/chain/chain.js';
import { MissedBlocksStats } from '../../api/records/records.js';
import MissedBlocks from './MissedBlocks.jsx';

export default MissedBlocksContainer = withTracker((props) => {
    const chainHandle = Meteor.subscribe('chain.status');
    const validatorsHandle = Meteor.subscribe('validator.details', props.match.params.address);
    const missedBlockHandle = Meteor.subscribe('missedblocks.validator', props.match.params.address);
    const loading = !validatorsHandle.ready() && !chainHandle.ready() && !missedBlockHandle.ready();
    const validator = Validators.findOne({address:props.match.params.address});
    const chainStatus = Chain.findOne({chainId:Meteor.settings.public.chainId});
    const missedBlocks = MissedBlocksStats.find({voter:props.match.params.address}).fetch();
    const validatorExist = !loading && !!validator && !!chainStatus;
    const missedBlocksExist = !loading && !!missedBlocks;
    // console.log(props.state.limit);
    return {
        loading,
        validatorExist,
        validator: validatorExist ? validator : {},
        chainStatus: validatorExist ? chainStatus : {},
        missedBlocks: missedBlocksExist ? missedBlocks : {}
    };
})(MissedBlocks);
