import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import { Cookbooks } from '../cookbooks.js';

Meteor.methods({
    'cookbooks.getCookbooks': function() {
        this.unblock();

        let url = API + '/custom/pylons/list_cookbook/';
        try {
            let response = HTTP.get(url);

            let cookbooks = JSON.parse(response.content).Cookbooks;
            let finishedCookbookIds = new Set(Cookbooks.find({}).fetch().map((p) => p.ID));

            let activeCookbooks = new Set(Cookbooks.find({}).fetch().map((p) => p.ID));
            let cookbookIds = [];
            if (cookbooks.length > 0) {

                const bulkCookbooks = Cookbooks.rawCollection().initializeUnorderedBulkOp();
                for (let i in cookbooks) {
                    let cookbook = cookbooks[i];

                    cookbookIds.push(cookbook.ID);
                    if (cookbook.NO != -1 && !finishedCookbookIds.has(cookbook.ID)) {
                        try {
                            let date = new Date();
                            cookbook.NO = date.getFullYear() * 1000 * 360 * 24 * 30 * 12 + date.getMonth() * 1000 * 360 * 24 * 30 + date.getDay() * 1000 * 360 * 24 + date.getHours() * 1000 * 360 + date.getMinutes() * 1000 * 60 + date.getSeconds() * 1000 + date.getMilliseconds();
                            cookbook.cookbookId = cookbook.NO;
                            if (activeCookbooks.has(cookbook.ID)) {
                                let validators = []
                                let page = 0;

                            }

                            bulkCookbooks.find({ ID: cookbook.ID }).upsert().updateOne({ $set: cookbook });

                        } catch (e) {
                            bulkCookbooks.find({ ID: cookbook.ID }).upsert().updateOne({ $set: cookbook });
                        }
                    }
                }

                bulkCookbooks.find({ ID: { $nin: cookbookIds } })
                    .update({});
                bulkCookbooks.execute();
            }
            return true
        } catch (e) {
            console.log(url);
            console.log(e);
        }
    },
    'cookbooks.getCookbookResults': function() {
        this.unblock();
        let cookbooks = Cookbooks.find({}).fetch();
        if (cookbooks && (cookbooks.length > 0)) {
            for (let i in cookbooks) {
                if (cookbooks[i].ID != -1) {
                    let url = "";
                    try {
                        let cookbook = { ID: cookbooks[i].ID };

                        //recipe.updatedAt = new Date();
                        Cookbooks.update({ ID: cookbooks[i].ID }, { $set: cookbook });
                    } catch (e) {
                        console.log(url);
                        console.log(e);
                    }
                }
            }
        }
        return true
    }
})