import { Meteor } from 'meteor/meteor';
import { Enterprise } from '../enterprise.js';
import { check } from 'meteor/check'

Meteor.publish('enterprise.list_pos', function () {
    return Enterprise.find({}, {sort:{poId:-1}});
});

Meteor.publish('enterprise.one_po', function (id){
    check(id, Number);
    return Enterprise.find({poId:id});
})