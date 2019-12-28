import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import { Chain, ChainStates } from '../chain.js';
import Coin from '../../../../both/utils/coins.js';

findVotingPower = (validator, genValidators) => {
    for (let v in genValidators){
        if (validator.pub_key.value == genValidators[v].pub_key.value){
            return parseInt(genValidators[v].power);
        }
    }
}

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
            console.log(url);
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

            let latestState = ChainStates.findOne({}, {sort: {height: -1}})
            if (latestState && latestState.height >= chain.latestBlockHeight) {
                return `no updates (getting block ${chain.latestBlockHeight} at block ${latestState.height})`
            }

            // Since Tendermint v0.33, validator page default set to return 30 validators.
            // Query latest height with page 1 and 100 validators per page.
            url = RPC+`/validators?height=${chain.latestBlockHeight}&page=1&per_page=100`;
            response = HTTP.get(url);
            let validators = JSON.parse(response.content);
            validators = validators.result.validators;
            chain.validators = validators.length;
            let activeVP = 0;
            for (v in validators){
                activeVP += parseInt(validators[v].voting_power);
            }
            chain.activeVotingPower = activeVP;


            Chain.update({chainId:chain.chainId}, {$set:chain}, {upsert: true});
            // Get chain states
            if (parseInt(chain.latestBlockHeight) > 0){
                let chainStates = {};
                chainStates.height = parseInt(status.sync_info.latest_block_height);
                chainStates.time = new Date(status.sync_info.latest_block_time);

                url = LCD + '/staking/pool';
                try{
                    response = HTTP.get(url);
                    let bonding = JSON.parse(response.content).result;
                    // chain.bondedTokens = bonding.bonded_tokens;
                    // chain.notBondedTokens = bonding.not_bonded_tokens;
                    chainStates.bondedTokens = parseInt(bonding.bonded_tokens);
                    chainStates.notBondedTokens = parseInt(bonding.not_bonded_tokens);
                }
                catch(e){
                    console.log(url);
                    console.log(e);
                }

                if ( Coin.StakingCoin.denom ) {
                    if (Meteor.settings.public.modules.supply){
                        url = LCD + '/supply/total/'+ Coin.StakingCoin.denom;
                        try{
                            response = HTTP.get(url);
                            let supply = JSON.parse(response.content).result;
                            chainStates.totalSupply = parseInt(supply);
                        }
                        catch(e){
                            console.log(url);
                            console.log(e);
                        }
                    }

                    if (Meteor.settings.public.modules.distribution){
                        url = LCD + '/distribution/community_pool';
                        try {
                            response = HTTP.get(url);
                            let pool = JSON.parse(response.content).result;
                            if (pool && pool.length > 0){
                                chainStates.communityPool = [];
                                pool.forEach((amount) => {
                                    chainStates.communityPool.push({
                                        denom: amount.denom,
                                        amount: parseFloat(amount.amount)
                                    })
                                })
                            }
                        }
                        catch (e){
                            console.log(url);
                            console.log(e.response.content)
                        }
                    }

                    ChainStates.insert(chainStates);
                }

                return chain.latestBlockHeight;
            }
        }
        catch (e){
            console.log(url);
            console.log(e);
            return "Error getting chain status.";
        }
    },
    'chain.getLatestStatus': function(){
        this.unblock();
        Chain.find().sort({created:-1}).limit(1);
    },
})
