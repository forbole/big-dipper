import { Meteor } from 'meteor/meteor';
import { Chain } from '../chain.js';

Meteor.publish('chain.latest', function () {
    return Chain.find().sort({created:1}).limit(1);;
});
