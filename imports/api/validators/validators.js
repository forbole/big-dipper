import { Mongo } from 'meteor/mongo';
import { ValidatorRecords } from '../records/records.js';
import { VotingPowerHistory } from '../voting-power/history.js';
import numbro from 'numbro';

export const Validators = new Mongo.Collection('validators');

Validators.helpers({
    firstSeen(){
        return ValidatorRecords.findOne({address:this.address});
    },
    history(){
        return VotingPowerHistory.find({address:this.address}, {sort:{height:-1}, limit:50}).fetch();
    }
})

const superValidatorFind = Validators.find.bind(Validators);

Validators.find = (selector, options) => {
    const cursor = superValidatorFind(selector, options);

    const superCursorFetch = cursor.fetch.bind(cursor);
    cursor.fetch = () => {
        const data = superCursorFetch();
        return data.map(v => {
            v.tokens = v.voting_power * Meteor.settings.public.onChainPowerReduction;
            v.voting_power /= Meteor.settings.public.powerReduction / Meteor.settings.public.onChainPowerReduction;
            return v;
        });
    }
    return cursor;
}

const superValidatorFindOne = Validators.findOne.bind(Validators);

Validators.findOne = (selector, options) => {
    const validator = superValidatorFindOne(selector, options);
    
    if(validator){
        validator.tokens = validator.voting_power * Meteor.settings.public.onChainPowerReduction;
        validator.voting_power /= Meteor.settings.public.powerReduction / Meteor.settings.public.onChainPowerReduction;
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