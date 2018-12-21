import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import { Chain } from '../chain.js';
import { Validators } from '../../validators/validators.js';

Meteor.methods({
    'chain.getConsensusState': function(){
        this.unblock();
        let url = RPC+'/dump_consensus_state';
        try{
            let response = HTTP.get(url);
            let consensus = JSON.parse(response.content);
            consensus = consensus.result;
            let height = consensus.round_state.height;
            let round = consensus.round_state.round;
            let step = consensus.round_state.step;
            let votedPower = Math.round(parseFloat(consensus.round_state.votes[round].prevotes_bit_array.split(" ")[3])*100);

            Chain.update({chainId:Meteor.settings.public.chainId}, {$set:{
                votingHeight: height, 
                votingRound: round, 
                votingStep: step, 
                votedPower: votedPower,
                proposerAddress: consensus.round_state.validators.proposer.address,
                prevotes: consensus.round_state.votes[round].prevotes,
                precommits: consensus.round_state.votes[round].precommits
            }});
        }
        catch(e){
            console.log(e);
        }
    },
    'chain.updateStatus': function(){
        this.unblock();
        let url = RPC+'/status';
        try{
            let response = HTTP.get(url);
            let status = JSON.parse(response.content);
            status = status.result;
            let chain = {};
            chain.chainId = status.node_info.network;
            chain.latestBlockHeight = status.sync_info.latest_block_height;
            chain.latestBlockTime = status.sync_info.latest_block_time;

            url = RPC+'/validators';
            response = HTTP.get(url);
            let validators = JSON.parse(response.content);
            validators = validators.result.validators;
            chain.validators = validators.length;
            let activeVP = 0;
            for (v in validators){
                activeVP += parseInt(validators[v].voting_power);
            }
            chain.activeVotingPower = activeVP;
            
            url = LCD+'/stake/validators';
            response = HTTP.get(url);
            let validatorSet = JSON.parse(response.content);
            chain.totalValidators = validatorSet.length;

            let totalVP = 0;
            for (v in validatorSet){
                let vp = Math.round(parseFloat(eval(validatorSet[v].tokens)));
                totalVP += parseInt(vp);
            }

            chain.totalVotingPower = totalVP;

            Chain.update({chainId:chain.chainId}, {$set:chain}, {upsert: true});

            // validators = Validators.find({}).fetch();
            // console.log(validators);
            return chain.latestBlockHeight;
        }
        catch (e){
            console.log(e);
            return "Error getting chain status.";
        }
    },
    'chain.getLatestStatus': function(){
        Chain.find().sort({created:-1}).limit(1);
    }
})