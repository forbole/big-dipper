import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import { Promise } from "meteor/promise";
import { Blockscon } from '/imports/api/blocks/blocks.js';
import { Chain } from '/imports/api/chain/chain.js';
import { ValidatorSets } from '/imports/api/validator-sets/validator-sets.js';
import { Validators } from '/imports/api/validators/validators.js';
import { ValidatorRecords, Analytics, VPDistributions} from '/imports/api/records/records.js';
import { VotingPowerHistory } from '/imports/api/voting-power/history.js';
import { Evidences } from '../../evidences/evidences.js';
import { getAddress } from 'tendermint/lib/pubkey';
import * as cheerio from 'cheerio';

// import Block from '../../../ui/components/Block';

// getValidatorVotingPower = (validators, address) => {
//     for (v in validators){
//         if (validators[v].address == address){
//             return parseInt(validators[v].voting_power);
//         }
//     }
// }

getRemovedValidators = (prevValidators, validators) => {
    // let removeValidators = [];
    for (p in prevValidators){
        for (v in validators){
            if (prevValidators[p].address == validators[v].address){
                prevValidators.splice(p,1);
            }
        }
    }

    return prevValidators;
}

getValidatorProfileUrl = (identity) => {
    if (identity.length == 16){
        let response = HTTP.get(`https://keybase.io/_/api/1.0/user/lookup.json?key_suffix=${identity}&fields=pictures`)
        if (response.statusCode == 200) {
            let them = response.data.them
            return them && them.length && them[0].pictures && them[0].pictures.primary && them[0].pictures.primary.url;
        } else {
            console.log(JSON.stringify(response))
        }
    } else if (identity.indexOf("keybase.io/team/")>0){
        let teamPage = HTTP.get(identity);
        if (teamPage.statusCode == 200){
            let page = cheerio.load(teamPage.content);
            return page(".kb-main-card img").attr('src');
        } else {
            console.log(JSON.stringify(teamPage))
        }
    }
}

// var filtered = [1, 2, 3, 4, 5].filter(notContainedIn([1, 2, 3, 5]));
// console.log(filtered); // [4]

