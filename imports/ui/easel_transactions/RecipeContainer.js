import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Recipes } from '/imports/api/recipes/recipes.js'; 
import Recipe from './Recipe.jsx';

export default RecipeContainer = withTracker((props) => {
    let recipeId = 0; 
    if (props.match.params.id){
        recipeId = parseInt(props.match.params.id);
    }

    let chainHandle, recipeHandle, recipeListHandle, recipe, recipeCount, recipeExist;
    let loading = true;

    if (Meteor.isClient){ 
        recipeListHandle = Meteor.subscribe('recipes.list', recipeId);
        recipeHandle = Meteor.subscribe('recipes.one', recipeId);
        loading = !recipeHandle.ready() || !recipeListHandle.ready();
    }

    if (Meteor.isServer || !loading){
        recipe = Recipes.findOne({ID:recipeId});
        recipeCount = Recipes.find({}).count(); 

        if (Meteor.isServer){
            // loading = false;
            recipeExist = !!recipe;
        }
        else{
            recipeExist = !loading && !!recipe;
        }
    }

    return {
        loading,
        recipeExist,
        recipe: recipeExist ? recipe : {}, 
        recipeCount: recipeExist? recipeCount: 0
    };
})(Recipe);
