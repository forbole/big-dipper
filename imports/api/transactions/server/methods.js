import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import { Transactions } from '../../transactions/transactions.js';
import { Validators } from '../../validators/validators.js';
import { VotingPowerHistory } from '../../voting-power/history.js';

Meteor.methods({
    'Transactions.index': function(hash, blockTime){
        this.unblock();
        hash = hash.toUpperCase();
        let url = LCD+ '/txs/'+hash;
        let response = HTTP.get(url);
        let tx = JSON.parse(response.content);

        console.log(hash);

        tx.height = parseInt(tx.height);

        let txId = Transactions.insert(tx);
        if (txId){
            return txId;
        }
        else return false;
    },
    'Transactions.findDelegation': function(address, height){
        return Transactions.find({
            $or: [{$and: [
                {"result.Tags.key": "action"}, 
                {"result.Tags.value": "delegate"}, 
                {"result.Tags.key": "destination-validator"}, 
                {"result.Tags.value": address}
            ]}, {$and:[
                {"result.Tags.key": "action"}, 
                {"result.Tags.value": "unjail"}, 
                {"result.Tags.key": "validator"}, 
                {"result.Tags.value": address}
            ]}, {$and:[
                {"result.Tags.key": "action"}, 
                {"result.Tags.value": "create_validator"}, 
                {"result.Tags.key": "destination-validator"}, 
                {"result.Tags.value": address}
            ]}, {$and:[
                {"result.Tags.key": "action"}, 
                {"result.Tags.value": "begin_unbonding"}, 
                {"result.Tags.key": "source-validator"}, 
                {"result.Tags.value": address}
            ]}, {$and:[
                {"result.Tags.key": "action"}, 
                {"result.Tags.value": "begin_redelegate"}, 
                {"result.Tags.key": "destination-validator"}, 
                {"Tresult.ags.value": address}
            ]}], 
            "code": {$exists: false}, 
            height:{$lt:height}},
        {sort:{height:-1},
            limit: 1}
        ).fetch();
    },
    'Transactions.findUser': function(address){
        // address is either delegator address or validator operator address
        let validator;
        if (address.includes(Meteor.settings.public.bech32PrefixValAddr)){
            // validator operator address
            validator = Validators.findOne({operator_address:address}, {fields:{address:1, description:1, operator_address:1, delegator_address:1}});
        }
        else if (address.includes(Meteor.settings.public.bech32PrefixAccAddr)){
            // delegator address
            validator = Validators.findOne({delegator_address:address}, {fields:{address:1, description:1, operator_address:1, delegator_address:1}});        
        }

        if (validator){
            return validator;
        }
        return false;

    }
});