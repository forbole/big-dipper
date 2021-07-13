import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import { Hard } from '../hard'

Meteor.methods({
    'hard.parameters': function () {
        this.unblock();
        let url = LCD + '/hard/parameters';
        try {
            let result = HTTP.get(url);
            if (result.statusCode == 200) {
                let parameters = JSON.parse(result.content).result;
                return parameters
            }
        } catch (e) {
            console.log(e)
        }
    },

    'hard.deposits': function () {
        this.unblock();
        let url = LCD + '/hard/deposits';
        try {
            let result = HTTP.get(url);
            if (result.statusCode == 200) {
                let deposits = JSON.parse(result.content).result;
                Hard.upsert({}, { $set: { deposits: deposits } });
                return deposits
            }
        } catch (e) {
            console.log(e)
        }
    },
    'hard.borrows': function () {
        this.unblock();
        let url = LCD + '/hard/borrows';
        try {
            let result = HTTP.get(url);
            if (result.statusCode == 200) {
                let borrows = JSON.parse(result.content).result;
                Hard.upsert({}, { $set: { borrows: borrows } });
                return borrows
            }
        } catch (e) {
            console.log(e)
        }
    }
})