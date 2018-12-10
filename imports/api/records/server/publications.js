import { Meteor } from 'meteor/meteor';
import { ValidatorRecords, Analytics } from '../records.js';

Meteor.publish('validator_records.all', function () {
    return ValidatorRecords.find();
});

Meteor.publish('validator_records.uptime', function(address, num){
    return ValidatorRecords.find({address:address},{limit:num, sort:{height:-1}});
});

Meteor.publish('analytics.history', function(){
    return Analytics.find({},{sort:{height:-1},limit:50});
});