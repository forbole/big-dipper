import { HTTP } from 'meteor/http';

Meteor.methods({
    'transaction.submit': function (txInfo) {
        const url = `${LCD}/txs`;
        data = {
            "tx": txInfo.value,
            "mode": "sync"
        }
        const timestamp = new Date().getTime();
        console.log(`submitting transaction${timestamp} ${url} with data ${JSON.stringify(data)}`)

        let response = HTTP.post(url, { data });
        console.log(`response for transaction${timestamp} ${url}: ${JSON.stringify(response)}`)
        if (response.statusCode == 200) {
            let data = response.data
            if (data.code)
                throw new Meteor.Error(data.code, JSON.parse(data.raw_log).message)
            return response.data.txhash;
        }
    },
    'transaction.execute': function (body, path) {
        const url = `${LCD}/${path}`;
        data = {
            "base_req": {
                ...body,
                "chain_id": Meteor.settings.public.chainId,
                "simulate": false
            }
        };
        let response = HTTP.post(url, { data });
        if (response.statusCode == 200) {
            return JSON.parse(response.content);
        }
    },
    'transaction.simulate': function (txMsg, from, path, adjustment = '1.2') {
        const url = `${LCD}/${path}`;
        data = {
            ...txMsg,
            "base_req": {
                "from": from,
                "chain_id": Meteor.settings.public.chainId,
                "gas_adjustment": adjustment,
                "simulate": true
            }
        };
        let response = HTTP.post(url, { data });

        if (response.statusCode == 200) {
            return JSON.parse(response.content).gas_estimate;
        }
    },


    'cdp.getCDPParams': function () {
        this.unblock();
        let url = LCD + '/cdp/parameters';
        let cdpParams = {};

        try {
            let response = HTTP.get(url);
            if (response.statusCode == 200) {
                cdpParams = JSON.parse(response.content).result;
                return cdpParams
            }
        }
        catch (e) {
            console.log(e.response.content)
        }
    },

    'cdp.getCDPPrice': function (market) {
        this.unblock();
        let url = LCD + '/pricefeed/price/' + market;
        let cdpPrice = null;

        try {
            let response = HTTP.get(url);
            if (response.statusCode == 200) {
                cdpPrice = JSON.parse(response.content).result.price;
                return cdpPrice
            }
        }
        catch (e) {
            console.log(e.response.content)
        }
    },

    'cdp.getDeposits': function (address, collateral) {
        this.unblock();
        let url = LCD + '/cdp/cdps/cdp/deposits/' + address + '/' + collateral;

        try {
            let response = HTTP.get(url);
            if (response.statusCode == 200) {
                return JSON.parse(response.content).result
            }
        }
        catch (e) {
            console.log(url);
            console.log(e.response.content);
        }
    },

    'account.getIncentive': function (address, collateral) {
        this.unblock();
        let url = LCD + '/incentive/claims/' + address + '/' + collateral;

        try {
            let response = HTTP.get(url);
            if (response.statusCode == 200) {
                return JSON.parse(response.content).result
            }
        }
        catch (e) {
            console.log(url);
            console.log(e.response.content);
        }
    },

    'account.auction': function () {
        this.unblock();
        let url = LCD + '/auction/auctions'

        try {
            let response = HTTP.get(url);
            if (response.statusCode == 200) {
                return JSON.parse(response.content).result
            }
        }
        catch (e) {
            console.log(url);
            console.log(e.response.content);
        }
    }



})