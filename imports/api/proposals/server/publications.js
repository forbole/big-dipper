import { Meteor } from 'meteor/meteor';
import { Proposals } from '../proposals.js';
import { check } from 'meteor/check'

Meteor.publish('proposals.list', function () {
    return Proposals.find({}, {fields:{_id: 1, proposalId:1, value:1, }, sort:{proposalId:-1}});
});

Meteor.publish('proposals.one', function (id){
    check(id, Number);
    return Proposals.find({proposalId:id});
})