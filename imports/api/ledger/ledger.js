import { HTTP } from 'meteor/http';

Meteor.methods({
    'transaction.submit': function(txInfo) {
        const url = `${LCD}/txs`;
        data = {
            "tx": txInfo.value,
            "mode": "sync"
        }
        console.log(JSON.stringify(data))
        let response = HTTP.post(url, {data});
        if (response.statusCode == 200) {
            return JSON.parse(response.content).txhash;
        }
    },
    'staking.simulate': function(txMsg, path) {
        const msg = txMsg.value.msg[0].value;
        const delegatorAddress = msg.delegator_address;
        const url = `${LCD}/staking/delegators/${delegatorAddress}/${path}`;
        data = {...msg,
            "base_req": {
                "from": delegatorAddress,
                "chain_id": Meteor.settings.public.chainId,
                "gas_adjustment": "1.2",
                "simulate": true
            }
        };
        let response = HTTP.post(url, {data});
        if (response.statusCode == 200) {
            return JSON.parse(response.content).gas_estimate;
        }
    },
})