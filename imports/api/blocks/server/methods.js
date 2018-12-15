import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import { Promise } from "meteor/promise";
import { Blockscon } from '/imports/api/blocks/blocks.js';
import { Chain } from '/imports/api/chain/chain.js';
import { ValidatorSets } from '/imports/api/validator-sets/validator-sets.js';
import { Validators } from '/imports/api/validators/validators.js';
import { ValidatorRecords, Analytics} from '/imports/api/records/records.js';
import { VotingPowerHistory } from '/imports/api/voting-power/history.js';

Meteor.methods({
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
        if (currHeight && currHeight.length == 1)
            return currHeight[0].height; 
        else return Meteor.settings.params.startHeight;
    },
    'blocks.blocksUpdate': function() {
        if (SYNCING)
            return "Syncing...";
        else console.log("start to sync");
        // Meteor.clearInterval(Meteor.timerHandle);
        // get the latest height
        let until = Meteor.call('blocks.getLatestHeight');
        // console.log(until);
        // get the current height in db
        let curr = Meteor.call('blocks.getCurrentHeight');
        console.log(curr);
        // loop if there's update in db
        if (until > curr) {
            SYNCING = true;
            for (let height = curr+1 ; height <= until ; height++) {
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
                        blockData.time = block.block.header.time;
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

                            analyticsData.precommits = precommits.length;
                            // record for analytics
                            // PrecommitRecords.insert({height:height, precommits:precommits.length});
                        }                      
                        let startBlockInsertTime = new Date();
                        Blockscon.insert(blockData);
                        let endBlockInsertTime = new Date();
                        console.log("Block insert time: "+((endBlockInsertTime-startBlockInsertTime)/1000)+"seconds.");
                        
                        // store valdiators exist records
                        let existingValidators = Validators.find({address:{$exists:true}}).fetch();
                        
                        // record precommits and calculate uptime
                        for (i in existingValidators){
                            let record = {
                                height: height,
                                address: existingValidators[i].address,
                                exists: false,
                                voting_power: existingValidators[i].voting_power
                            }

                            for (j in precommits){
                                if (precommits[j] != null){
                                    if (existingValidators[i].address == precommits[j].validator_address){
                                        record.exists = true;
                                        precommits.splice(j,1);                                        
                                        break;
                                    }
                                }
                            }

                            // calculate the uptime based on the records stored in previous blocks
                            // only do this every 12 blocks ~

                            if ((height % 12) == 0){
                                // let startAggTime = new Date();
                                let numBlocks = Meteor.call('blocks.findUpTime', existingValidators[i].address);
                                // let endAggTime = new Date();
                                // console.log("Get aggregated uptime for "+existingValidators[i].address+": "+((endAggTime-startAggTime)/1000)+"seconds.");
                                if ((numBlocks[0] != null) && (numBlocks[0].uptime != null)){
                                    uptime = numBlocks[0].uptime;
                                }
                                if (record.exists){
                                    if (uptime < Meteor.settings.public.uptimeWindow){
                                        uptime++;                                           
                                    }
                                    uptime = (uptime / Meteor.settings.public.uptimeWindow)*100;
                                    bulkValidators.find({address:existingValidators[i].address}).updateOne({$set:{uptime:uptime, lastSeen:blockData.time}});
                                }
                                else{
                                    uptime = (uptime / Meteor.settings.public.uptimeWindow)*100;
                                    bulkValidators.find({address:existingValidators[i].address}).updateOne({$set:{uptime:uptime}});
                                }
                            }

                            bulkValidatorRecords.insert(record);
                            // ValidatorRecords.update({height:height,address:record.address},record);                            
                        }

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
                        let chainStatus = Chain.findOne({chainId:block.block_meta.header.chain_id});
                        let lastSyncedTime = chainStatus?chainStatus.lastSyncedTime:0;
                        let timeDiff;
                        let blockTime = Meteor.settings.params.defaultBlockTime;
                        if (lastSyncedTime){
                            let dateLatest = new Date(blockData.time);
                            let dateLast = new Date(lastSyncedTime);
                            timeDiff = Math.abs(dateLatest.getTime() - dateLast.getTime());
                            blockTime = (chainStatus.blockTime * (blockData.height - 1) + timeDiff) / blockData.height;
                        }

                        let endGetValidatorsTime = new Date();
                        console.log("Get height validators time: "+((endGetValidatorsTime-startGetValidatorsTime)/1000)+"seconds.");

                        Chain.update({chainId:block.block_meta.header.chain_id}, {$set:{lastSyncedTime:blockData.time, blockTime:blockTime}});

                        analyticsData.averageBlockTime = blockTime;
                        analyticsData.timeDiff = timeDiff;

                        analyticsData.time = blockData.time;

                        // initialize validator data at first block
                        if (height == 1){
                            Validators.remove({});
                        }

                        // get latest validator candidate information
                        let startFindValidatorsNameTime = new Date();
                        url = LCD+'/stake/validators';
                        response = HTTP.get(url);
                        console.log(url);
                        let validatorSet = JSON.parse(response.content);
                    
                        analyticsData.voting_power = 0;

                        // see if validators have been removed

                        // console.log(height);

                        let prevValSet;
                        // console.log(height);
                        if (height > 1){
                            prevValSet = ValidatorSets.findOne({block_height:height-1});
                        }

                        let removedVals = [];

                        // console.log(prevValSet.validators[0]);
                        if (prevValSet){
                            let prevValAddrs = prevValSet.validators.map((v, i) =>{
                                // console.log(address);
                                return v.address;
                            });

                            let curValAddrs = validators.result.validators.map((v,i) => {
                                return v.address;
                            });

                            if (prevValAddrs.length > 0){
                                removedVals = prevValAddrs.filter( ( el ) => !curValAddrs.includes( el ) );
                            }
                        }
                        
                        console.log("=== number of revmoved validator: "+removedVals.length);

                        if (removedVals.length > 0){
                            for (v in removedVals){
                                let changeType = 'remove';
                                let changeData = {
                                    address: removedVals[v].address,
                                    prev_voting_power: removedVals[v].voting_power,
                                    voting_power: 0,
                                    type: changeType,
                                    height: height,
                                    block_time: blockData.time
                                };
                                bulkVPHistory.insert(changeData);
                            }
                        }


                        // console.log(validators);
                        // validators are all the validators in the current height
                        if (validators.result){
                            for (v in validators.result.validators){
                                // Validators.insert(validators.result.validators[v]);
                                let validator = validators.result.validators[v];
                                validator.voting_power = parseInt(validator.voting_power);
                                validator.proposer_priority = parseInt(validator.proposer_priority);

                                let valExist = Validators.findOne({"pub_key.value":validator.pub_key.value});
                                // console.log("//// valExist? ////");
                                // console.log(valExist);
                                if (!valExist){
                                    // console.log("validator not in db");
                                    let command = Meteor.settings.bin.gaiadebug+" pubkey "+validator.pub_key.value;
                                    // console.log(command);
                                    let tempVal = validator;
                                    Meteor.call('runCode', command, function(error, result){
                                        tempVal.address = result.match(/\s[0-9A-F]{40}$/igm);
                                        tempVal.address = validator.address[0].trim();
                                        tempVal.hex = result.match(/\s[0-9A-F]{64}$/igm);
                                        tempVal.hex = validator.hex[0].trim();
                                        tempVal.cosmosaccpub = result.match(/cosmospub.*$/igm);
                                        tempVal.cosmosaccpub = validator.cosmosaccpub[0].trim();
                                        tempVal.operator_pubkey = result.match(/cosmosvaloperpub.*$/igm);
                                        tempVal.operator_pubkey = validator.operator_pubkey[0].trim();
                                        tempVal.consensus_pubkey = result.match(/cosmosvalconspub.*$/igm);
                                        tempVal.consensus_pubkey = validator.consensus_pubkey[0].trim();

                                        for (val in validatorSet){
                                            if (validatorSet[val].consensus_pubkey == tempVal.consensus_pubkey){
                                                // console.log("Address: "+validator.address);
                                                // console.log(validatorSet[val].description);
                                                tempVal.operator_address = validatorSet[val].operator_address;
                                                tempVal.jailed = validatorSet[val].jailed;
                                                tempVal.status = validatorSet[val].status;
                                                tempVal.tokens = validatorSet[val].tokens;
                                                tempVal.delegator_shares = validatorSet[val].delegator_shares;
                                                tempVal.description = validatorSet[val].description;
                                                tempVal.bond_height = validatorSet[val].bond_height;
                                                tempVal.bond_intra_tx_counter = validatorSet[val].bond_intra_tx_counter;
                                                tempVal.unbonding_height = validatorSet[val].unbonding_height;
                                                tempVal.unbonding_time = validatorSet[val].unbonding_time;
                                                tempVal.commission = validatorSet[val].commission;
                                                tempVal.removed = false,
                                                tempVal.removedAt = 0
                                                validatorSet.splice(val, 1);
                                                break;
                                            }
                                        }
                                        
                                        bulkValidators.insert(tempVal);
                                        bulkVPHistory.insert({
                                            address: tempVal.address,
                                            prev_voting_power: 0,
                                            voting_power: tempVal.voting_power,
                                            type: 'add',
                                            height: blockData.height,
                                            block_time: blockData.time
                                        });
                                        
                                    });
                                }
                                else{
                                    let tempVal = validator;
                                    let prevVotingPower = valExist.voting_power;
                                    // console.log("//// this validator");
                                    // console.log(tempVal);
                                    for (val in validatorSet){
                                        // console.log("//// each validator in the set");
                                        // console.log(validatorSet[val]);
                                        if (validatorSet[val].consensus_pubkey == valExist.consensus_pubkey){
                                            // console.log(valExist.consensus_pubkey);
                                            // console.log(validatorSet[val].consensus_pubkey);
                                            // tempVal.operator_address = validatorSet[val].operator_address;
                                            tempVal.jailed = validatorSet[val].jailed;
                                            tempVal.status = validatorSet[val].status;
                                            tempVal.tokens = validatorSet[val].tokens;
                                            tempVal.delegator_shares = validatorSet[val].delegator_shares;
                                            tempVal.description = validatorSet[val].description;
                                            tempVal.bond_height = validatorSet[val].bond_height;
                                            tempVal.bond_intra_tx_counter = validatorSet[val].bond_intra_tx_counter;
                                            tempVal.unbonding_height = validatorSet[val].unbonding_height;
                                            tempVal.unbonding_time = validatorSet[val].unbonding_time;
                                            tempVal.commission = validatorSet[val].commission;
                                            bulkValidators.find({consensus_pubkey: valExist.consensus_pubkey}).update({$set:tempVal});
                                            validatorSet.splice(val, 1);
                                            // break;
                                        }
                                        else{
                                            bulkValidators.find({consensus_pubkey: validatorSet[val].consensus_pubkey}).update({$set:validatorSet[val]});
                                        }
                                    }
                                    // if (valExist.consensus_pubkey == "cosmosvalconspub1zcjduepqgv79s6nxjf2dcl3pm9dltvyuvtpu3c8xhlxsl278svxljupkcjeqjcuxa8"){
                                    //     console.log(tmepVal);
                                    // }
                                    
                                    if (prevVotingPower != tempVal.voting_power){
                                        let changeType = (prevVotingPower > tempVal.voting_power)?'down':'up';
                                        let changeData = {
                                            address: tempVal.address,
                                            prev_voting_power: prevVotingPower,
                                            voting_power: tempVal.voting_power,
                                            type: changeType,
                                            height: blockData.height,
                                            block_time: blockData.time
                                        };
                                        // console.log('voting power changed.');
                                        // console.log(changeData);
                                        bulkVPHistory.insert(changeData);
                                    }
                                    
                                }
                                

                                // console.log(validator);

                                analyticsData.voting_power += validator.voting_power;
                            }
                        }

                        // exit();
                        // let removedVals = prevValSet.validators.filter(( el ) => validators.includes( el ) )

                        // Update info from remaining validator set



                        // console.log("Validators not updated: "+validatorSet.length);
                        // url = LCD+'/validatorsets/'+height;
                        // response = HTTP.get(url);
                        // console.log(url);
                        
                        // // validatorSet is the validator set at current height
                        // validatorSet = JSON.parse(response.content);
                        


                        let endFindValidatorsNameTime = new Date();
                        console.log("Get validators name time: "+((endFindValidatorsNameTime-startFindValidatorsNameTime)/1000)+"seconds.");
                    
                        // record for analytics
                        let startAnayticsInsertTime = new Date();
                        Analytics.insert(analyticsData);
                        let endAnalyticsInsertTime = new Date();
                        console.log("Analytics insert time: "+((endAnalyticsInsertTime-startAnayticsInsertTime)/1000)+"seconds.");


                        let startVUpTime = new Date();
                        if (bulkValidators.length > 0){
                            bulkValidators.execute((err, result) => {
                                if (err){
                                    console.log(err);
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
            Chain.update({chainId:Meteor.settings.public.chainId}, {$set:{lastBlocksSyncedTime:new Date()}});
        }
        
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