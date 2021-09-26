import { Mongo } from 'meteor/mongo';
import { Validators } from '../validators/validators.js';
import BigNumber from 'bignumber.js';

export const Chain = new Mongo.Collection('chain');
export const ChainStates = new Mongo.Collection('chain_states')

Chain.helpers({
    proposer(){
        const validator = Validators.findOne({address:this.proposerAddress});
        if(validator){
            validator.voting_power = new BigNumber(validator.voting_power);
            validator.self_delegation = new BigNumber(validator.self_delegation);
            validator.proposer_priority = new BigNumber(validator.proposer_priority);
        }
        return validator;
    }
})

const superChainFindOne = Chain.findOne.bind(Chain);

Chain.findOne = (selector, options) => {
    const chain = superChainFindOne(selector, options);
    if(chain){
        chain.activeVotingPower = (new BigNumber(chain.activeVotingPower)).dividedBy(Meteor.settings.public.powerReduction).multipliedBy(Meteor.settings.public.onChainPowerReduction);
    }
    return chain;
}