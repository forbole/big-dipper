import { Mongo } from 'meteor/mongo';
import { Validators } from '../validators/validators.js';
import BigNumber from 'bignumber.js';

export const Blockscon = new Mongo.Collection('blocks');

Blockscon.helpers({
    proposer(){
        const validator = Validators.findOne({address:this.proposerAddress});
        
        if(validator){
            validator.voting_power = new BigNumber(validator.voting_power);
            validator.self_delegation = new BigNumber(validator.self_delegation);
            validator.proposer_priority = new BigNumber(validator.proposer_priority);
        }

        return validator;
    }
});

// Blockscon.helpers({
//     sorted(limit) {
//         return Blockscon.find({}, {sort: {height:-1}, limit: limit});
//     }
// });


// Meteor.setInterval(function() {
//     Meteor.call('blocksUpdate', (error, result) => {
//         console.log(result);
//     })
// }, 30000000);