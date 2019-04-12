import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Blockscon } from '/imports/api/blocks/blocks.js';
import Block from './Block.jsx';

export default BlockContainer = withTracker((props) => {
    const blockHandle = Meteor.subscribe('blocks.findOne', parseInt(props.match.params.blockId));
    const loading = !blockHandle.ready();
    const block = Blockscon.findOne({height: parseInt(props.match.params.blockId)});
    const blockExist = !loading && !!block;
    return {
        loading,
        blockExist,
        block: blockExist ? block : {},
    };
})(Block);