Meteor.methods({
    'blocks.averageBlockTime'(address){
        let blocks = Blockscon.find({proposerAddress:address}).fetch();
        let heights = blocks.map((block, i) => {
            return block.height;
        });
        let blocksStats = Analytics.find({height:{$in:heights}}).fetch();
        // console.log(blocksStats);

        let totalBlockDiff = 0;
        for (b in blocksStats){
            totalBlockDiff += blocksStats[b].timeDiff;
        }
        return totalBlockDiff/heights.length;
    },
    'blocks.findUpTime'(address){
        let collection = ValidatorRecords.rawCollection();
        // let aggregateQuery = Meteor.wrapAsync(collection.aggregate, collection);
        var pipeline = [
            {$match:{"address":address}},
            // {$project:{address:1,height:1,exists:1}},
            {$sort:{"height":-1}},
            {$limit:(Meteor.settings.public.uptimeWindow-1)},
            {$unwind: "$_id"},
            {$group:{
                "_id": "$address",
                "uptime": {
                    "$sum":{
                        $cond: [{$eq: ['$exists', true]}, 1, 0]
                    }
                }
            }
            }];
        // let result = aggregateQuery(pipeline, { cursor: {} });

        return Promise.await(collection.aggregate(pipeline).toArray());
        // return .aggregate()
    },
    'blocks.getLatestHeight': function() {
        this.unblock();
        let url = RPC+'/status';
        try{
            let response = HTTP.get(url);
            let status = JSON.parse(response.content);
            return (status.result.sync_info.latest_block_height);
        }
        catch (e){
            return 0;
        }
    },
    'blocks.getCurrentHeight': function() {
        this.unblock();
        let currHeight = Blockscon.find({},{sort:{height:-1},limit:1}).fetch();
        // console.log("currentHeight:"+currHeight);
        let startHeight = Meteor.settings.params.startHeight;
        if (currHeight && currHeight.length == 1) {
            let height = currHeight[0].height;
            if (height > startHeight)
                return height
        }
        return startHeight
    },
    'blocks.blocksUpdate': function() {
        if (SYNCING)
            return "Syncing...";
        else console.log("start to sync");
        // get the latest height
        let until = Meteor.call('blocks.getLatestHeight');
        // get the current height in db
        let curr = Meteor.call('blocks.getCurrentHeight');
        console.log(curr);


        let validatorSet = {}
        // get latest validator candidate information
        url = LCD+'/staking/validators';

        try{
            response = HTTP.get(url);
            JSON.parse(response.content).result.forEach((validator) => validatorSet[validator.consensus_pubkey] = validator);
        }
        catch(e){
            console.log(e);
        }

        url = LCD+'/staking/validators?status=unbonding';

        try{
            response = HTTP.get(url);
            JSON.parse(response.content).result.forEach((validator) => validatorSet[validator.consensus_pubkey] = validator)
        }
        catch(e){
            console.log(e);
        }

        url = LCD+'/staking/validators?status=unbonded';

        try{
            response = HTTP.get(url);
            JSON.parse(response.content).result.forEach((validator) => validatorSet[validator.consensus_pubkey] = validator)
        }
        catch(e){
            console.log(e);
        }

        // console.log(validatorSet);


        for(let key in validatorSet){
            try{
                Validators.upsert({consensus_pubkey:validatorSet[key].consensus_pubkey}, {$set:validatorSet[key]})
            }
            catch(e){
                console.log(e);
            }
        }


        let totalValidators = Object.keys(validatorSet).length;
        console.log("all validators: "+ totalValidators);

        // set initial height to latest height forcing it to always query the last block.
        for (let height = until ; height <= until ; height++) {
            let startBlockTime = new Date();
            // add timeout here? and outside this loop (for catched up and keep fetching)?
            this.unblock();
            let url = RPC+'/block?height=' + height;
            let analyticsData = {};

            console.log(url);
            try{
                const bulkValidators = Validators.rawCollection().initializeUnorderedBulkOp();
                const bulkValidatorRecords = ValidatorRecords.rawCollection().initializeUnorderedBulkOp();
                const bulkVPHistory = VotingPowerHistory.rawCollection().initializeUnorderedBulkOp();

                let startGetHeightTime = new Date();
                let response = HTTP.get(url);
                if (response.statusCode == 200){
                    let block = JSON.parse(response.content);
                    block = block.result;
                    // store height, hash, numtransaction and time in db
                    let blockData = {};
                    blockData.height = height;
                    blockData.hash = block.block_meta.block_id.hash;
                    blockData.transNum = block.block_meta.header.num_txs;
                    blockData.time = new Date(block.block.header.time);
                    blockData.lastBlockHash = block.block.header.last_block_id.hash;
                    blockData.proposerAddress = block.block.header.proposer_address;
                    blockData.validators = [];
                    let precommits = block.block.last_commit.precommits;
                    if (precommits != null){
                        // console.log(precommits.length);
                        for (let i=0; i<precommits.length; i++){
                            if (precommits[i] != null){
                                blockData.validators.push(precommits[i].validator_address);
                            }
                        }

                        // analyticsData.precommits = precommits.length;
                        // record for analytics
                        // PrecommitRecords.insert({height:height, precommits:precommits.length});
                    }

                    // save double sign evidences
                    if (block.block.evidence.evidence){
                        Evidences.insert({
                            height: height,
                            evidence: block.block.evidence.evidence
                        });
                    }

                    blockData.precommitsCount = blockData.validators.length;

                    analyticsData.height = height;

                    let endGetHeightTime = new Date();
                    console.log("Get height time: "+((endGetHeightTime-startGetHeightTime)/1000)+"seconds.");


                    let startGetValidatorsTime = new Date();
                    // update chain status
                    url = RPC+'/validators?height='+height;
                    response = HTTP.get(url);
                    console.log(url);
                    let validators = JSON.parse(response.content);
                    validators.result.block_height = parseInt(validators.result.block_height);
                    ValidatorSets.insert(validators.result);

                    blockData.validatorsCount = validators.result.validators.length;

                    // let startBlockInsertTime = new Date();
                    // Blockscon.insert(blockData);
                    // let endBlockInsertTime = new Date();
                    // console.log("Block insert time: "+((endBlockInsertTime-startBlockInsertTime)/1000)+"seconds.");

                    // store valdiators exist records
                    let existingValidators = Validators.find({address:{$exists:true}}).fetch();

                    if (height > 1){
                        // record precommits and calculate uptime
                        // only record from block 2
                        for (i in validators.result.validators){
                            let address = validators.result.validators[i].address;
                            let record = {
                                height: height,
                                address: address,
                                exists: false,
                                voting_power: parseInt(validators.result.validators[i].voting_power)//getValidatorVotingPower(existingValidators, address)
                            }

                            for (j in precommits){
                                if (precommits[j] != null){
                                    if (address == precommits[j].validator_address){
                                        record.exists = true;
                                        precommits.splice(j,1);
                                        break;
                                    }
                                }
                            }

                        }
                    }

                    let blockTime = Meteor.settings.params.defaultBlockTime;

                    let dateLatest = blockData.time;
                    let genesisTime = new Date(Meteor.settings.public.genesisTime);
                    blockTime = Math.abs(dateLatest.getTime() - genesisTime.getTime()) / blockData.height;

                    let endGetValidatorsTime = new Date();
                    console.log("Get height validators time: "+((endGetValidatorsTime-startGetValidatorsTime)/1000)+"seconds.");

                    Chain.update({chainId:block.block_meta.header.chain_id}, {$set:{lastSyncedTime:blockData.time, blockTime:blockTime}});

                    analyticsData.analyticsData = blockTime;
                    // analyticsData.timeDiff = timeDiff;

                    // analyticsData.time = blockData.time;

                    // initialize validator data at first block

                    analyticsData.voting_power = 0;

                    let startFindValidatorsNameTime = new Date();
                    if (validators.result){
                        // validators are all the validators in the current height
                        console.log("validatorSet size: "+validators.result.validators.length);
                        for (v in validators.result.validators){
                            // Validators.insert(validators.result.validators[v]);
                            let validator = validators.result.validators[v];
                            validator.voting_power = parseInt(validator.voting_power);
                            validator.proposer_priority = parseInt(validator.proposer_priority);

                            let valExist = Validators.findOne({"pub_key.value":validator.pub_key.value});
                            if (!valExist){
                                console.log(`validator pub_key ${validator.address} ${validator.pub_key.value} not in db`);

                                validator.address = getAddress(validator.pub_key);
                                validator.accpub = Meteor.call('pubkeyToBech32', validator.pub_key, Meteor.settings.public.bech32PrefixAccPub);
                                validator.operator_pubkey = Meteor.call('pubkeyToBech32', validator.pub_key, Meteor.settings.public.bech32PrefixValPub);
                                validator.consensus_pubkey = Meteor.call('pubkeyToBech32', validator.pub_key, Meteor.settings.public.bech32PrefixConsPub);

                                let validatorData = validatorSet[validator.consensus_pubkey]
                                if (validatorData){
                                    if (validatorData.description.identity)
                                        validator.profile_url =  getValidatorProfileUrl(validatorData.description.identity)
                                    validator.operator_address = validatorData.operator_address;
                                    validator.delegator_address = Meteor.call('getDelegator', validatorData.operator_address);
                                    validator.jailed = validatorData.jailed;
                                    validator.status = validatorData.status;
                                    validator.min_self_delegation = validatorData.min_self_delegation;
                                    validator.tokens = validatorData.tokens;
                                    validator.delegator_shares = validatorData.delegator_shares;
                                    validator.description = validatorData.description;
                                    validator.bond_height = validatorData.bond_height;
                                    validator.bond_intra_tx_counter = validatorData.bond_intra_tx_counter;
                                    validator.unbonding_height = validatorData.unbonding_height;
                                    validator.unbonding_time = validatorData.unbonding_time;
                                    validator.commission = validatorData.commission;
                                    validator.self_delegation = validator.delegator_shares;
                                } else {
                                    console.log('no con pub key?')
                                }

                                // bulkValidators.insert(validator);
                                bulkValidators.find({address: validator.address}).upsert().updateOne({$set:validator});
                                // console.log("validator first appears: "+bulkValidators.length);
                                bulkVPHistory.insert({
                                    address: validator.address,
                                    prev_voting_power: 0,
                                    voting_power: validator.voting_power,
                                    type: 'add',
                                    height: blockData.height,
                                    block_time: blockData.time
                                });

                            }
                            else{
                                let validatorData = validatorSet[valExist.consensus_pubkey]
                                if (validatorData){
                                    if (validatorData.description && (!valExist.description || validatorData.description.identity !== valExist.description.identity))
                                        validator.profile_url =  getValidatorProfileUrl(validatorData.description.identity)
                                    validator.jailed = validatorData.jailed;
                                    validator.status = validatorData.status;
                                    validator.tokens = validatorData.tokens;
                                    validator.delegator_shares = validatorData.delegator_shares;
                                    validator.description = validatorData.description;
                                    validator.bond_height = validatorData.bond_height;
                                    validator.bond_intra_tx_counter = validatorData.bond_intra_tx_counter;
                                    validator.unbonding_height = validatorData.unbonding_height;
                                    validator.unbonding_time = validatorData.unbonding_time;
                                    validator.commission = validatorData.commission;

                                    try{
                                        let response = HTTP.get(LCD + '/staking/delegators/'+valExist.delegator_address+'/delegations/'+valExist.operator_address);

                                        if (response.statusCode == 200){
                                            let selfDelegation = JSON.parse(response.content).result;
                                            if (selfDelegation.shares){
                                                validator.self_delegation = parseFloat(selfDelegation.shares)/parseFloat(validator.delegator_shares);
                                            }
                                        }
                                    }
                                    catch(e){
                                        // console.log(e);
                                    }

                                    bulkValidators.find({consensus_pubkey: valExist.consensus_pubkey}).updateOne({$set:validator});
                                    // console.log("validator exisits: "+bulkValidators.length);
                                    // validatorSet.splice(val, 1);
                                }  else {
                                    console.log('no con pub key?')
                                }
                                let prevVotingPower = VotingPowerHistory.findOne({address:validator.address}, {height:-1, limit:1});

                                if (prevVotingPower){
                                    if (prevVotingPower.voting_power != validator.voting_power){
                                        let changeType = (prevVotingPower.voting_power > validator.voting_power)?'down':'up';
                                        let changeData = {
                                            address: validator.address,
                                            prev_voting_power: prevVotingPower.voting_power,
                                            voting_power: validator.voting_power,
                                            type: changeType,
                                            height: blockData.height,
                                            block_time: blockData.time
                                        };
                                        bulkVPHistory.insert(changeData);
                                    }
                                }

                            }


                            // console.log(validator);

                            analyticsData.voting_power += validator.voting_power;
                        }

                        // if there is validator removed

                        let prevValidators = ValidatorSets.findOne({block_height:height-1});

                        if (prevValidators){
                            let removedValidators = getRemovedValidators(prevValidators.validators, validators.result.validators);

                            for (r in removedValidators){
                                bulkVPHistory.insert({
                                    address: removedValidators[r].address,
                                    prev_voting_power: removedValidators[r].voting_power,
                                    voting_power: 0,
                                    type: 'remove',
                                    height: blockData.height,
                                    block_time: blockData.time
                                });
                            }
                        }

                    }


                    // check if there's any validator not in db 14400 blocks(~1 day)
                    if (height % 10 == 0){
                        try {
                            console.log('Checking all validators against db...')
                            let dbValidators = {}
                            Validators.find({}, {fields: {consensus_pubkey: 1, status: 1}}
                                ).forEach((v) => dbValidators[v.consensus_pubkey] = v.status)
                            Object.keys(validatorSet).forEach((conPubKey) => {
                                let validatorData = validatorSet[conPubKey];
                                // Active validators should have been updated in previous steps
                                if (validatorData.status === 2)
                                    return

                                if (dbValidators[conPubKey] == undefined) {
                                    console.log(`validator with consensus_pubkey ${conPubKey} not in db`);
                                    let pubkeyType = Meteor.settings.public.secp256k1?'tendermint/PubKeySecp256k1':'tendermint/PubKeyEd25519';
                                    validatorData.pub_key = {
                                        "type" : pubkeyType,
                                        "value": Meteor.call('bech32ToPubkey', conPubKey)
                                    }
                                    validatorData.address = getAddress(validatorData.pub_key);
                                    validatorData.delegator_address = Meteor.call('getDelegator', validatorData.operator_address);

                                    validatorData.accpub = Meteor.call('pubkeyToBech32', validatorData.pub_key, Meteor.settings.public.bech32PrefixAccPub);
                                    validatorData.operator_pubkey = Meteor.call('pubkeyToBech32', validatorData.pub_key, Meteor.settings.public.bech32PrefixValPub);
                                    console.log(JSON.stringify(validatorData))
                                    bulkValidators.find({consensus_pubkey: conPubKey}).upsert().updateOne({$set:validatorData});
                                } else if (dbValidators[conPubKey] == 2) {
                                    bulkValidators.find({consensus_pubkey: conPubKey}).upsert().updateOne({$set:validatorData});
                                }
                            })
                        } catch (e){
                            console.log(e)
                        }
                    }

                    // fetching keybase every 14400 blocks(~1 day)
                    if (height % 14400 == 1){
                        console.log('Fetching keybase...')
                        Validators.find({}).forEach((validator) => {
                            try {
                                let profileUrl =  getValidatorProfileUrl(validator.description.identity)
                                if (profileUrl) {
                                    bulkValidators.find({address: validator.address}
                                        ).upsert().updateOne({$set:{'profile_url':profileUrl}});
                                }
                            } catch (e) {
                                console.log(e)
                            }
                        })
                    }

                    let endFindValidatorsNameTime = new Date();
                    console.log("Get validators name time: "+((endFindValidatorsNameTime-startFindValidatorsNameTime)/1000)+"seconds.");

                    // record for analytics
                    // let startAnayticsInsertTime = new Date();
                    Analytics.insert(analyticsData);
                    // let endAnalyticsInsertTime = new Date();
                    // console.log("Analytics insert time: "+((endAnalyticsInsertTime-startAnayticsInsertTime)/1000)+"seconds.");

                    let startVUpTime = new Date();
                    if (bulkValidators.length > 0){
                        // console.log(bulkValidators.length);
                        bulkValidators.execute((err, result) => {
                            if (err){
                                console.log(err);
                            }
                            if (result){
                                // console.log(result);
                            }
                        });
                    }

                    let endVUpTime = new Date();
                    console.log("Validator update time: "+((endVUpTime-startVUpTime)/1000)+"seconds.");

                    let startVRTime = new Date();
                    if (bulkValidatorRecords.length > 0){
                        bulkValidatorRecords.execute((err, result) => {
                            if (err){
                                console.log(err);
                            }
                        });
                    }

                    let endVRTime = new Date();
                    console.log("Validator records update time: "+((endVRTime-startVRTime)/1000)+"seconds.");

                    if (bulkVPHistory.length > 0){
                        bulkVPHistory.execute((err, result) => {
                            if (err){
                                console.log(err);
                            }
                        });
                    }

                    if (bulkTransations.length > 0){
                        bulkTransations.execute((err, result) => {
                            if (err){
                                console.log(err);
                            }
                        });
                    }
                }
            }
            catch (e){
                console.log(e);
                SYNCING = false;
                return "Stopped";
            }
            let endBlockTime = new Date();
            console.log("This block used: "+((endBlockTime-startBlockTime)/1000)+"seconds.");
        }
        SYNCING = false;
        Chain.update({chainId:Meteor.settings.public.chainId}, {$set:{lastBlocksSyncedTime:new Date(), totalValidators:totalValidators}});
        // }

        return until;
    },
    'addLimit': function(limit) {
        // console.log(limit+10)
        return (limit+10);
    },
    'hasMore': function(limit) {
        if (limit > Meteor.call('getCurrentHeight')) {
            return (false);
        } else {
            return (true);
        }
    }
});
