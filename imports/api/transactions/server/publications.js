import { Meteor } from 'meteor/meteor';
import { Transactions } from '../transactions.js';
import { Validators } from '../../validators/validators.js';


publishComposite('transactions.list', function(limit = 30){
    console.log('transactions.list');
    console.log(limit);
    return {
        find(){
            return Transactions.find({},{sort:{height:-1}, limit:limit})
        },
        // children: [
        //     {
        //         find(tx){
        //             return Validators.find(
        //                 {},
        //                 {fields:{address:1, description:1}}
        //             )
        //         }
        //     }
        // ]
    }
});