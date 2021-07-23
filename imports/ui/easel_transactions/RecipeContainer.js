import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';  
import { Recipes } from '/imports/api/recipes/recipes.js';

import Recipe from './Recipe.jsx';

export default RecipeContainer = withTracker((props) => {
     

    let chainHandle, recipe, recipeExist;
    let loading = true;

    if (Meteor.isClient) {
        recipesHandle = Meteor.subscribe('recipes.list', props.match.params.ID);
        loading = !recipesHandle.ready();
    }
 
    if (Meteor.isServer || !loading) {
        recipe =  Recipes.findOne({ ID: props.match.params.ID });
        if (Meteor.isServer) {
            loading = false;
            recipeExist = !!recipe;
        } else {
            recipeExist = !loading && !!recipe;
        }
    }

    return {
        loading,
        recipeExist,
        recipe: recipeExist ? recipe : null, 
    };
})(Recipe);