import { Meteor } from 'meteor/meteor';
import { Validators } from '../validators.js';

Meteor.publish('validators.all', function () {
    return Validators.find();
});
