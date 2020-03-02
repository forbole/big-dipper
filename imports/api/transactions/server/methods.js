import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import { Transactions } from '../../transactions/transactions.js';
import { Validators } from '../../validators/validators.js';
import { VotingPowerHistory } from '../../voting-power/history.js';

const AddressLength = 40;

Meteor.methods({
    'Transactions.index': function(hash, blockTime){
        this.unblock();
        hash = hash.toUpperCase();
        console.log("Get tx: "+hash)
        try {
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
    
        }
        catch(e) {
            console.log(url);
            console.log(e)
        }
    },
    'Transactions.findDelegation': function(address, height){
        // following cosmos-sdk/x/slashing/spec/06_events.md and cosmos-sdk/x/staking/spec/06_events.md
        return Transactions.find({
            $or: [{$and: [
                {"events.type": "delegate"},
                {"events.attributes.key": "validator"},
                {"events.attributes.value": address}
            ]}, {$and:[
                {"events.attributes.key": "action"},
                {"events.attributes.value": "unjail"},
                {"events.attributes.key": "sender"},
                {"events.attributes.value": address}
            ]}, {$and:[
                {"events.type": "create_validator"},
                {"events.attributes.key": "validator"},
                {"events.attributes.value": address}
            ]}, {$and:[
                {"events.type": "unbond"},
                {"events.attributes.key": "validator"},
                {"events.attributes.value": address}
            ]}, {$and:[
                {"events.type": "redelegate"},
                {"events.attributes.key": "destination_validator"},
                {"events.attributes.value": address}
            ]}],
            "code": {$exists: false},
            height:{$lt:height}},
        {sort:{height:-1},
            limit: 1}
        ).fetch();
    },
    'Transactions.findUser': function(address, fields=null){
        // address is either delegator address or validator operator address
        let validator;
        if (!fields)
            fields = {address:1, description:1, operator_address:1, delegator_address:1};
        if (address.includes(Meteor.settings.public.bech32PrefixValAddr)){
            // validator operator address
            validator = Validators.findOne({operator_address:address}, {fields});
        }
        else if (address.includes(Meteor.settings.public.bech32PrefixAccAddr)){
            // delegator address
            validator = Validators.findOne({delegator_address:address}, {fields});
        }
        else if (address.length === AddressLength) {
            validator = Validators.findOne({address:address}, {fields});
        }
        if (validator){
            return validator;
        }
        return false;

    }
});
