import { Meteor } from 'meteor/meteor';
import { Validators } from '../validators.js';

Meteor.publish('validators.all', function (sort = "description.moniker", direction = -1) {
    return Validators.find({});
});
