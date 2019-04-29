import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';

Meteor.methods({
    'accounts.getBalance': function(address){
        this.unblock();
        let balance = {}
        // get available atoms
        let url = LCD + '/bank/balances/'+ address;
        try{
            let available = HTTP.get(url);
            if (available.statusCode == 200){
                // console.log(JSON.parse(available.content))
                balance.available = JSON.parse(available.content);
                balance.available = balance.available[0];
            }
        }
        catch (e){
            console.log(e)
        }

        // get delegated amnounts
        url = LCD + '/staking/delegators/'+address+'/delegations';
        try{
            let delegations = HTTP.get(url);
            if (delegations.statusCode == 200){
                balance.delegations = JSON.parse(delegations.content);
            }
        }
        catch (e){
            console.log(e);
        }
        // get unbonding
        url = LCD + '/staking/delegators/'+address+'/unbonding_delegations';
        try{
            let unbonding = HTTP.get(url);
            if (unbonding.statusCode == 200){
                balance.unbonding = JSON.parse(unbonding.content);
            }
        }
        catch (e){
            console.log(e);
        }

        // get rewards
        url = LCD + '/distribution/delegators/'+address+'/rewards';
        try{
            let rewards = HTTP.get(url);
            if (rewards.statusCode == 200){
                balance.rewards = JSON.parse(rewards.content);
            }
        }
        catch (e){
            console.log(e);
        }

        return balance;
    }
})