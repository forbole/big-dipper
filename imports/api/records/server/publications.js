import { Meteor } from 'meteor/meteor';
import { ValidatorRecords } from '../records.js';

Meteor.publish('validator_records.all', function () {
    return ValidatorRecords.find();
});
