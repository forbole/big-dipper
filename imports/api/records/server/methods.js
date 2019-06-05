import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { ValidatorRecords, Analytics, AverageData, AverageValidatorData } from '../records.js';
import { Validators } from '../../validators/validators.js';
import { ValidatorSets } from '/imports/api/validator-sets/validator-sets.js';
import { Status } from '../../status/status.js';
import { MissedBlocksStats } from '../records.js';
import { MissedBlocks } from '../records.js';
import { Blockscon } from '../../blocks/blocks.js';
import { Chain } from '../../chain/chain.js';
import _ from 'lodash';
const BULKUPDATEMAXSIZE = 1000;

const getVoterStats = (validators, startHeight, latestHeight) => {
    let voterAddresses = new Set();
    let blockHeights = new Set();
    let voterStats = {};

    validators.forEach((validator) => {
        let voterAddress = validator.address;
        let missedRecords = ValidatorRecords.find({
            address:voterAddress,
            exists:false,
            $and: [ { height: { $gt: startHeight } }, { height: { $lte: latestHeight } } ]
        }).fetch();

        if (missedRecords.length > 0) {
            voterAddresses.add(voterAddress);
            voterStats[voterAddress] = new Set();
        }

        missedRecords.forEach((record) => {
            blockHeights.add(record.height);
            voterStats[voterAddress].add(record.height);
        });
    });
    return {blockHeights: Array.from(blockHeights), voterAddresses, voterStats};
}

const getBlockStats = (blockHeights) => {
    let blockStats = {};
    Blockscon.find({height: {$in: blockHeights}}).forEach((block) => {
        blockStats[block.height] = {
            height: block.height,
            proposerAddress: block.proposerAddress,
            precommitsCount: block.precommitsCount,
            validatorsCount: block.validatorsCount,
            validators: block.validators,
            time: block.time
        }
    });

    Analytics.find({height: {$in: blockHeights}}).forEach((block) => {
        if (!blockStats[block.height]) {
            blockStats[block.height] = { height: block.height };
            console.log(`block ${block.height} does not have an entry`);
        }
        _.assign(blockStats[block.height], {
            precommits: block.precommits,
            averageBlockTime: block.averageBlockTime,
            timeDiff: block.timeDiff,
            voting_power: block.voting_power
        });
    });
    return blockStats;
}

const getPreviousRecord = (voterAddress, proposerAddress, defaultStartAt) => {
    let previousRecord = MissedBlocks.findOne(
        {voter:voterAddress, proposer:proposerAddress},
        {sort:{updatedAt: -1}});
    let lastUpdatedHeight = Meteor.settings.params.startHeight;
    let prevStats = {};
    if (previousRecord) {
        prevStats = _.pick(previousRecord, ['missCount', 'totalCount', 'startedAt']);
        lastUpdatedHeight = previousRecord.updatedAt;
    } else {
        prevStats = {
            missCount: 0,
            totalCount: 0,
            startedAt: defaultStartAt
        }
    }
    return {prevStats, lastUpdatedHeight};
}

const initProposerVoterStats = (voterStats, blockStats) => {
    let proposerVoterStats = {};
    _.forEach(voterStats, (blocks, voterAddress) => {
        blocks.forEach((blockHeight) => {
            _.set(proposerVoterStats, [blockStats[blockHeight].proposerAddress, voterAddress], {});
        });
    });
    return proposerVoterStats;
}

const updateVoterStatsCounts = (proposerVoterStats, latestHeight) => {
    // a proposer-voter map counting numbers of proposed blocks of which voter is an active validator
    let lastUpdatedMap = {};

    let minLastUpdatedHeight = latestHeight;
    _.forEach(proposerVoterStats, (voterMap, proposerAddress) => {
        _.forEach(voterMap, (stats, voterAddress) => {
            let {prevStats, lastUpdatedHeight} = getPreviousRecord(
                voterAddress, proposerAddress, undefined);
            _.assign(stats, prevStats);
            _.set(lastUpdatedMap, [proposerAddress, voterAddress], lastUpdatedHeight);
            minLastUpdatedHeight = Math.min(minLastUpdatedHeight, lastUpdatedHeight);
        });
    });
    Blockscon.find({
        $and: [ { height: { $gt: minLastUpdatedHeight } }, { height: { $lte: latestHeight } } ]
    }).forEach((block) => {
        let proposerAddress = block.proposerAddress;
        let votedValidators = new Set(block.validators);
        let validatorSets = ValidatorSets.findOne({block_height:block.height});
        validatorSets.validators.forEach((activeValidator) => {
            let currentValidator = activeValidator.address
            if (!_.has(proposerVoterStats, [proposerAddress, currentValidator])) {
                let {prevStats, lastUpdatedHeight} = getPreviousRecord(
                    currentValidator, proposerAddress, minLastUpdatedHeight);
                _.set(proposerVoterStats, [proposerAddress, currentValidator], {
                    block: -1, ...prevStats});
                _.set(lastUpdatedMap, [proposerAddress, currentValidator], lastUpdatedHeight);
            } else if (!_.get(proposerVoterStats, [proposerAddress, currentValidator, 'startedAt'])) {
                _.set(proposerVoterStats, [proposerAddress, currentValidator, 'startedAt'], minLastUpdatedHeight);
            }

            if (block.height > _.get(lastUpdatedMap, [proposerAddress, currentValidator], -1)) {
                _.update(proposerVoterStats, [proposerAddress, currentValidator, 'totalCount'], (n) => n+1);
                if (!votedValidators.has(currentValidator)) {
                    _.update(proposerVoterStats, [proposerAddress, currentValidator, 'missCount'], (n) => n+1);
                }
            }
        })
    });
}

