// import { Meteor } from 'meteor/meteor';
// import React, { Component } from 'react';
// import { withTracker } from 'meteor/react-meteor-data';
// import { Blockscon } from '/imports/api/blocks/connections.js';

// import List from './List.jsx';


// export default ListContainer = withTracker((props) => {
//     // const heightHandle = Meteor.subscribe('blocks.dataall');
//     const heightHandle = Meteor.subscribe('blocks.height');
//     const hashHandle = Meteor.subscribe('blocks.hash');
//     // const txNum = Meteor.subscribe('block.txNum');
//     // const time = Meteor.subscribe('block.time');
//     const loading = !heightHandle.ready() || !hashHandle.ready();
//     console.log(loading)
//     const blocks = Blockscon.find({}).fetch();
//     // const blocks = Blockscon.find({}, {sort: {height:-1}, limit: 10}).fetch();
//     const blocksExist = !loading && blocks;
//     // console.log(props.state.limit);
//     return {
//         loading,
//         blocksExist,
//         // blocks: blocksExist ? blocks : {}
//         blocks: Blockscon.find({}, {sort: {height:-1}, limit: 10}).fetch(),
//     };
// })(List);