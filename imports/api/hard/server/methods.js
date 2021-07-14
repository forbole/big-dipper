import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import { HARDCollection } from '../hard'

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
                HARDCollection.upsert({}, { $set: { deposits: deposits } });
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
                HARDCollection.upsert({}, { $set: { borrows: borrows } });
                return borrows
            }
        } catch (e) {
            console.log(e)
        }
    },
    'hard.fetchList': function () {
        this.unblock();
        try{
            let HARDList = HARDCollection.find().fetch();
            return HARDList[0]
        }
        catch(e){
            console.log(e)
        }
       
    },
    'hard.findDepositor': function (address) {
        this.unblock();
        try{
            let HARDList = HARDCollection.find().fetch();
            let depositsList = HARDList[0].deposits;
            for (let d in depositsList) {
                if (depositsList[d].depositor === address) {
                    return depositsList[d]
                }
            }
        }
        catch(e){
            console.log(e)
        }
        
    },
    'hard.findBorrower': function (address) {
        this.unblock();
        try{
            let HARDList = HARDCollection.find().fetch();
            let borrowsList = HARDList[0].borrows;
            for (let d in borrowsList) {
                if (borrowsList[d].borrower === address) {
                    return borrowsList[d]
                }
            }
        }
        catch(e){
            console.log(e)
        }
        
    }
})