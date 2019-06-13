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
    'transaction.execute': function(body, path) {
        const url = `${LCD}/${path}`;
        data = {
            "base_req": {
                ...body,
                "chain_id": Meteor.settings.public.chainId,
                "simulate": false
            }
        };
        let response = HTTP.post(url, {data});
        if (response.statusCode == 200) {
            return JSON.parse(response.content);
        }
    },
    'transaction.simulate': function(txMsg, from, path) {
        const msg = (
            txMsg && txMsg.value && txMsg.value.msg && txMsg.value.msg.length &&
            txMsg.value.msg[0].value || {}
        );
        const url = `${LCD}/${path}`;
        data = {...msg,
            "base_req": {
                "from": from,
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