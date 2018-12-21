import { Meteor } from 'meteor/meteor';
import { Chain } from '../chain.js';
import { Validators } from '../../validators/validators.js';

// Meteor.publish('chain.status', function () {
//     return Chain.find({chainId:Meteor.settings.public.chainId});
// });

publishComposite('chain.status', function(){
    return {
        find(){
            return Chain.find({chainId:Meteor.settings.public.chainId});
        },
        children: [
            {
                find(chain){
                    return Validators.find(
                        {},
                        {fields:{address:1, description:1}}
                    )
                }
            }
        ]
    }
});