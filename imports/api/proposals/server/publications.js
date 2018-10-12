import { Meteor } from 'meteor/meteor';
import { Proposals } from '../proposals.js';

Meteor.publish('proposals.list', function () {
    return Proposals.find({}, {fields:{_id: 1, proposalId:1, title:1,}, sort:{proposalId:-1}});
});

Meteor.publish('proposals.one', function (id){
    return Proposals.find({proposalId:id});
})