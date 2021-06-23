import { Meteor } from 'meteor/meteor';
import { Cookbooks } from '../cookbooks.js';
import { check } from 'meteor/check'

Meteor.publish('cookbooks.list', function() {
    return Cookbooks.find({}, { sort: { ID: -1 } });
});

Meteor.publish('cookbooks.one', function(cookbook_owner) {
    //check(id, Number);
    return Cookbooks.find({ Sender: cookbook_owner });
})