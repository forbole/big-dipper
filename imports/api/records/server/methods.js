import { Meteor } from 'meteor/meteor';
import { ValidatorRecords, Analytics, AverageData, AverageValidatorData } from '../records.js';
import { Validators } from '../../validators/validators.js';
import { Status } from '../../status/status.js';
import { MissedBlocksStats } from '../records.js';
import { Blockscon } from '../../blocks/blocks.js';
import { Chain } from '../../chain/chain.js';

Meteor.methods({
    'ValidatorRecords.missedBlocksCount': function(address){
        this.unblock();
        return ValidatorRecords.find({address:address}).count();
    },
    'ValidatorRecords.calculateMissedBlocks': function(){
        // console.log("ValidatorRecords.calculateMissedBlocks: "+COUNTMISSEDBLOCKS);
        if (!COUNTMISSEDBLOCKS){
            COUNTMISSEDBLOCKS = true;
            console.log('calulate missed blocks count');
            this.unblock();
            let validators = Validators.find({}).fetch();
            let latestHeight = Meteor.call('blocks.getCurrentHeight');
            let explorerStatus = Status.findOne({chainId: Meteor.settings.public.chainId});
            let startHeight = (explorerStatus&&explorerStatus.lastMissedBlockHeight)?explorerStatus.lastMissedBlockHeight:Meteor.settings.params.startHeight;
            // console.log(latestHeight);
            // console.log(startHeight);
            const bulkMissedStats = MissedBlocksStats.rawCollection().initializeUnorderedBulkOp();
            for (i in validators){
                // if ((validators[i].address == "B8552EAC0D123A6BF609123047A5181D45EE90B5") || (validators[i].address == "69D99B2C66043ACBEAA8447525C356AFC6408E0C") || (validators[i].address == "35AD7A2CD2FC71711A675830EC1158082273D457")){
                let voterAddress = validators[i].address;
                let missedRecords = ValidatorRecords.find({
                    address:voterAddress, 
                    exists:false, 
                    $and: [ { height: { $gt: startHeight } }, { height: { $lte: latestHeight } } ] 
                }).fetch();

                let counts = {};

                // console.log("missedRecords to process: "+missedRecords.length);
                for (b in missedRecords){
                    let block = Blockscon.findOne({height:missedRecords[b].height});
                    let existingRecord = MissedBlocksStats.findOne({voter:voterAddress, proposer:block.proposerAddress});

                    if (typeof counts[block.proposerAddress] === 'undefined'){
                        if (existingRecord){
                            counts[block.proposerAddress] = existingRecord.count+1;
                        }
                        else{
                            counts[block.proposerAddress] = 1;
                        }
                    }
                    else{
                        counts[block.proposerAddress]++;
                    }
                }

                for (address in counts){
                    let data = {
                        voter: voterAddress,
                        proposer:address,
                        count: counts[address]
                    }

                    bulkMissedStats.find({voter:voterAddress, proposer:address}).upsert().updateOne({$set:data});
                }
                // }

            }

            if (bulkMissedStats.length > 0){
                bulkMissedStats.execute(Meteor.bindEnvironment((err, result) => {
                    if (err){
                        COUNTMISSEDBLOCKS = false;
                        console.log(err);
                    }
                    if (result){
                        Status.upsert({chainId: Meteor.settings.public.chainId}, {$set:{lastMissedBlockHeight:latestHeight, lastMissedBlockTime: new Date()}});
                        COUNTMISSEDBLOCKS = false;
                        console.log("done");
                    }
                }));
            }
            else{
                COUNTMISSEDBLOCKS = false;
            }
            
            return true;
        }
        else{
            return "updating...";
        }
    },
    'Analytics.aggregateBlockTimeAndVotingPower': function(time){
        this.unblock();
        let now = new Date();
        
        if (time == 'm'){
            let averageBlockTime = 0;
            let averageVotingPower = 0;
    
            let analytics = Analytics.find({ "time": { $gt: new Date(Date.now() - 60 * 1000) } }).fetch();
            if (analytics.length > 0){
                for (i in analytics){
                    averageBlockTime += analytics[i].timeDiff;
                    averageVotingPower += analytics[i].voting_power;
                }
                averageBlockTime = averageBlockTime / analytics.length;
                averageVotingPower = averageVotingPower / analytics.length;

                Chain.update({chainId:Meteor.settings.public.chainId},{$set:{lastMinuteVotingPower:averageVotingPower, lastMinuteBlockTime:averageBlockTime}});
                AverageData.insert({
                    averageBlockTime: averageBlockTime,
                    averageVotingPower: averageVotingPower,
                    type: time,
                    createdAt: now
                })
            }
        }
        if (time == 'h'){
            let averageBlockTime = 0;
            let averageVotingPower = 0;
            let analytics = Analytics.find({ "time": { $gt: new Date(Date.now() - 60*60 * 1000) } }).fetch();
            if (analytics.length > 0){
                for (i in analytics){
                    averageBlockTime += analytics[i].timeDiff;
                    averageVotingPower += analytics[i].voting_power;
                }
                averageBlockTime = averageBlockTime / analytics.length;    
                averageVotingPower = averageVotingPower / analytics.length;

                Chain.update({chainId:Meteor.settings.public.chainId},{$set:{lastHourVotingPower:averageVotingPower, lastHourBlockTime:averageBlockTime}});
                AverageData.insert({
                    averageBlockTime: averageBlockTime,
                    averageVotingPower: averageVotingPower,
                    type: time,
                    createdAt: now
                })
            }
        }

        if (time == 'd'){
            let averageBlockTime = 0;
            let averageVotingPower = 0;
            let analytics = Analytics.find({ "time": { $gt: new Date(Date.now() - 24*60*60 * 1000) } }).fetch();
            if (analytics.length > 0){
                for (i in analytics){
                    averageBlockTime += analytics[i].timeDiff;
                    averageVotingPower += analytics[i].voting_power;
                }
                averageBlockTime = averageBlockTime / analytics.length;    
                averageVotingPower = averageVotingPower / analytics.length;

                Chain.update({chainId:Meteor.settings.public.chainId},{$set:{lastDayVotingPower:averageVotingPower, lastDayBlockTime:averageBlockTime}});
                AverageData.insert({
                    averageBlockTime: averageBlockTime,
                    averageVotingPower: averageVotingPower,
                    type: time,
                    createdAt: now
                })
            }
        }

        // return analytics.length;
    },
    'Analytics.aggregateValidatorDailyBlockTime': function(){
        this.unblock();
        let validators = Validators.find({}).fetch();
        let now = new Date();
        for (i in validators){
            let averageBlockTime = 0;

            let blocks = Blockscon.find({proposerAddress:validators[i].address, "time": { $gt: new Date(Date.now() - 24*60*60 * 1000) }}, {fields:{height:1}}).fetch();
            // console.log(blocks);

            if (blocks.length > 0){
                let blockHeights = [];
                for (b in blocks){
                    blockHeights.push(blocks[b].height);
                }
    
                // console.log(blockHeights);
                let analytics = Analytics.find({height: {$in:blockHeights}}, {fields:{height:1,timeDiff:1}}).fetch();
                // console.log(analytics);
    
                
                for (a in analytics){
                    averageBlockTime += analytics[a].timeDiff;
                }

                averageBlockTime = averageBlockTime / analytics.length;
            }

            AverageValidatorData.insert({
                proposerAddress: validators[i].address,
                averageBlockTime: averageBlockTime,
                type: 'ValidatorDailyAverageBlockTime',
                createdAt: now
            })
        }

        return true;
    }
})
