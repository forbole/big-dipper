import { Meteor } from 'meteor/meteor';
import { Nfts } from '../nfts.js';
import { check } from 'meteor/check'

Meteor.publish('nfts.list', function() {
    return Nfts.find({}, { sort: { ID: -1 } });
});

Meteor.publish('nfts.one', function(id) {
    //check(id, Number);
    return Nfts.find({ ID: id });
})