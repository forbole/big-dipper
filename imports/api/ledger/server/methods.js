import { HTTP } from 'meteor/http';
import { Validators } from '../../validators/validators';

Meteor.methods({
    'transaction.submit': function(txInfo, actionType) {
        this.unblock();

        // const fee = {
        //     amount: [{ amount: '0', denom }],
        //     gas: '200000'
        // }
        // try {
        //     const result = await this._client.signAndBroadcast(
        //         fromAddress,
        //         messages,
        //         fee,
        //         memo
        //     )
        //     assertIsBroadcastTxSuccess(result)
        // } catch (e) {
        //     console.log(e)
        //     throw 'Failed to broadcast transaction.' + e
        // }

        //
        let url="";
        let txObject = JSON.stringify(txInfo.value);
        let txBytesBase64 = Buffer.from(txObject).toString('base64');

        if (actionType === 'vote' || actionType === 'deposit' || actionType === 'submitProposal'){
            url = `${API}/cosmos/tx/v1beta1/txs`;
            data = {
                "tx_bytes": txBytesBase64,
                "mode": "BROADCAST_MODE_SYNC"
            }
        }
        // else{
        //     url = `${API}/txs`;
        //     data = {
        //         "tx": txInfo.value,
        //         "mode": "sync"
        //     }
        // }
       
        console.log(url)
        console.log(data)

        const timestamp = new Date().getTime();
        console.log(`submitting transaction${timestamp} ${url} with data ${JSON.stringify(data)}`)

        let response = HTTP.post(url, {data});
        console.log(`response for transaction${timestamp} ${url}: ${JSON.stringify(response)}`)
        if (response.statusCode == 200) {
            let data = response.data
            if (data.code)
                throw new Meteor.Error(data.code, JSON.parse(data.raw_log).message)
            return response.data.txhash;
        }
    },
    'transaction.execute': function(body, path) {
        this.unblock();
        const url = `${API}/${path}`;
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
    'transaction.simulate': function(txMsg, from, accountNumber, sequence, path, adjustment='1.2') {
        this.unblock();
        const url = `${API}/${path}`;
        console.log(txMsg);
        data = {...txMsg,
            "base_req": {
                "from": from,
                "chain_id": Meteor.settings.public.chainId,
                "gas_adjustment": adjustment,
                "account_number": accountNumber,
                "sequence": sequence.toString(),
                "simulate": true
            }
        };
        console.log(url);
        console.log(data);
        let response = HTTP.post(url, {data});
        if (response.statusCode == 200) {
            return JSON.parse(response.content).gas_estimate;
        }
    },
    'isValidator': function(address){
        this.unblock();
        let validator = Validators.findOne({delegator_address:address})
        return validator;
    }
})