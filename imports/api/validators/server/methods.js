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
    'Validators.getAllDelegations'(address){
        this.unblock();
        let url = `${API}/cosmos/staking/v1beta1/validators/${address}/delegations?pagination.limit=10&pagination.count_total=true`;

        try {
            let delegations = HTTP.get(url);
            if (delegations.statusCode == 200) {
                let delegationsCount = JSON.parse(delegations.content)?.pagination?.total;
                return delegationsCount;
            };
        }
        catch (e) {
            console.log(url);
            console.log("Getting error: %o when getting delegations count from %o", e, url);
        }
    }
});