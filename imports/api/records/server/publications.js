import { Meteor } from 'meteor/meteor';
import { ValidatorRecords, Analytics } from '../records.js';

Meteor.publish('validator_records.all', function () {
    return ValidatorRecords.find();
});

// Meteor.publish('validator_records.uptime', function(limit){

//     return ValdiatorRectords.find({})
// });