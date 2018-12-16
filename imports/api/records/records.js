import { Mongo } from 'meteor/mongo';
import { Validators } from '../validators/validators';

export const ValidatorRecords = new Mongo.Collection('validator_records');
export const Analytics = new Mongo.Collection('analytics');
export const MissedBlocksStats = new Mongo.Collection('missed_blocks_stats');

MissedBlocksStats.helpers({
    proposerMoniker(){
        let validator = Validators.findOne({address:this.proposer});
        return validator.description.moniker;
    }
})
