import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import { Transactions } from '../../transactions/transactions.js';
import { Validators } from '../../validators/validators.js';

const AddressLength = 40;

Meteor.methods({
    'Transactions.updateTransactions': async function(){
        this.unblock();
        if (TXSYNCING)
            return "Syncing transactions...";

        const transactions = Transactions.find({processed:false},{limit: 500}).fetch();
        try{
            TXSYNCING = true;
            const bulkTransactions = Transactions.rawCollection().initializeUnorderedBulkOp();
            for (let i in transactions){
                try {
                    let url = API+ '/cosmos/tx/v1beta1/txs/'+transactions[i].txhash;
                    let response = HTTP.get(url);
                    let tx = JSON.parse(response.content);
            
                    tx.height = parseInt(tx.tx_response.height);
                    tx.processed = true;

                    bulkTransactions.find({txhash:transactions[i].txhash}).updateOne({$set:tx});

            
                }
                catch(e) {
                    console.log("Getting transaction %o: %o", hash, e);
                }
            }
            if (bulkTransactions.length > 0){
                console.log("aaa: %o",bulkTransactions.length)
                bulkTransactions.execute((err, result) => {
                    if (err){
                        console.log(err);
                    }
                    if (result){
                        console.log(result);
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
                {"tx_response.logs.events.type": "delegate"},
                {"tx_response.logs.events.attributes.key": "validator"},
                {"tx_response.logs.events.attributes.value": address}
            ]}, {$and:[
                {"tx_response.logs.events.attributes.key": "action"},
                {"tx_response.logs.events.attributes.value": "unjail"},
                {"tx_response.logs.events.attributes.key": "sender"},
                {"tx_response.logs.events.attributes.value": address}
            ]}, {$and:[
                {"tx_response.logs.events.type": "create_validator"},
                {"tx_response.logs.events.attributes.key": "validator"},
                {"tx_response.logs.events.attributes.value": address}
            ]}, {$and:[
                {"tx_response.logs.events.type": "unbond"},
                {"tx_response.logs.events.attributes.key": "validator"},
                {"tx_response.logs.events.attributes.value": address}
            ]}, {$and:[
                {"tx_response.logs.events.type": "redelegate"},
                {"tx_response.logs.events.attributes.key": "destination_validator"},
                {"tx_response.logs.events.attributes.value": address}
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
            fields = {address:1, description:1, operatorAddress:1, delegatorAddress:1};
        if (address.includes(Meteor.settings.public.bech32PrefixValAddr)){
            // validator operator address
            validator = Validators.findOne({operatorAddress:address}, {fields});
        }
        else if (address.includes(Meteor.settings.public.bech32PrefixAccAddr)){
            // delegator address
            validator = Validators.findOne({delegatorAddress:address}, {fields});
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
