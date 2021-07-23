import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Cookbooks } from '/imports/api/cookbooks/cookbooks.js'; 
 
import Cookbook from './Cookbook.jsx';

export default CookbookContainer = withTracker((props) => {
    let cookbook_owner = "";

    if (props.match.params.cookbook_owner) {
        cookbook_owner = props.match.params.cookbook_owner;
    }

    let chainHandle, cookbookHandle, cookbookListHandle, cookbooks, cookbook, cookbookCount, cookbookExist;
    let loading = true;

    if (Meteor.isClient) {
        cookbookHandle = Meteor.subscribe('cookbooks.list');
        loading = !cookbookHandle.ready();
    }

    if (Meteor.isServer || !loading) {
        cookbook = Cookbooks.find({ Sender: cookbook_owner }, { sort: { ID: -1 } }).fetch();
        cookbookCount = Cookbooks.find({ Sender: cookbook_owner }).count();

        if (Meteor.isServer) {
            loading = false;
            cookbookExist = !!cookbook;
        } else {
            cookbookExist = !loading && !!cookbook;
        }
    }

    return {
        loading,
        cookbookExist,
        cookbooks: cookbookExist ? cookbook : null,
        cookbookCount: cookbookExist ? cookbookCount : 0
    };
})(Cookbook);