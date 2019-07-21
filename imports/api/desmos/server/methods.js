import { HTTP } from 'meteor/http';

const desmosRPC = Meteor.settings.remote.desmosRPC
const desmosLCD = Meteor.settings.remote.desmosLCD
const desmosFaucet = Meteor.settings.remote.desmosFaucet

let fetchTx = (txhash) => {
    try {
        let url = `${desmosLCD}/txs/${txhash}`;
        let response = HTTP.get(url);
        if (response.statusCode == 200) {
            let attributes = response.data.events[0].attributes
            let res = {};
            attributes.forEach((attr) => {
                res[attr.key] = attr.value
            })
            return res
        }
    } catch (e) {
        console.log(e)
    }
}

Meteor.methods({
    'desmos.airdrop': function(address) {
        const url = `${desmosFaucet}/airdrop`;
        data = {address}
        const timestamp = new Date().getTime();
        console.log(`submitting airdrop request: ${timestamp} ${url} with for address ${address}`)

        let response = HTTP.post(url, {data});
        if (response.statusCode == 200) {
            if (response.data.code)
                throw new Meteor.Error(data.code, JSON.parse(data.raw_log).message)
            return true
        }
    },
    'desmos.getAccount': function(address) {
        this.unblock();
        let url = `${desmosLCD}/auth/accounts/${address}`;
        try{
            let available = HTTP.get(url);
            if (available.statusCode == 200){
                let response = JSON.parse(available.content);
                let account;
                if (response.type === 'cosmos-sdk/Account')
                    account = response.value;
                else if (response.type === 'cosmos-sdk/DelayedVestingAccount' || response.type === 'cosmos-sdk/ContinuousVestingAccount')
                    account = response.value.BaseVestingAccount.BaseAccount
                if (account && account.account_number != null)
                    return account
                return null
            }
        }
        catch (e){
            console.log(e)
        }
    },
    'desmos.broadcastCreateSession': function(txInfo) {
        let url = `${desmosLCD}/txs`;
        data = {
            "tx": txInfo.value,
            "mode": "block"
        }
        const timestamp = new Date().getTime();
        console.log(`submitting desmos transaction${timestamp} ${url} with data ${JSON.stringify(data)}`)

        let response = HTTP.post(url, {data});
        console.log(`response for desmos transaction${timestamp} ${url}: ${JSON.stringify(response)}`)
        if (response.statusCode == 200) {
            let data = response.data
            if (data.code)
                throw new Meteor.Error(data.code, JSON.parse(data.raw_log).message)

            return fetchTx(response.data.txhash)
        }
    },
    'desmos.broadcast': function(txInfo) {
        let url = `${desmosLCD}/txs`;
        data = {
            "tx": txInfo.value,
            "mode": "sync"
        }
        const timestamp = new Date().getTime();
        console.log(`submitting desmos transaction${timestamp} ${url} with data ${JSON.stringify(data)}`)

        let response = HTTP.post(url, {data});
        console.log(`response for desmos transaction${timestamp} ${url}: ${JSON.stringify(response)}`)
        if (response.statusCode == 200) {
            let data = response.data
            if (data.code)
                throw new Meteor.Error(data.code, JSON.parse(data.raw_log).message)

            return data
        }
    }
})