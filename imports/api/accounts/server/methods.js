import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import { Validators } from '/imports/api/validators/validators.js';

const fetchFromUrl = (url) => {
    try {
        let res = HTTP.get(LCD + url);
        if (res.statusCode == 200) {
            return res
        };
    } catch (e) {
        console.log(res);
        console.log(e.response.content);
    }
}

Meteor.methods({
    'accounts.getAccountDetail': function (address) {
        this.unblock();
        let url = LCD + '/auth/accounts/' + address;
        try {
            let available = HTTP.get(url);
            if (available.statusCode == 200) {
                let response = JSON.parse(available.content).result;
                let account;
                if (response.type === 'cosmos-sdk/Account')
                    account = response.value;
                else if (response.type === 'cosmos-sdk/DelayedVestingAccount' || response.type === 'cosmos-sdk/ContinuousVestingAccount')
                    account = response.value.BaseVestingAccount.BaseAccount
                else if (response.type === 'cosmos-sdk/PeriodicVestingAccount')
                    account = response.value
                if (account && account.account_number != null)
                    return account
                return null
            }
        } catch (e) {
            console.log(url);
            console.log(e.response.content)
        }
    },
    'accounts.getBalance': function (address) {
        this.unblock();
        let balance = {}

        // get available atoms
        let url = LCD + '/bank/balances/' + address;
        try {
            let available = HTTP.get(url);
            if (available.statusCode == 200) {
                balance.available = JSON.parse(available.content).result;

            }
        } catch (e) {
            console.log(url);
            console.log(e.response.content)
        }

        // get delegated amnounts
        url = LCD + '/staking/delegators/' + address + '/delegations';
        try {
            let delegations = HTTP.get(url);
            if (delegations.statusCode == 200) {
                balance.delegations = JSON.parse(delegations.content).result;
            }
        } catch (e) {
            console.log(url);
            console.log(e.response.content);
        }
        // get unbonding
        url = LCD + '/staking/delegators/' + address + '/unbonding_delegations';
        try {
            let unbonding = HTTP.get(url);
            if (unbonding.statusCode == 200) {
                balance.unbonding = JSON.parse(unbonding.content).result;
            }
        } catch (e) {
            console.log(url);
            console.log(e.response.content);
        }

        // get rewards
        url = LCD + '/distribution/delegators/' + address + '/rewards';
        try {
            let rewards = HTTP.get(url);
            if (rewards.statusCode == 200) {
                //get seperate rewards value
                balance.rewards = JSON.parse(rewards.content).result.rewards;
                //get total rewards value
                balance.total_rewards = JSON.parse(rewards.content).result.total;

            }
        } catch (e) {
            console.log(url);
            console.log(e.response.content);
        }

        // get commission
        let validator = Validators.findOne({
            $or: [{
                operator_address: address
            }, {
                delegator_address: address
            }, {
                address: address
            }]
        })
        if (validator) {
            let url = LCD + '/distribution/validators/' + validator.operator_address;
            balance.operator_address = validator.operator_address;
            try {
                let rewards = HTTP.get(url);
                if (rewards.statusCode == 200) {
                    let content = JSON.parse(rewards.content).result;
                    if (content.val_commission && content.val_commission.length > 0)
                        balance.commission = content.val_commission;

                }

            } catch (e) {
                console.log(url);
                console.log(e.response.content)
            }
        }

        return balance;
    },
    'accounts.getDelegation'(address, validator) {
        let url = LCD + `/staking/delegators/${address}/delegations/${validator}`;
        let delegations = {};
        try {
            delegations = HTTP.get(url);
            if (delegations.statusCode == 200) {
                delegations = JSON.parse(delegations.content).result;
                if (delegations && delegations.shares)
                    delegations.shares = parseFloat(delegations.shares);
            };
        } catch (e) {
            console.log(url);
            console.log(e);
        }

        url = LCD + `/staking/redelegations?delegator=${address}&validator_to=${validator}`;

        try {
            let completionTime;
            let relegations = HTTP.get(url);
            if (relegations.statusCode == 200) {
                relegations = JSON.parse(relegations.content).result;
                relegations.forEach((relegation) => {
                    let entries = relegation.entries
                    let time = new Date(entries[entries.length - 1].completion_time)
                    if (!completionTime || time > completionTime)
                        completionTime = time
                })

                delegations.redelegationCompletionTime = completionTime;
            };
        } catch (e) {
            console.log(url);
            console.log(e.response.content);
        }

        url = LCD + `/staking/delegators/${address}/unbonding_delegations/${validator}`;

        try {

            let undelegations = HTTP.get(url);
            if (undelegations.statusCode == 200) {
                undelegations = JSON.parse(undelegations.content).result;
                delegations.unbonding = undelegations.entries.length;
                delegations.unbondingCompletionTime = undelegations.entries[0].completion_time;
            };
        } catch (e) {
            console.log(url);
            console.log(e.response.content);
        }

        return delegations
    },

    'accounts.getAllDelegations'(address) {
        let url = LCD + '/staking/delegators/' + address + '/delegations';

        try {
            let delegations = HTTP.get(url);
            if (delegations.statusCode == 200) {
                delegations = JSON.parse(delegations.content).result;
                if (delegations && delegations.length > 0) {
                    delegations.forEach((delegation, i) => {
                        if (delegations[i] && delegations[i].shares)
                            delegations[i].shares = parseFloat(delegations[i].shares);
                    })
                }

                return delegations;
            };
        } catch (e) {
            console.log(url);
            console.log(e.response.content);
        }
    },
    'accounts.getAllUnbondings'(address) {
        let url = LCD + '/staking/delegators/' + address + '/unbonding_delegations';

        try {
            let unbondings = HTTP.get(url);
            if (unbondings.statusCode == 200) {
                unbondings = JSON.parse(unbondings.content).result;
                return unbondings;
            };
        } catch (e) {
            console.log(url);
            console.log(e.response.content);
        }
    },
    'accounts.getAllRedelegations'(address, validator) {
        let url = `/staking/redelegations?delegator=${address}&validator_from=${validator}`;
        let result = fetchFromUrl(url);
        if (result && result.data) {
            let redelegations = {}
            result.data.forEach((redelegation) => {
                let entries = redelegation.entries;
                redelegations[redelegation.validator_dst_address] = {
                    count: entries.length,
                    completionTime: entries[0].completion_time
                }
            })
            return redelegations
        }
    },

    'accounts.getRedelegations'(address) {

        let url = LCD + '/staking/redelegations?delegator=' + address; 

        try {
            let userRedelegations = HTTP.get(url);
            if (userRedelegations.statusCode == 200) {
                userRedelegations = JSON.parse(userRedelegations.content).result;

                return userRedelegations;
            };
        } catch (e) {
            console.log(url);
            console.log(e.response.content);
        }
    },

    //get BNB 
    'accounts.getCDP': function (address) {

        let cdp = {}

        // get available atoms
        let url = LCD + '/cdp/cdps/denom/bnb'
        try {
            let result = HTTP.get(url);
            if (result.statusCode == 200) {
                cdp = JSON.parse(result.content).result;

            }
        } catch (e) {
            console.log(e.response.content)
        }
        return cdp
    },

    //get Account CDP 
    'accounts.getAccountCDP': function (address, collateral) {

        let cdp = {}

        // get available atoms
        let url = LCD + '/cdp/cdps/cdp/' + address + '/' + collateral
        try {
            let result = HTTP.get(url);
            if (result.statusCode == 200) {
                cdp = JSON.parse(result.content).result;
            }
        } catch (e) {
            console.log(e.response.content)
        }
        return cdp
    },

    'cdp.getCDPList': function () {
        this.unblock();
        let url = LCD + '/cdp/cdps/denom/bnb';
        try {
            let result = HTTP.get(url);
            if (result.statusCode == 200) {
                let list = JSON.parse(result.content).result;
                return list

            }
        } catch (e) {
            console.log(e.response.content)
        }
    },
})