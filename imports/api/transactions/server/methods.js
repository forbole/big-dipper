import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import { Transactions } from '../../transactions/transactions.js';

Meteor.methods({
    'Transactions.index': function(hash){
        this.unblock();
        hash = hash.toUpperCase();
        let url = LCD+ '/txs/'+hash;
        let response = HTTP.get(url);
        let tx = JSON.parse(response.content);

        console.log(hash);

        tx.height = parseInt(tx.height);

        // if (tx.tags && tx.tags.length > 0){
        //     tx.tags.map((tag, i) => {
        //         let key = Buffer.from(tag.key, 'base64').toString();
        //         let value = "";
        //         if (tag.value){
        //             value = Buffer.from(tag.value, 'base64').toString();
        //         }
        //         tag.key = key;
        //         tag.value = value;
        //     });    
        // }

        let txId = Transactions.insert(tx);
        if (txId){
            return txId;
        }
        else return false;
    },
    'Transactions.findDelegation': function(address, height){
        console.log(address);
        console.log(height);
        return Transactions.find({
            $or: [{$and: [
                {"tags.key": "action"}, 
                {"tags.value": "delegate"}, 
                {"tags.key": "destination-validator"}, 
                {"tags.value": address}
            ]}, {$and:[
                {"tags.key": "action"}, 
                {"tags.value": "unjail"}, 
                {"tags.key": "validator"}, 
                {"tags.value": address}
            ]}, {$and:[
                {"tags.key": "action"}, 
                {"tags.value": "create_validator"}, 
                {"tags.key": "destination-validator"}, 
                {"tags.value": address}
            ]}, {$and:[
                {"tags.key": "action"}, 
                {"tags.value": "begin_unbonding"}, 
                {"tags.key": "source-validator"}, 
                {"tags.value": address}
            ]}, {$and:[
                {"tags.key": "action"}, 
                {"tags.value": "begin_redelegate"}, 
                {"tags.key": "destination-validator"}, 
                {"tags.value": address}
            ]}], 
            "code": {$exists: false}, 
            height:{$lt:height}},
            {sort:{height:-1},
            limit: 1}
        ).fetch();
    }
});