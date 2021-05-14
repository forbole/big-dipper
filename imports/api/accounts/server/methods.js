import { Meteor } from 'meteor/meteor';
import { Validators } from '/imports/api/validators/validators.js';
import fetch from 'node-fetch'

Meteor.methods({
    'accounts.getAccountDetail': async function (address) {
        this.unblock();
        let url = API + '/auth/accounts/' + address;
        try {
            await fetch(url)
                .then(function (response) {
                    if (response.ok) {
                        response.json().then(async (data) => {
                            let res = data.result;
                            let account;
                            if ((res.type === 'cosmos-sdk/Account') || (res.type === 'cosmos-sdk/BaseAccount'))
                                account = res.value;
                            else if (res.type === 'cosmos-sdk/DelayedVestingAccount' || res.type === 'cosmos-sdk/ContinuousVestingAccount')
                                account = res.value.BaseVestingAccount.BaseAccount

                            try {
                                url = API + '/bank/balances/' + address;
                                await fetch(url)
                                    .then(function (response) {
                                        if (response.ok) {
                                            response.json().then((data) => {
                                                let balances = data.result;
                                                account.coins = balances;
                                                if (account && account.account_number != null)
                                                    return account
                                                return null
                                            })
                                        }
                                    });
                            }
                            catch (e) {
                                return null
                            }
                        })
                    }
                });
        }
        catch (e) {
            console.log(url);
            console.log(e);
        }
    },
    'accounts.getBalance': async function (address) {
        this.unblock();
        let balance = {}

        // get available atoms
        let url = API + '/cosmos/bank/v1beta1/balances/' + address;

        try {
            await fetch(url)
                .then(function (response) {
                    if (response.ok) {
                        response.json().then((data) => {
                            balance.available = data.balances;
                        })
                    }
                });
        }
        catch (e) {
            console.log(url);
            console.log(e);
        }

        // get delegated amnounts
        url = API + '/cosmos/staking/v1beta1/delegations/' + address;
        try {
            await fetch(url)
                .then(function (response) {
                    if (response.ok) {
                        response.json().then((data) => {
                            balance.delegations = data.delegation_responses;
                        })
                    }
                });
        }
        catch (e) {
            console.log(url);
            console.log(e);
        }

        // get unbonding
        url = API + '/cosmos/staking/v1beta1/delegators/' + address + '/unbonding_delegations';
        try {
            await fetch(url)
                .then(function (response) {
                    if (response.ok) {
                        response.json().then((data) => {
                            balance.unbonding = data.unbonding_responses;
                        })
                    }
                });
        }
        catch (e) {
            console.log(url);
            console.log(e);        
        }

        // get rewards
        url = API + '/cosmos/distribution/v1beta1/delegators/' + address + '/rewards';
        try {
            await fetch(url)
                .then(function (response) {
                    if (response.ok) {
                        response.json().then((data) => {
                            //get seperate rewards value
                            balance.rewards = data.rewards;
                            //get total rewards value
                            balance.total_rewards = data.total;                            
                        })
                    }
                });
        }
        catch (e) {
            console.log(url);
            console.log(e);
        }

        // get commission
        let validator = Validators.findOne(
            { $or: [{ operator_address: address }, { delegator_address: address }, { address: address }] })
        if (validator) {
            let url = API + '/cosmos/distribution/v1beta1/validators/' + validator.operator_address + '/commission';
            balance.operatorAddress = validator.operator_address;

            try {
                await fetch(url)
                    .then(function (response) {
                        if (response.ok) {
                            response.json().then((data) => {
                                let content = data.commission;
                                if (content.commission && content.commission.length > 0){
                                    balance.commission = content.commission;

                                }
                            })
                        }
                    });
            }
            catch (e) {
                console.log(url);
                console.log(e);
            }
        }

        return balance;
    },
    'accounts.getDelegation': async function (address, validator) {
        this.unblock();

        let url = API + `/cosmos/staking/v1beta1/validators/${validator}/delegations/${address}`;
        let delegations={};
        try {
            await fetch(url)
                .then(function (response) {
                    if (response.ok) {
                        response.json().then((data) => {
                            delegations = data?.delegation_response;
                            if (delegations && delegations?.delegation?.shares){
                                delegations.delegation.shares = parseFloat(delegations?.delegation?.shares);
                            }
                        })
                    }
                });
        }
        catch (e) {
            console.log(url);
            console.log(e);
        }

        url = API + `/cosmos/staking/v1beta1/delegators/${address}/redelegations?dst_validator_addr=${validator}`;
        try {
            await fetch(url)
                .then(function (response) {
                    if (response.ok) {
                        response.json().then((data) => {
                            let relegations =  data.redelegation_responses;
                            let completionTime;
                            if (relegations) {
                                relegations.forEach((relegation) => {
                                    let entries = relegation.entries
                                    let time = new Date(entries[entries.length - 1].completion_time)
                                    if (!completionTime || time > completionTime)
                                        completionTime = time
                                })
                                delegations.redelegationCompletionTime = completionTime;
                            }
                        })
                    }
                });
        }
        catch (e) {
            console.log(url);
            console.log(e);
        }

        url = API + `/cosmos/staking/v1beta1/validators/${validator}/delegations/${address}/unbonding_delegation`;
        try {
            await fetch(url)
                .then(function (response) {
                    if (response.ok) {
                        response.json().then((data) => {
                            let undelegations = data.result;
                            if (undelegations) {
                                delegations.unbonding = undelegations.entries.length;
                                delegations.unbondingCompletionTime = undelegations.entries[0].completion_time;
                            }
                        })
                    }
                });
        }
        catch (e) {
            console.log(url);
            console.log(e);
        }
        return delegations;
    },
    'accounts.getAllDelegations': async function (address) {
        this.unblock();
        let url = API + '/cosmos/staking/v1beta1/delegators/' + address + '/delegations';
        try {
            await fetch(url)
                .then(function (response) {
                    if (response.ok) {
                        response.json().then((data) => {
                            let delegations = data.result;
                            if (delegations && delegations.length > 0) {
                                delegations.forEach((delegation, i) => {
                                    if (delegations[i] && delegations[i].shares)
                                        delegations[i].shares = parseFloat(delegations[i].shares);
                                })
                            }
                            return delegations;
                        })
                    }
                });
        }
        catch (e) {
            console.log(url);
            console.log(e);
        }
    },
    'accounts.getAllUnbondings': async function (address) {
        this.unblock();
        let url = API + '/cosmos/staking/v1beta1/delegators/' + address + '/unbonding_delegations';

        try {
            await fetch(url)
                .then(function (response) {
                    if (response.ok) {
                        response.json().then((data) => {
                            let unbondings = data.result;
                            return unbondings;
                        })
                    }
                });
        }
        catch (e) {
            console.log(url);
            console.log(e);
        }
    },
    'accounts.getAllRedelegations': async function (address, validator) {
        this.unblock();
        let url = API + `/cosmos/staking/v1beta1/v1beta1/delegators/${address}/redelegations&src_validator_addr=${validator}`;
        try {
            await fetch(url)
                .then(function (response) {
                    if (response.ok) {
                        response.json().then((data) => {
                            let redelegations = {}
                            data.forEach((redelegation) => {
                                let entries = redelegation.entries;
                                redelegations[redelegation.validator_dst_address] = {
                                    count: entries.length,
                                    completionTime: entries[0].completion_time
                                }
                            })
                            return redelegations
                        })
                    }
                });
        }
        catch (e) {
            console.log(url);
            console.log(e);
        }
    },
    'accounts.getRedelegations': async function (address) {
        this.unblock();
        let url = API + '/cosmos/staking/v1beta1/v1beta1/delegators/' + address + '/redelegations';
        try{
            await fetch(url)
                .then(function (response) {
                    if (response.ok) {
                        response.json().then((data) => {
                            let userRedelegations = data.result;
                            return userRedelegations;
                        })
                    }
                });
            
        }
        catch(e) {
            console.log(url);
            console.log(e);
        }
    },
})
