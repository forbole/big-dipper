import { HTTP } from 'meteor/http';
import { Validators } from '../../validators/validators';
import { Meteor } from 'meteor/meteor';
import { marshalTx, unmarshalTx } from '@tendermint/amino-js';
import proto from "@forbole/cosmos-protobuf-js"
import { Tx, TxRaw, AuthInfo, TxBody, SignDoc, SignerInfo} from "@cosmjs/stargate/build/codec/cosmos/tx/v1beta1/tx";
import { fromBase64, toHex, toUtf8, fromHex } from "@cosmjs/encoding";
// import { BroadcastMode, BroadcastTxRequest, SimulateRequest } from '.@cosmjs/stargate/build/codec/cosmos/tx/v1beta1'
// import { BroadcastMode } from "@cosmjs/stargate/build/codec/cosmos/tx/broadcast/v1beta1/broadcast";
// import { encodeSecp256k1Pubkey, makeSignDoc as makeSignDocAmino } from "@cosmjs/amino";
// import { fromBase64, toHex, toUtf8 } from "@cosmjs/encoding";
// import { TxRaw, AuthInfo, TxBody, SignDoc } from "@cosmjs/stargate/build/codec/cosmos/tx/v1beta1/tx";
import { sha256 } from 'js-sha256';
import secp256k1 from 'secp256k1';
import fetch from 'cross-fetch';

import { isNonNullObject, isUint8Array } from '@cosmjs/utils';

Meteor.methods({
    'transaction.submit': function (sig, signMessage, txBody, txContext, address, action) {
        this.unblock();
        const url = `${API}/cosmos/tx/v1beta1/txs`;
        console.log("^^^^^^^^^^^^^^^^^^")
        console.log(sig)
        console.log(action)
        console.log(txContext)
        console.log("^^^^^^^^^^^^^^^^^^")

        const bodyB = TxBody.fromPartial(txBody?.body)
        const bodyBytes = TxBody.encode(bodyB).finish();
        console.log(bodyBytes)
        let authI = AuthInfo.fromPartial(txBody.auth_info)
        const authInfoBytes = AuthInfo.encode(authI).finish();
        console.log(authInfoBytes)


        const txRaw = {
            body: bodyBytes,
            auth_info: authInfoBytes,
            signatures: [Buffer.from(sig.signature)]
        };

        const txRaw2 = {
            bodyBytes: bodyBytes,
            authInfoBytes: authInfoBytes,
            signatures: [Buffer.from(sig.signature)]
        };

        const txRaw3 = {
            body_bytes: bodyBytes,
            auth_info_bytes: authInfoBytes,
            signatures: [Buffer.from(sig.signature)]
        };

        const txRaw4 = {
            body: bodyBytes,
            authInfo: authInfoBytes,
            signatures: [Buffer.from(sig.signature)]
        };
        let txB = TxRaw.fromPartial(txRaw2)
        // let txB = TxRaw.fromJSON(txRaw2)

        const txBytes = TxRaw.encode((txB)).finish();
        const txBytesBase64 = Buffer.from((txBytes), 'binary').toString('base64');
        console.log(txBytesBase64)

        let data = {
            tx_bytes: txBytesBase64,
            mode: "BROADCAST_MODE_SYNC"
        }
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