import { Meteor } from 'meteor/meteor';
import { ValidatorRecords, Analytics } from '../records.js';

Meteor.publish('validator_records.all', function () {
    return ValidatorRecords.find();
});

Meteor.publish('analytics.history', function(){
    return Analytics.find({},{sort:{height:-1},limit:50});
});