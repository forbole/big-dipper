import { Meteor } from 'meteor/meteor';
import { ValidatorRecords } from '../records.js';
import { Validators } from '../../validators/validators.js';
import { Status } from '../../status/status.js';
import { MissedBlocksStats } from '../records.js';
import { Blockscon } from '../../blocks/blocks.js';

Meteor.methods({
    'ValidatorRecords.missedBlocksCount': function(address){
        this.unblock();
        return ValidatorRecords.find({address:address}).count();
    },
    'ValidatorRecords.calculateMissedBlocks': function(){
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
            let missedRecords = ValidatorRecords.find({
                address:validators[i].address, 
                exists:false, 
                $and: [ { height: { $gte: startHeight } }, { height: { $lte: latestHeight } } ] 
            }).fetch();

            let counts = {};

            for (b in missedRecords){
                let block = Blockscon.findOne({height:missedRecords[b].height});
                let existingRecord = MissedBlocksStats.findOne({voter:validators[i].address, proposer:block.proposerAddress});
                // let data = {
                //     voter: validators[i].address,
                //     proposer: block.proposerAddress,
                //     count: 0
                // }

                if (typeof counts[block.proposerAddress] === 'undefined'){
                    counts[block.proposerAddress] = 1;
                }
                else{
                    counts[block.proposerAddress]++;
                }

                // if (existingRecord){
                //     data.count = existingRecord.count+1;
                // }

                // 
            }

            for (address in counts){
                let data = {
                    voter: validators[i].address,
                    proposer:address,
                    count: counts[address]
                }

                if (validators[i].address == '87F23E3EB6E96C35B0D680D126A15321CB028BD7'){
                    console.log(data);
                }
                bulkMissedStats.find({voter:validators[i].address, proposer:address}).upsert().updateOne({$set:data});
            }
        }

        if (bulkMissedStats.length > 0){
            bulkMissedStats.execute((err, result) => {
                if (err){
                    console.log(err);
                }
                if (result){
                    console.log("done");
                }
            });
        }

        Status.upsert({chainId: Meteor.settings.public.chainId}, {$set:{lastMissedBlockHeight:latestHeight, lastMissedBlockTime: new Date()}});

        return true;
    }
})
