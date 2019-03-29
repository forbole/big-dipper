import { Meteor } from 'meteor/meteor';
import { Transactions } from '../../transactions/transactions.js';
import { Blockscon } from '../../blocks/blocks.js';

Meteor.methods({
    'Validators.findCreateValidatorTime': function(address){
        // look up the create validator time to consider if the validator has never updated the commission
        let tx = Transactions.findOne({$and:[
            {"tx.value.msg.value.delegator_address":address},
            {"tx.value.msg.type":"cosmos-sdk/MsgCreateValidator"},
            {code:{$exists:false}}
        ]});

        if (tx){
            let block = Blockscon.findOne({height:tx.height});
            if (block){
                return block.time;
            }
        }
        else{
            // no such create validator tx
            return false;
        }
    }
});