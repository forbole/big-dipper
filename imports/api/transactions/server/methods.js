import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import { Transactions } from '../../transactions/transactions.js';
import { Validators } from '../../validators/validators.js';

const AddressLength = 40;

const bulkTransactions = Transactions.rawCollection().initializeUnorderedBulkOp();

getTransaction = async (hash) => {
    hash = hash.toUpperCase();
    // console.log("Get tx: "+hash)
    try {
        let url = LCD+ '/txs/'+hash;
        let response = HTTP.get(url);
        let tx = JSON.parse(response.content);

        // console.log(hash);

        tx.height = parseInt(tx.height);
        tx.processed = true;

        // let txId = Transactions.upsert({txhash:hash}, {$set:tx});
        bulkTransactions.find({txhash:hash}).upsert().updateOne({$set:tx});
        // if (txId){
        //     return txId;
        // }
        // else return false;

    }
    catch(e) {
        console.log("Getting transaction %o: %o", hash, e);
    }
}

Meteor.methods({
    'Transactions.updateTransactions': function(){
        if (TXSYNCING)
            return "Syncing transactions...";
        this.unblock();
        const transactions = Transactions.find({processed:false},{limit: 100}).fetch();
        try{
            TXSYNCING = true;
            for (let i in transactions){
                // console.log(transactions[i]);
                getTransaction(transactions[i].txhash)
            }
            if (bulkTransactions.length > 0){
                bulkTransactions.execute((err, result) => {
                    if (err){
                        console.log(err);
                    }
                    if (result){
                        console.log(result.result.ok);
                    }
                });
            }
        }
        catch (e) {
            TXSYNCING = false;
            return e
        }
        TXSYNCING = false;
        return transactions.length
    },
    'Transactions.findDelegation': function(address, height){
        this.unblock();
        // following cosmos-sdk/x/slashing/spec/06_events.md and cosmos-sdk/x/staking/spec/06_events.md
        return Transactions.find({
            $or: [{$and: [
                {"logs.events.type": "delegate"},
                {"logs.events.attributes.key": "validator"},
                {"logs.events.attributes.value": address}
            ]}, {$and:[
                {"logs.events.attributes.key": "action"},
                {"logs.events.attributes.value": "unjail"},
                {"logs.events.attributes.key": "sender"},
                {"logs.events.attributes.value": address}
            ]}, {$and:[
                {"logs.events.type": "create_validator"},
                {"logs.events.attributes.key": "validator"},
                {"logs.events.attributes.value": address}
            ]}, {$and:[
                {"logs.events.type": "unbond"},
                {"logs.events.attributes.key": "validator"},
                {"logs.events.attributes.value": address}
            ]}, {$and:[
                {"logs.events.type": "redelegate"},
                {"logs.events.attributes.key": "destination_validator"},
                {"logs.events.attributes.value": address}
            ]}],
            "code": {$exists: false},
            height:{$lt:height}},
        {sort:{height:-1},
            limit: 1}
        ).fetch();
    },
    'Transactions.findUser': function(address, fields=null){
        this.unblock();
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
