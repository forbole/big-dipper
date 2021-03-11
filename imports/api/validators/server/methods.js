import { Meteor } from 'meteor/meteor';
import { Transactions } from '../../transactions/transactions.js';
import { Blockscon } from '../../blocks/blocks.js';

Meteor.methods({
    'Validators.findCreateValidatorTime': function(address){
        this.unblock();
        // look up the create validator time to consider if the validator has never updated the commission
        let tx = Transactions.findOne({$and:[
            {"tx.body.messages.delegator_address":address},
            {"tx.body.messages.@type":"/cosmos.staking.v1beta1.MsgCreateValidator"},
            {"tx_response.code":0}
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
    },
    // async 'Validators.getAllDelegations'(address){
    'Validators.getAllDelegations'(address){
        this.unblock();
        let url = API + '/cosmos/staking/v1beta1/validators/'+address+'/delegations';

        try{
            let delegations = HTTP.get(url);
            if (delegations.statusCode == 200){
                delegations = JSON.parse(delegations.content).delegation_responses;
                delegations.forEach((delegation, i) => {
                    if (delegations[i] && delegations[i].shares)
                        delegations[i].shares = parseFloat(delegations[i].shares);
                })
                
                return delegations;
            };
        }
        catch (e){
            console.log(url);
            console.log("Getting error: %o when fetching from %o", e, url);
        }
    }
});