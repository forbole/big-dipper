/* eslint-disable camelcase */

import { Meteor } from 'meteor/meteor';
import { Transactions } from '../../transactions/transactions.js';
import { Blockscon } from '../../blocks/blocks.js';
import { Validators } from '../../validators/validators.js';
import { Chain } from '../../chain/chain.js';
import { getValidatorProfileUrl } from '../../blocks/server/methods.js';


Meteor.methods({
    'Validators.findCreateValidatorTime': function(address){
        this.unblock();
        // look up the create validator time to consider if the validator has never updated the commission
        let tx = Transactions.findOne({$and:[
            {"tx.body.messages.delegator_address":address},
            {"tx.body.messages.@type":"/cosmos.staking.v1beta1.MsgCreateValidator"},
            {"tx_response.code":0}
        ]});

        if (tx){
            let block = Blockscon.findOne({height:tx.height});
            if (block){
                return block.time;
            }
        }
        else{
            // no such create validator tx
            return false;
        }
    },
    'Validators.getAllDelegations'(address){
        this.unblock();
        let url = `${API}/cosmos/staking/v1beta1/validators/${address}/delegations?pagination.limit=10&pagination.count_total=true`;

        try {
            let delegations = HTTP.get(url);
            if (delegations.statusCode == 200) {
                let delegationsCount = JSON.parse(delegations.content)?.pagination?.total;
                return delegationsCount;
            };
        }
        catch (e) {
            console.log(url);
            console.log("Getting error: %o when getting delegations count from %o", e, url);
        }
    },

    'Validators.fetchKeybase'(address) {
        this.unblock();
        // fetching keybase every base on keybaseFetchingInterval settings
        // default to every 5 hours 
        
        let url = RPC + '/status';
        let chainId;

        try {
            let response = HTTP.get(url);
            let status = JSON.parse(response?.content);
            chainId = Meteor.settings.public.chainId
        }
        catch (e) {
            console.log("Error getting chainId for keybase fetching")        
        }

        let chainStatus = Chain.findOne({chainId});
        const bulkValidators = Validators.rawCollection().initializeUnorderedBulkOp();
        let lastKeybaseFetchTime = Date.parse(chainStatus?.lastKeybaseFetchTime) ?? 0

        console.log("Last fetch time: %o", lastKeybaseFetchTime)
        console.log('Fetching keybase...')

        Validators.find({}).forEach(async (validator) => {
            try {
                if (validator?.description && validator?.description?.identity) {
                    let profileUrl = getValidatorProfileUrl(validator?.description?.identity)

                    if (profileUrl) {
                        bulkValidators.find({ address: validator?.address }).upsert().updateOne({ $set: { 'profile_url': profileUrl } });
                        if (bulkValidators.length > 0) {
                            bulkValidators.execute((err, result) => {
                                if (err) {
                                    console.log(`Error when updating validator profile_url ${err}`);
                                }
                                if (result) {
                                    console.log('Validator profile_url has been updated!');
                                }
                            });
                        }
                    }
                }
            } catch (e) {
                console.log("Error fetching Keybase for %o: %o", validator?.address, e)
            }
        })
        try{
            console.log("Update chain")
            Chain.update({ chainId }, { $set: { lastKeybaseFetchTime: new Date().toUTCString() } });
        }
        catch(e){
            console.log("Error when updating lastKeybaseFetchTime")
        }

    }    

});