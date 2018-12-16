import { Meteor } from 'meteor/meteor';
import { ValidatorRecords, Analytics, MissedBlocksStats } from '../records.js';
import { Validators } from '../../validators/validators.js';

Meteor.publish('validator_records.all', function () {
    return ValidatorRecords.find();
});

Meteor.publish('validator_records.uptime', function(address, num){
    return ValidatorRecords.find({address:address},{limit:num, sort:{height:-1}});
});

Meteor.publish('analytics.history', function(){
    return Analytics.find({},{sort:{height:-1},limit:50});
});

publishComposite('missedblocks.validator', function(address){
    return {
        find(){
            return MissedBlocksStats.find({voter:address})
        },
        children: [
            {
                find(stats){
                    return Validators.find(
                        {address:stats.proposer},
                        {fields:{address:1, description:1}, limit:1}
                    )
                }
            }
        ]
    }
});
