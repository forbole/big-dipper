import { Meteor } from 'meteor/meteor';
// import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { Blockscon } from '/imports/api/blocks/blocks.js';

import Blocks from './List.jsx';

export default BlocksContainer = withTracker((curr) => {
    const heightHandle = Meteor.subscribe('blocks.height', curr.limit);
    const loading = !heightHandle.ready();
    const blocks = Blockscon.find({}, {sort: {height:-1}, limit: curr.limit}).fetch();
    const blocksExist = !loading && !!blocks;
    return {
        loading,
        blocksExist,
        blocks: blocksExist ? blocks : {}
    };
})(Blocks);
