import { Meteor } from 'meteor/meteor';
import { Chain } from '../chain.js';

Meteor.publish('chain.status', function () {
    return Chain.find({chainId:Meteor.settings.public.chainId});
});
