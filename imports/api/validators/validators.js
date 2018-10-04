import { Mongo } from 'meteor/mongo';
import { ValidatorRecords } from '../records/records.js';

export const Validators = new Mongo.Collection('validators');

Validators.helpers({
    uptimePercent(){
        return ((this.uptime/Meteor.settings.public.uptimeWindow)*100).toFixed(2);
    }
})
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