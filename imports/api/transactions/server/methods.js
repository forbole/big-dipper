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

        if (!tx.code){
            let msg = tx.tx.value.msg;
            for (let m in msg){
                if (msg[m].type == "irishub/stake/MsgCreateValidator"){
                    console.log(msg[m].value);
                    let command = Meteor.settings.bin.gaiadebug+" pubkey "+msg[m].value.pubkey;
                    let validator = {
                        pubkey: msg[m].value.pubkey,
                        description: msg[m].value.Description,
                        commission: msg[m].value.Commission,
                        min_self_delegation: msg[m].value.min_self_delegation,
                        operator_address: msg[m].value.validator_address,
                        delegator_address: msg[m].value.delegator_address,
                        voting_power: Math.floor(parseInt(msg[m].value.value.amount) / 1000000)
                    }

                    Meteor.call('runCode', command, function(error, result){
                        validator.address = result.match(/\s[0-9A-F]{40}$/igm);
                        validator.address = validator.address[0].trim();
                        validator.hex = result.match(/\s[0-9A-F]{64}$/igm);
                        validator.hex = validator.hex[0].trim();
                        let re = new RegExp(Meteor.settings.public.bech32PrefixAccPub+".*$","igm");
                        validator.cosmosaccpub = result.match(re);
                        validator.cosmosaccpub = validator.cosmosaccpub[0].trim();
                        re = new RegExp(Meteor.settings.public.bech32PrefixValPub+".*$","igm");
                        validator.operator_pubkey = result.match(re);
                        validator.operator_pubkey = validator.operator_pubkey[0].trim();
                        re = new RegExp(Meteor.settings.public.bech32PrefixConsPub+".*$","igm");
                        validator.consensus_pubkey = result.match(re);
                        validator.consensus_pubkey = validator.consensus_pubkey[0].trim();

                        Validators.upsert({pubkey:msg[m].value.pubkey},validator);
                        VotingPowerHistory.insert({
                            address: validator.address,
                            prev_voting_power: 0,
                            voting_power: validator.voting_power,
                            type: 'add',
                            height: tx.height+2,
                            block_time: blockTime
                        });
                    })
                }
            }
        }
        

        let txId = Transactions.insert(tx);
        if (txId){
            return txId;
        }
        else return false;
    },
    'Transactions.findDelegation': function(address, height){
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