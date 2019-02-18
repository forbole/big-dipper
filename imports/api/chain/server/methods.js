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

            let totalVP = 0;

            if (parseInt(chain.latestBlockHeight) > 0){
                url = LCD+'/staking/validators';
                response = HTTP.get(url);
                let validatorSet = JSON.parse(response.content);
                chain.totalValidators = validatorSet.length;
    
                for (v in validatorSet){
                    let vp = Math.round(parseFloat(eval(validatorSet[v].tokens)));
                    totalVP += parseInt(vp);
                }    
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
    },
    'chain.genesis': function(){
        let chain = Chain.findOne({chainId: Meteor.settings.public.chainId});
        
        if (chain && chain.readGenesis){
            console.log('Genesis file has been processed');
        }
        else{
            console.log('=== Start processing genesis file ===');
            let response = HTTP.get(Meteor.settings.genesisFile);
            let genesis = JSON.parse(response.content);
            let chainParams = {
                chainId: genesis.chain_id,
                genesisTime: genesis.genesis_time,
                consensusParams: genesis.consensus_params,
                auth: genesis.app_state.auth,
                bank: genesis.app_state.bank,
                staking: {
                    pool: genesis.app_state.staking.pool,
                    params: genesis.app_state.staking.params
                },
                mint: genesis.app_state.mint,
                distr: {
                    communityTax: genesis.app_state.distr.community_tax,
                    baseProposerReward: genesis.app_state.distr.base_proposer_reward,
                    bonusProposerReward: genesis.app_state.distr.bonus_proposer_reward,
                    withdrawAddrEnabled: genesis.app_state.distr.withdraw_addr_enabled
                },
                gov: {
                    startingProposalId: genesis.app_state.gov.starting_proposal_id,
                    depositParams: genesis.app_state.gov.deposit_params,
                    votingParams: genesis.app_state.gov.voting_params,
                    tallyParams: genesis.app_state.gov.tally_params
                },
                slashing:{
                    params: genesis.app_state.slashing.params
                }
            }

            // console.log(chainParams);
            // console.log(genesis);


            
            if (genesis.app_state.gentxs && (genesis.app_state.gentxs.length > 0)){
                for (i in genesis.app_state.gentxs){
                    let msg = genesis.app_state.gentxs[i].value.msg;
                    // console.log(msg.type);
                    for (m in msg){
                        if (msg[m].type == "cosmos-sdk/MsgCreateValidator"){
                            console.log(msg[m].value);
                            let command = Meteor.settings.bin.gaiadebug+" pubkey "+msg[m].value.pubkey;
                            let validator = {
                                consensus_pubkey: msg[m].value.pubkey,
                                description: msg[m].value.description,
                                commission: msg[m].value.commission,
                                min_self_delegation: msg[m].value.min_self_delegation,
                                operator_address: msg[m].value.validator_address,
                                delegator_address: msg[m].value.delegator_address,
                                voting_power: Math.floor(parseInt(msg[m].value.value.amount) / 1000000)
                            }

                            Validators.upsert({consensus_pubkey:msg[m].value.pubkey},validator);
                            // Meteor.call('runCode', command, function(error, result){
                            //     validator.address = result.match(/\s[0-9A-F]{40}$/igm);
                            //     validator.address = validator.address[0].trim();
                            //     validator.hex = result.match(/\s[0-9A-F]{64}$/igm);
                            //     validator.hex = validator.hex[0].trim();
                            //     validator.cosmosaccpub = result.match(/cosmospub.*$/igm);
                            //     validator.cosmosaccpub = validator.cosmosaccpub[0].trim();
                            //     validator.operator_pubkey = result.match(/cosmosvaloperpub.*$/igm);
                            //     validator.operator_pubkey = validator.operator_pubkey[0].trim();
                            //     // validator.consensus_pubkey = result.match(/cosmosvalconspub.*$/igm);
                            //     // validator.consensus_pubkey = validator.consensus_pubkey[0].trim();

                            //     Validators.upsert({consensus_pubkey:msg[m].value.pubkey},validator);
                            // });
                        }
                    }
                }
            }

            chainParams.readGenesis = true;
            let result = Chain.upsert({chainId:chainParams.chainId}, {$set:chainParams});

            console.log(result);

            console.log('=== Finished processing genesis file ===');

        }
        
        return true;
    }
})