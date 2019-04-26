import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import { Chain } from '../chain.js';
import { Validators } from '../../validators/validators.js';
import { VotingPowerHistory } from '../../voting-power/history.js';

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

            // let totalVP = 0;
            if (parseInt(chain.latestBlockHeight) > 0){
                url = LCD + '/staking/pool';
                try{
                    response = HTTP.get(url);
                    let bonding = JSON.parse(response.content);
                    chain.bondedTokens = bonding.bonded_tokens;
                    chain.notBondedTokens = bonding.not_bonded_tokens;
                }
                catch(e){
                    console.log(e);
                }
                // chain.totalValidators = Validators.find({}).count();
                // Validators.find({}).forEach((v) =>  {
                //     url = `${LCD}/staking/validators/${v.operator_address}`;
                //     try{
                //         response = HTTP.get(url);
                //         validator = JSON.parse(response.content);
                //         let vp = Math.round(parseFloat(eval(validator.tokens)));
                //         totalVP += parseInt(vp);
                //     }
                //     catch (e){
                //         console.log("Can't find validator: "+v.address)
                //     }
                // });
            }

            // chain.totalVotingPower = totalVP;

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

            let totalVotingPower = 0;

            // read gentx
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
                                voting_power: Math.ceil(parseInt(msg[m].value.value.amount) / 1000000),
                                jailed: false,
                                status: 2
                            }

                            totalVotingPower += validator.voting_power;

                            // Validators.upsert({consensus_pubkey:msg[m].value.pubkey},validator);
                            Meteor.call('runCode', command, function(error, result){
                                validator.address = result.match(/\s[0-9A-F]{40}$/igm);
                                validator.address = validator.address[0].trim();
                                validator.hex = result.match(/\s[0-9A-F]{64}$/igm);
                                validator.hex = validator.hex[0].trim();
                                validator.pub_key = result.match(/{".*"}/igm);
                                validator.pub_key = JSON.parse(validator.pub_key[0].trim());
                                let re = new RegExp(Meteor.settings.public.bech32PrefixAccPub+".*$","igm");
                                validator.cosmosaccpub = result.match(re);
                                validator.cosmosaccpub = validator.cosmosaccpub[0].trim();
                                re = new RegExp(Meteor.settings.public.bech32PrefixValPub+".*$","igm");
                                validator.operator_pubkey = result.match(re);
                                validator.operator_pubkey = validator.operator_pubkey[0].trim();
        
                                Validators.upsert({consensus_pubkey:msg[m].value.pubkey},validator);

                                VotingPowerHistory.insert({
                                    address: validator.address,
                                    prev_voting_power: 0,
                                    voting_power: validator.voting_power,
                                    type: 'add',
                                    height: 0,
                                    block_time: genesis.genesis_time
                                });
                            })
                        }
                    }
                }

                
            }

            // read validators from previous chain
            if (genesis.app_state.staking.validators && genesis.app_state.staking.validators.length > 0){
                console.log(genesis.app_state.staking.validators.length);
                let genValidatorsSet = genesis.app_state.staking.validators;
                let genValidators = genesis.validators;
                for (let v in genValidatorsSet){
                    // console.log(genValidators[v]);
                    let validator = genValidatorsSet[v];
                    validator.delegator_address = Meteor.call('getDelegator', genValidatorsSet[v].operator_address);
                    let command = Meteor.settings.bin.gaiadebug+" pubkey "+validator.consensus_pubkey;
                    Meteor.call('runCode', command, (err, result) => {
                        if (err){
                            console.log(err);
                        }
                        if (result){
                            validator.address = result.match(/\s[0-9A-F]{40}$/igm);
                            validator.address = validator.address[0].trim();
                            validator.hex = result.match(/\s[0-9A-F]{64}$/igm);
                            validator.hex = validator.hex[0].trim();
                            validator.pub_key = result.match(/{".*"}/igm);
                            validator.pub_key = JSON.parse(validator.pub_key[0].trim());
                            let re = new RegExp(Meteor.settings.public.bech32PrefixAccPub+".*$","igm");
                            validator.cosmosaccpub = result.match(re);
                            validator.cosmosaccpub = validator.cosmosaccpub[0].trim();
                            re = new RegExp(Meteor.settings.public.bech32PrefixValPub+".*$","igm");
                            validator.operator_pubkey = result.match(re);
                            validator.operator_pubkey = validator.operator_pubkey[0].trim();

                            validator.voting_power = findVotingPower(validator, genValidators);
                            totalVotingPower += validator.voting_power;

                            Validators.upsert({consensus_pubkey:validator.consensus_pubkey},validator);
                            VotingPowerHistory.insert({
                                address: validator.address,
                                prev_voting_power: 0,
                                voting_power: validator.voting_power,
                                type: 'add',
                                height: 0,
                                block_time: genesis.genesis_time
                            });
                        }
                    });
                }
                // Meteor.call('getDelegator', "cosmosvaloper10505nl7yftsme9jk2glhjhta7w0475uvl4k8ju")
            }
                
            chainParams.readGenesis = true;
            chainParams.activeVotingPower = totalVotingPower;
            let result = Chain.upsert({chainId:chainParams.chainId}, {$set:chainParams});

            // console.log(result);

            console.log('=== Finished processing genesis file ===');

        }
        
        return true;
    }
})