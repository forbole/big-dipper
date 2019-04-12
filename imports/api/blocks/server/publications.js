import { Meteor } from 'meteor/meteor';
import { Blockscon } from '../blocks.js';
import { Validators } from '../../validators/validators.js';
import { Transactions } from '../../transactions/transactions.js';

// Meteor.publish('blocks.height', function (limit) {
//     return Blockscon.find({}, {limit: limit, sort: {height: -1}});
// });

publishComposite('blocks.height', function(limit){
    return {
        find(){
            return Blockscon.find({}, {limit: limit, sort: {height: -1}})
        },
        children: [
            {
                find(block){
                    return Validators.find(
                        {address:block.proposerAddress},
                        {limit:1}
                    )
                }
            }
        ]
    }
});

publishComposite('blocks.findOne', function(height){
    return {
        find(){
            return Blockscon.find({height:height})
        },
        children: [
            {
                find(block){
                    return Transactions.find(
                        {height:block.height}
                    )
                }
            }
        ]
    }
});

// Meteor.publish('blocks.hash', function () {
//     return Blockscon.find();
// })

// Meteor.publish('blocks.dataall', function () {
//     return Blockscon.find();
// })

// Meteor.publish('blocks.datalimit', function (limit) {
//     return Blockscon.find({},{sorted: {height: -1}, limit: limit});
// })