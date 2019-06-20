import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import { Validators } from '/imports/api/validators/validators.js';

Meteor.methods({
    'accounts.getAccountDetail': function(address){
        this.unblock();
        let url = LCD + '/auth/accounts/'+ address;
        try{
            let available = HTTP.get(url);
            if (available.statusCode == 200){
                let response = JSON.parse(available.content);
                let account;
                if (response.type === 'auth/Account')
                    account = response.value;
                else if (response.type === 'auth/DelayedVestingAccount' || response.type === 'auth/ContinuousVestingAccount')
                    account = response.value.BaseVestingAccount.BaseAccount
                if (account && account.public_key != null)
                    return account
                return null
            }
        }
        catch (e){
            console.log(e)
        }
    },
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
                if (balance.available && balance.available.length > 0)
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

        // get commission
        let validator = Validators.findOne(
            {$or: [{operator_address:address}, {delegator_address:address}, {address:address}]})
        if (validator) {
            let url = LCD + '/distribution/validators/' + validator.operator_address;
            balance.operator_address = validator.operator_address;
            try {
                let rewards = HTTP.get(url);
                if (rewards.statusCode == 200){
                    let content = JSON.parse(rewards.content);
                    if (content.val_commission && content.val_commission.length > 0)
                        balance.commission = content.val_commission[0];
                }

            }
            catch (e){
                console.log(e)
            }
        }

        return balance;
    },
    'accounts.getDelegation'(address, validator){
        let url = `${LCD}/staking/delegators/${address}/delegations/${validator}`;

        try{
            let delegations = HTTP.get(url);
            if (delegations.statusCode == 200){
                delegation = JSON.parse(delegations.content);
                if (delegation.shares)
                    delegation.shares = parseFloat(delegation.shares);
                return delegation;
            };
        }
        catch (e){
            console.log(e);
        }
    },
    'accounts.getAllDelegations'(address){
        let url = LCD + '/staking/delegators/'+address+'/delegations';

        try{
            let delegations = HTTP.get(url);
            if (delegations.statusCode == 200){
                delegations = JSON.parse(delegations.content);
                if (delegations && delegations.length > 0){
                    delegations.forEach((delegation, i) => {
                        if (delegations[i] && delegations[i].shares)
                            delegations[i].shares = parseFloat(delegations[i].shares);
                    })
                }

                return delegations;
            };
        }
        catch (e){
            console.log(e);
        }
    },
    'accounts.getAllUnbondings'(address){
        let url = LCD + '/staking/delegators/'+address+'/unbonding_delegations';

        try{
            let unbondings = HTTP.get(url);
            if (unbondings.statusCode == 200){
                unbondings = JSON.parse(unbondings.content);
                return unbondings;
            };
        }
        catch (e){
            console.log(e);
        }
    }
})