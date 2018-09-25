import { Mongo } from 'meteor/mongo';
// import { Meteor } from 'meteor/meteor';

export const Blockscon = new Mongo.Collection('blocks');

// Blocks.helpers({
//     block(){
//         return Meteor.blocks.find({});
//     }
// });

// Blockscon.helpers({
//     sorted(limit) {
//         return Blockscon.find({}, {sort: {height:-1}, limit: limit});
//     }
// });


// Meteor.setInterval(function() {
//     Meteor.call('blocksUpdate', (error, result) => {
//         console.log(result);
//     })
// }, 30000000);