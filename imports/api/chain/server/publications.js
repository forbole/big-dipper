import { Meteor } from 'meteor/meteor';
import { Chain, ChainStates } from '../chain.js';
import { Validators } from '../../validators/validators.js';

Meteor.publish('chainStates.latest', function () {
    return ChainStates.find({},{sort:{height:-1},limit:1});
});

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