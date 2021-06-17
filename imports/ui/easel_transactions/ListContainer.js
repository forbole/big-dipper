import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Recipes } from '/imports/api/recipes/recipes.js';
import List from './List.jsx';  

export default RecipesListContainer = withTracker((props) => {
    let recipesHandle, recipes, recipesExist;
    let loading = true;

    if (Meteor.isClient){
        recipesHandle = Meteor.subscribe('recipes.list');
        loading = !recipesHandle.ready();
    }

    if (Meteor.isServer || !loading){
        recipes = Recipes.find({}, {sort:{ID:-1}}).fetch();

        if (Meteor.isServer){
            loading = false;
            recipesExist = !!recipes;
        }
        else{
            recipesExist = !loading && !!recipes;
        }
    }

    return {
        loading,
        recipesExist,
        recipes: recipesExist ? recipes : {},
        history: props.history
    };
})(List);
