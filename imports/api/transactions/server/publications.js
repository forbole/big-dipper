import { Meteor } from 'meteor/meteor';
import { Transactions } from '../transactions.js';
import { Blockscon } from '../../blocks/blocks.js';


publishComposite('transactions.list', function(limit = 30){
    return {
        find(){
            return Transactions.find({height: { $exists: true}, processed: {$ne: false}},{sort:{height:-1}, limit:limit})
        },
        children: [
            {
                find(tx){
                    if (tx.height)
                        return Blockscon.find(
                            {height:tx.height},
                            {fields:{time:1, height:1}}
                        )
                }
            }
        ]
    }
});

publishComposite('transactions.validator', function(validatorAddress, delegatorAddress, limit=100){
    let query = {};
    if (validatorAddress && delegatorAddress){
        query = {$or:[{"tx_response.logs.events.attributes.value":validatorAddress}, {"tx_response.logs.events.attributes.value":delegatorAddress}]}
    }

    if (!validatorAddress && delegatorAddress){
        query = {$or:[
            {"logs.events.attributes.value":delegatorAddress}, 
            {"tx.value.msg.value.cosmos_receiver": delegatorAddress },
            {"tx.value.msg.value.cosmos_sender": delegatorAddress },
            {"tx.value.msg.value.delegator_address": delegatorAddress },
            {"tx.value.msg.value.from_address": delegatorAddress },
            {"tx.value.msg.value.Signer": delegatorAddress },
            {"tx.value.msg.value.delegator_address": delegatorAddress },
            {"tx_response.logs.events.attributes.value":delegatorAddress},
        ]}
    }

    return {
        find(){
            return Transactions.find(query, {sort:{height:-1}, limit:limit})
        },
        children:[
            {
                find(tx){
                    return Blockscon.find(
                        {height:tx.height},
                        {fields:{time:1, height:1}}
                    )
                }
            }
        ]
    }
})

publishComposite('transactions.findOne', function(hash){
    return {
        find(){
            return Transactions.find({txhash:hash})
        },
        children: [
            {
                find(tx){
                    return Blockscon.find(
                        {height:tx.height},
                        {fields:{time:1, height:1}}
                    )
                }
            }
        ]
    }
})

publishComposite('transactions.height', function(height){
    return {
        find(){
            return Transactions.find({height:height})
        },
        children: [
            {
                find(tx){
                    return Blockscon.find(
                        {height:tx.height},
                        {fields:{time:1, height:1}}
                    )
                }
            }
        ]
    }
})