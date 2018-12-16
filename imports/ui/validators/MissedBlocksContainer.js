import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Validators } from '/imports/api/validators/validators.js';
import { Chain } from '/imports/api/chain/chain.js';
import MissedBlocks from './MissedBlocks.jsx';

export default MissedBlocksContainer = withTracker((props) => {
    const chainHandle = Meteor.subscribe('chain.status');
    const validatorsHandle = Meteor.subscribe('validator.details', props.address);
    const loading = !validatorsHandle.ready() && !chainHandle.ready();
    const validator = Validators.findOne({address:props.address});
    const chainStatus = Chain.findOne({chainId:Meteor.settings.public.chainId});
    const validatorExist = !loading && !!validator && !!chainStatus;
    // console.log(props.state.limit);
    return {
        loading,
        validatorExist,
        validator: validatorExist ? validator : {},
        chainStatus: validatorExist ? chainStatus : {}
    };
})(MissedBlocks);
