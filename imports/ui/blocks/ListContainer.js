import { Meteor } from 'meteor/meteor';
// import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { Blockscon } from '/imports/api/blocks/blocks.js';

import Blocks from './List.jsx';

export default BlocksContainer = withTracker((props) => {
    const heightHandle = Meteor.subscribe('blocks.height', props.limit);
    const loading = (!heightHandle.ready() && props.limit == Meteor.settings.public.initialPageSize);
    const blocks = Blockscon.find({}, {sort: {height:-1}}).fetch();
    const blocksExist = !loading && !!blocks;
    return {
        loading,
        blocksExist,
        blocks: blocksExist ? blocks : {}
    };
})(Blocks);
