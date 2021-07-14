import { Meteor } from 'meteor/meteor';
import { Recipes } from '../recipes.js';
import { check } from 'meteor/check'

Meteor.publish('recipes.list', function() {
    return Recipes.find({}, { sort: { ID: -1 } });
});

Meteor.publish('recipes.one', function(id) {
    //check(id, Number);
    return Recipes.find({ ID: id });
})