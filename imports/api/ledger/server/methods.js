import { HTTP } from 'meteor/http';
import { Validators } from '../../validators/validators';

Meteor.methods({
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