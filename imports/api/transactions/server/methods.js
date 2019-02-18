import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import { Transactions } from '../../transactions/transactions.js';
import { Validators } from '../../validators/validators.js';

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
        if (!tx.code){
            let msg = tx.tx.value.msg;
            for (let m in msg){
                if (msg[m].type == "cosmos-sdk/MsgCreateValidator"){
                    console.log(msg[m].value);
                    // let command = Meteor.settings.bin.gaiadebug+" pubkey "+msg[m].value.pubkey;
                    let validator = {
                        consensus_pubkey: msg[m].value.pubkey,
                        description: msg[m].value.description,
                        commission: msg[m].value.commission,
                        min_self_delegation: msg[m].value.min_self_delegation,
                        operator_address: msg[m].value.validator_address,
                        delegator_address: msg[m].value.delegator_address,
                        voting_power: Math.floor(parseInt(msg[m].value.value.amount) / 1000000)
                    }

                    Validators.upsert({consensus_pubkey:msg[m].value.pubkey},validator);

                    // console.log(valExist);
                    // if (valExist){
                    //     Validators.update({consensus_pubkey:msg[m].value.pubkey},validator);
                    // }
                    // else{
                        
                    // }
                    /*
                    try{
                        Validators.upsert({consensus_pubkey:msg[m].value.pubkey},validator);
                    }
                    catch(e){
                        console.log(e.code);
                        if (e.code === 11000){
                            Validators.update({consensus_pubkey:msg[m].value.pubkey},validator);
                        }
                    }
                    */
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