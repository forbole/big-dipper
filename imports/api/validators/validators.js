import { Mongo } from 'meteor/mongo';
import { ValidatorRecords } from '../records/records.js';
import { VotingPowerHistory } from '../voting-power/history.js';
import numbro from 'numbro';
import BigNumber from 'bignumber.js';

export const Validators = new Mongo.Collection('validators');

Validators.helpers({
    firstSeen(){
        const validator = ValidatorRecords.findOne({address:this.address});
        validator.voting_power = new BigNumber(validator.voting_power);
        validator.self_delegation = new BigNumber(validator.self_delegation);
        return validator;
    },
    history(){
        const votinghistory = VotingPowerHistory.find({address:this.address}, {sort:{height:-1}, limit:50}).fetch();
        votinghistory.forEach(vh => {
            vh.self_delegation = new BigNumber(vh.self_delegation);
            vh.voting_power = new BigNumber(vh.voting_power);
            vh.prev_voting_power = new BigNumber(vh.prev_voting_power);
        });
        return votinghistory
    }
})

const superValidatorFind = Validators.find.bind(Validators);

Validators.find = (selector, options) => {
    const cursor = superValidatorFind(selector, options);

    const superCursorFetch = cursor.fetch.bind(cursor);
    cursor.fetch = () => {
        const data = superCursorFetch();
        return data.map(v => {
            v.tokens = (new BigNumber(v.voting_power)).multipliedBy(Meteor.settings.public.onChainPowerReduction);
            v.voting_power = (new BigNumber(v.voting_power)).dividedBy(Meteor.settings.public.powerReduction).multipliedBy(Meteor.settings.public.onChainPowerReduction);
            v.self_delegation = new BigNumber(v.self_delegation);
            v.proposer_priority = new BigNumber(v.proposer_priority);
            return v;
        });
    }
    return cursor;
}

const superValidatorFindOne = Validators.findOne.bind(Validators);

Validators.findOne = (selector, options) => {
    const validator = superValidatorFindOne(selector, options);
    
    if(validator){
        validator.tokens = new BigNumber(validator.tokens)
        validator.delegator_shares = new BigNumber(validator.delegator_shares);
        validator.voting_power = (new BigNumber(validator.voting_power)).dividedBy(Meteor.settings.public.powerReduction).multipliedBy(Meteor.settings.public.onChainPowerReduction);
        validator.self_delegation = new BigNumber(validator.self_delegation);
        validator.proposer_priority = new BigNumber(validator.proposer_priority);
    }

    return validator;
}

// Validators.helpers({
//     uptime(){
//         // console.log(this.address);
//         let lastHundred = ValidatorRecords.find({address:this.address}, {sort:{height:-1}, limit:100}).fetch();
//         console.log(lastHundred);
//         let uptime = 0;
//         for (i in lastHundred){
//             if (lastHundred[i].exists){
//                 uptime+=1;
//             }
//         }
//         return uptime;
//     }
// })