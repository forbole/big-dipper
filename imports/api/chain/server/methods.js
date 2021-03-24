import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import { Chain, ChainStates } from '../chain.js';
import Coin from '../../../../both/utils/coins.js';

findVotingPower = (validator, genValidators) => {
    for (let v in genValidators) {
        if (validator.pub_key.value == genValidators[v].pub_key.value) {
            return parseInt(genValidators[v].power);
        }
    }
}

Meteor.methods({
    'chain.getConsensusState': function () {
        this.unblock();
        let url = RPC + '/dump_consensus_state';
        try {
            let response = HTTP.get(url);
            let consensus = JSON.parse(response.content);
            consensus = consensus.result;
            let height = consensus.round_state.height;
            let round = consensus.round_state.round;
            let step = consensus.round_state.step;
            let votedPower = Math.round(parseFloat(consensus.round_state.votes[round].prevotes_bit_array.split(" ")[3]) * 100);

            Chain.update({ chainId: Meteor.settings.public.chainId }, {
                $set: {
                    votingHeight: height,
                    votingRound: round,
                    votingStep: step,
                    votedPower: votedPower,
                    proposerAddress: consensus.round_state.validators.proposer.address,
                    prevotes: consensus.round_state.votes[round].prevotes,
                    precommits: consensus.round_state.votes[round].precommits
                }
            });
        }
        catch (e) {
            console.log(url);
            console.log(e);
        }
    },
    'chain.updateStatus': async function () {
        this.unblock();
        let url = "";
        try {
            url = API + '/blocks/latest';
            let response = HTTP.get(url);
            let latestBlock = JSON.parse(response.content);

            let chain = { chainId: '', latestBlockHeight: 0, latestBlockTime: 0, validators: 0, activeVotingPower: 0, staking: {}, distribution: {}, mint: {}, gov: { tallyParams: {}, depositParams: {}, votingParams: {} } };
            chain.chainId = latestBlock.block.header.chain_id;
            chain.latestBlockHeight = parseInt(latestBlock.block.header.height);
            chain.latestBlockTime = latestBlock.block.header.time;
            let latestState = ChainStates.findOne({}, { sort: { height: -1 } })
            if (latestState && latestState.height >= chain.latestBlockHeight) {
                return `no updates (getting block ${chain.latestBlockHeight} at block ${latestState.height})`
            }

            // Since Tendermint v0.33, validator page default set to return 30 validators.
            // Query latest height with page 1 and 100 validators per page.

            let validators = []

            do {
                url = API + `/validatorsets/latest`;
                let response = HTTP.get(url);
                result = JSON.parse(response.content).result;
                validators = result.validators

            }
            while (validators.length < parseInt(result.total))

            chain.validators = validators.length;
            let activeVP = 0;
            for (v in validators) {
                activeVP += parseInt(validators[v].voting_power);
            }
            chain.activeVotingPower = activeVP;

            // update staking params
            try {
                url = API + 'staking/parameters';
                response = HTTP.get(url);
                chain.staking = JSON.parse(response.content);
            }
            catch (e) {
                console.log(e);
            }

            // Get chain states
            if (parseInt(chain.latestBlockHeight) > 0) {
                let chainStates = {};
                chainStates.height = parseInt(chain.latestBlockHeight);
                chainStates.time = new Date(chain.latestBlockTime);

                try {
                    url = API + '/staking/pool';
                    let response = HTTP.get(url);
                    let bonding = JSON.parse(response.content).result;
                    chainStates.bondedTokens = parseInt(bonding.bonded_tokens);
                    chainStates.notBondedTokens = parseInt(bonding.not_bonded_tokens);
                }
                catch (e) {
                    console.log(e);
                }

                if (Coin.StakingCoin.denom) {
                    if (Meteor.settings.public.modules.bank) {
                        try {
                            url = API + '/supply/total/' + Coin.StakingCoin.denom;
                            let response = HTTP.get(url);
                            let supply = JSON.parse(response.content).result;
                            chainStates.totalSupply = parseInt(supply);
                        }
                        catch (e) {
                            console.log(e);
                        }

                    }

                    if (Meteor.settings.public.modules.distribution) {
                        try {
                            url = API + '/distribution/community_pool';
                            let response = HTTP.get(url);
                            let pool = JSON.parse(response.content).pool;
                            if (pool && pool.length > 0) {
                                chainStates.communityPool = [];
                                pool.forEach((amount) => {
                                    chainStates.communityPool.push({
                                        denom: amount.denom,
                                        amount: parseFloat(amount.amount)
                                    })
                                })
                            }
                        }
                        catch (e) {
                            console.log(e)
                        }

                        // update distribution params
                        try {
                            url = API + '/distribution/parameters';
                            response = HTTP.get(url);
                            chain.distribution = JSON.parse(response.content).result;
                        }
                        catch (e) {
                            console.log(e);
                        }
                    }

                    if (Meteor.settings.public.modules.minting) {
                        try {
                            url = API + '/minting/inflation';
                            let response = HTTP.get(url);
                            let inflation = JSON.parse(response.content).result;
                            if (inflation) {
                                chainStates.inflation = parseFloat(inflation)
                            }
                        }
                        catch (e) {
                            console.log(e);
                        }

                        try {
                            url = API + '/minting/annual-provisions';
                            let response = HTTP.get(url);
                            let provisions = JSON.parse(response.content).result;
                            if (provisions) {
                                chainStates.annualProvisions = parseFloat(provisions)
                            }
                        }
                        catch (e) {
                            console.log(e);
                        }

                        // update mint params
                        try {
                            url = API + '/minting/parameters';
                            response = HTTP.get(url);
                            let mint = JSON.parse(response.content).result
                            chain.mint = mint;
                        }
                        catch (e) {
                            console.log(e);
                        }
                    }

                    if (Meteor.settings.public.modules.gov) {
                        // update gov params
                        try {
                            url = API + '/gov/parameters/tallying';
                            response = HTTP.get(url);
                            let gov = JSON.parse(response.content).result;
                            chain.gov.tallyParams = gov;
                        }
                        catch (e) {
                            console.log(e);
                        }
                        try {
                            url = API + '/gov/parameters/deposit';
                            response = HTTP.get(url);
                            let gov = JSON.parse(response.content).result;
                            chain.gov.depositParams = gov;
                        }
                        catch (e) {
                            console.log(e);
                        }
                        try {
                            url = API + '/gov/parameters/voting';
                            response = HTTP.get(url);
                            let gov = JSON.parse(response.content).result;
                            chain.gov.votingParams = gov;
                        }
                        catch (e) {
                            console.log(e);
                        }
                    }
                }

                ChainStates.insert(chainStates);
            }

            Chain.update({ chainId: chain.chainId }, { $set: chain }, { upsert: true });

            return chain.latestBlockHeight;
        }
        catch (e) {
            console.log(url);
            console.log(e);
            return "Error getting chain status.";
        }
    },
    'chain.getLatestStatus': function () {
        this.unblock();
        Chain.find().sort({ created: -1 }).limit(1);
    },
})