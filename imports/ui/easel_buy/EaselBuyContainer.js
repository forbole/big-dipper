import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Chain } from '/imports/api/chain/chain.js';
import { Recipes } from '/imports/api/recipes/recipes.js';
import EaselBuy from './EaselBuy.jsx';
import { string } from 'prop-types';

export default HomeContainer = withTracker((props) => {
    let recipesHandle;
    let validatorsHandle;
    let loading = true;
    var name = '';
    var description = '';
    var img = '';
    var url = props.url;
    var price = '0 Pylon';
    recipe_id = props.recipe_id

    if (Meteor.isClient) {
        recipesHandle = Meteor.subscribe('recipes.list', recipe_id);
        loading = !recipesHandle.ready();
    }

    let status;

    if (Meteor.isServer || !loading) {
        selectedRecipe = Recipes.findOne({ ID: recipe_id });
        if (selectedRecipe != null) {
            name = selectedRecipe.Name
            description = selectedRecipe.Description;
            // if (description.length > 15) {
            //     description = description.substring(0, 12) + '...';
            // }
            const coinInputs = selectedRecipe.CoinInputs;
            if (coinInputs.length > 0) {
                price = coinInputs[0].Count + ' ' + coinInputs[0].Coin
            }
            const entries = selectedRecipe.Entries;
            if (entries != null) {
                const itemoutputs = entries.ItemOutputs;
                if (itemoutputs.length > 0) {
                    let strings = itemoutputs[0].Strings
                    for (i = 0; i < string.length; i++) {
                        try {
                            var values = strings[i].Value;
                            if (values.indexOf('http') >= 0 && (values.indexOf('.png') > 0 || values.indexOf('.jpg') > 0)) {
                                img = values;
                                break;
                            }
                        } catch (e) {
                            console.log('strings[i].Value', e)
                            break;
                        }

                    }
                }
                price = coinInputs[0].Count + ' ' + coinInputs[0].Coin
            }
        }


    }

    return {
        name,
        description,
        price,
        img,
        url,
    };
})(EaselBuy);