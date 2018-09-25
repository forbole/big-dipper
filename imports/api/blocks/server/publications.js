import { Meteor } from 'meteor/meteor';
import { Blockscon } from '../connections.js';

Meteor.publish('blocks.height', function () {
    return Blockscon.find();
});

Meteor.publish('blocks.hash', function () {
    return Blockscon.find();
})

Meteor.publish('blocks.dataall', function () {
    return Blockscon.find();
})

Meteor.publish('blocks.datalimit', function (limit) {
    return Blockscon.find({},{sorted: {height: -1}, limit: limit});
})