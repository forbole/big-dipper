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
    }
})