Meteor.methods({
    'ValidatorRecords.calculateMissedBlocks': function(){
        if (!COUNTMISSEDBLOCKS){
            try {
                let startTime = Date.now();
                COUNTMISSEDBLOCKS = true;
                console.log('calulate missed blocks count');
                this.unblock();
                let validators = Validators.find({}).fetch();
                let latestHeight = Meteor.call('blocks.getCurrentHeight');
                let explorerStatus = Status.findOne({chainId: Meteor.settings.public.chainId});
                let startHeight = (explorerStatus&&explorerStatus.lastProcessedMissedBlockHeight)?explorerStatus.lastProcessedMissedBlockHeight:Meteor.settings.params.startHeight;
                latestHeight = Math.min(startHeight + BULKUPDATEMAXSIZE, latestHeight);
                const bulkMissedStats = MissedBlocks.rawCollection().initializeUnorderedBulkOp();

                let validatorsMap = {};
                validators.forEach((validator) => validatorsMap[validator.address] = validator);

                // blockHeights is a set of block heights that have been missed by some validators in the current interval
                // voterStats is a map of block heights that a voterAddress missed

                let {voterAddresses, blockHeights, voterStats} = getVoterStats(validators, startHeight, latestHeight);


                // a map of block height to block stats
                let blockStats = getBlockStats(blockHeights);

                // proposerVoterStats is a proposer-voter map counting numbers of proposed blocks of which voter is an active validator
                let proposerVoterStats = initProposerVoterStats(voterStats, blockStats);

                // updateVoterStatsByBlocks(voterStats, blockStats, proposerVoterStats, latestHeight);
                updateVoterStatsCounts(proposerVoterStats, latestHeight);

                _.forEach(voterStats, (blocks, voterAddress) => {
                    blocks.forEach((blockHeight) => {
                        let curBlockStat = blockStats[blockHeight];
                        let proposerAddress = curBlockStat.proposerAddress;
                        let curProposerVoterStats = proposerVoterStats[proposerAddress][voterAddress];
                        bulkMissedStats.insert({
                            voter: voterAddress,
                            blockHeight: blockHeight,
                            proposer: proposerAddress,
                            precommitsCount: curBlockStat.precommitsCount,
                            validatorsCount: curBlockStat.validatorsCount,
                            time: curBlockStat.time,
                            precommits: curBlockStat.precommits,
                            averageBlockTime: curBlockStat.averageBlockTime,
                            timeDiff: curBlockStat.timeDiff,
                            votingPower: curBlockStat.voting_power,
                            updatedAt: latestHeight,
                            startedAt: curProposerVoterStats.startedAt,
                            missCount: curProposerVoterStats.missCount,
                            totalCount: curProposerVoterStats.totalCount
                        });
                    });
                });

                _.forEach(proposerVoterStats, (voterMap, proposerAddress) => {
                    _.forEach(voterMap, (stats, voterAddress) => {
                        if (stats.block === -1) {
                            bulkMissedStats.find({
                                voter: voterAddress,
                                proposer: proposerAddress,
                                blockHeight: -1
                            }).upsert().updateOne({$set: {
                                voter: voterAddress,
                                proposer: proposerAddress,
                                blockHeight: -1,
                                updatedAt: latestHeight,
                                startedAt: stats.startedAt,
                                missCount: stats.missCount,
                                totalCount: stats.totalCount
                            }});
                        }
                    });
                });

                let message = '';
                if (bulkMissedStats.length > 0){
                    const client = MissedBlocks._driver.mongo.client;
                    let session = client.startSession();
                    session.startTransaction();
                    let bulkPromise = bulkMissedStats.execute(null, {session}).then(
                        Meteor.bindEnvironment((result, err) => {
                            if (err){
                                COUNTMISSEDBLOCKS = false;
                                Promise.await(session.abortTransaction());
                                throw err;
                            }
                            if (result){
                                Promise.await(session.commitTransaction());
                                message = `(${result.result.nInserted} inserted, ` +
                                           `${result.result.nUpserted} upserted, ` +
                                           `${result.result.nModified} modified)`;
                            }
                        }));

                    Promise.await(bulkPromise);
                }

                COUNTMISSEDBLOCKS = false;
                Status.upsert({chainId: Meteor.settings.public.chainId}, {$set:{lastProcessedMissedBlockHeight:latestHeight, lastProcessedMissedBlockTime: new Date()}});
                return `done in ${Date.now() - startTime}ms ${message}`;
            } catch (e) {
                COUNTMISSEDBLOCKS = false;
                throw e;
            }
        }
        else{
            return "updating...";
        }
    },
    'ValidatorRecords.calculateMissedBlocksStats': function(){
        // TODO: deplicate this method and MissedBlocksStats collection
        // console.log("ValidatorRecords.calculateMissedBlocks: "+COUNTMISSEDBLOCKS);
        if (!COUNTMISSEDBLOCKSSTATS){
            COUNTMISSEDBLOCKSSTATS = true;
            console.log('calulate missed blocks stats');
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
                        COUNTMISSEDBLOCKSSTATS = false;
                        console.log(err);
                    }
                    if (result){
                        Status.upsert({chainId: Meteor.settings.public.chainId}, {$set:{lastMissedBlockHeight:latestHeight, lastMissedBlockTime: new Date()}});
                        COUNTMISSEDBLOCKSSTATS = false;
                        console.log("done");
                    }
                }));
            }
            else{
                COUNTMISSEDBLOCKSSTATS = false;
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

            if (blocks.length > 0){
                let blockHeights = [];
                for (b in blocks){
                    blockHeights.push(blocks[b].height);
                }

                let analytics = Analytics.find({height: {$in:blockHeights}}, {fields:{height:1,timeDiff:1}}).fetch();


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
