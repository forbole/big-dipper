/* eslint-disable no-loop-func */
/* eslint-disable no-await-in-loop */
import { Meteor } from 'meteor/meteor';
import { Chain, ChainStates } from '../chain.js';
import Coin from '../../../../both/utils/coins.js';
import fetch from 'node-fetch'


findVotingPower = (validator, genValidators) => {
    for (let v in genValidators){
        if (validator.pub_key.value == genValidators[v].pub_key.value){
            return parseInt(genValidators[v].power);
        }
    }
}

Meteor.methods({
    'chain.getConsensusState': async function(){
        this.unblock();
        let url = RPC+'/dump_consensus_state';
        try {
            await fetch(url)
                .then(function (response) {
                    if (response.ok) {
                        response.json().then((data) => {
                            let consensus = data?.result;
                            let height = consensus?.round_state?.height;
                            let round = consensus?.round_state?.round;
                            let step = consensus?.round_state?.step;
                            let votedPower = Math.round(parseFloat(consensus?.round_state?.votes[round]?.prevotes_bit_array.split(" ")[3]) * 100);

                            Chain.update({ chainId: Meteor.settings.public.chainId }, {
                                $set: {
                                    votingHeight: height,
                                    votingRound: round,
                                    votingStep: step,
                                    votedPower: votedPower,
                                    proposerAddress: consensus?.round_state?.validators?.proposer?.address,
                                    prevotes: consensus?.round_state?.votes[round]?.prevotes,
                                    precommits: consensus?.round_state?.votes[round]?.precommits
                                }
                            });
                        })
                    }
                });
        }
        catch (e) {
            console.log(url);
            console.log(e);
        }
    },
    'chain.updateStatus': async function(){
        this.unblock();
        let url = "";
        try{
            url = API + '/blocks/latest';
            let latestBlock;

            try {
                await fetch(url)
                    .then(function (response) {
                        if (response.ok) {
                            response.json().then((data) => {
                                latestBlock = data;
                            })
                        }
                    });
            }
            catch (e) {
                console.log(url);
                console.log(e);
            }
        
            let chain = {};
            chain.chainId = latestBlock?.block?.header?.chain_id;
            chain.latestBlockHeight = parseInt(latestBlock?.block?.header?.height);
            chain.latestBlockTime = latestBlock?.block?.header?.time;
            let latestState = ChainStates.findOne({}, {sort: {height: -1}})
            if (latestState && latestState?.height >= chain?.latestBlockHeight) {
                return `no updates (getting block ${chain?.latestBlockHeight} at block ${latestState?.height})`
            }

            // Since Tendermint v0.33, validator page default set to return 30 validators.
            // Query latest height with page 1 and 100 validators per page.

            let validators = []
            let page = 0;
            let result;

            do {
                url = RPC+`/validators?page=${++page}&per_page=100`;
                try {
                    await fetch(url)
                        .then(function (response) {
                            if (response.ok) {
                                response.json().then((data) => {
                                    result = data?.result;
                                    validators = [...validators, ...result.validators];

                                })
                            }
                        });
                }
                catch (e) {
                    console.log(url);
                    console.log(e);
                }
            }
            while (validators.length < parseInt(result?.total))

            chain.validators = validators.length;
            let activeVP = 0;
            for (v in validators){
                activeVP += parseInt(validators[v].voting_power);
            }
            chain.activeVotingPower = activeVP;

            // update staking params
            try {
                url = API + '/cosmos/staking/v1beta1/params';
                await fetch(url)
                    .then(function (response) {
                        if (response.ok) {
                            response.json().then((data) => {
                                chain.staking = data;
                            })
                        }
                    });
            }
            catch (e) {
                console.log(url);
                console.log(e);
            }

            // Get chain states
            if (parseInt(chain.latestBlockHeight) > 0){
                let chainStates = {};
                chainStates.height = parseInt(chain.latestBlockHeight);
                chainStates.time = new Date(chain.latestBlockTime);

                try {
                    url = API + '/cosmos/staking/v1beta1/pool';
                    await fetch(url)
                        .then(function (response) {
                            if (response.ok) {
                                response.json().then((data) => {
                                    let bonding = data?.pool;
                                    chainStates.bondedTokens = parseInt(bonding?.bonded_tokens);
                                    chainStates.notBondedTokens = parseInt(bonding?.not_bonded_tokens);
                                })
                            }
                        });
                }
                catch (e) {
                    console.log(url);
                    console.log(e);
                }

                if ( Coin.StakingCoin.denom ) {
                    if (Meteor.settings.public.modules.bank){
                        try {
                            url = API + '/cosmos/bank/v1beta1/supply/' + Coin.StakingCoin.denom;
                            await fetch(url)
                                .then(function (response) {
                                    if (response.ok) {
                                        response.json().then((data) => {
                                            let supply = data;
                                            chainStates.totalSupply = parseInt(supply?.amount?.amount);
                                        })
                                    }
                                });
                        }
                        catch (e) {
                            console.log(url);
                            console.log(e);
                        }

                        // update bank params
                        try {
                            url = API + '/cosmos/bank/v1beta1/params';
                            await fetch(url)
                                .then(function (response) {
                                    if (response.ok) {
                                        response.json().then((data) => {
                                            chain.bank = data;

                                        })
                                    }
                                });
                        }
                        catch (e) {
                            console.log(url);
                            console.log(e);
                        }
                    }

                    if (Meteor.settings.public.modules.distribution){
                        try {
                            url = API + '/cosmos/distribution/v1beta1/community_pool';
                            await fetch(url)
                                .then(function (response) {
                                    if (response.ok) {
                                        response.json().then((data) => {
                                            let pool = data?.pool;
                                            if (pool && pool.length > 0) {
                                                chainStates.communityPool = [];
                                                pool.forEach((amount) => {
                                                    chainStates.communityPool.push({
                                                        denom: amount?.denom,
                                                        amount: parseFloat(amount?.amount)
                                                    })
                                                })
                                            }
                                        })
                                    }
                                });
                        }
                        catch (e) {
                            console.log(url);
                            console.log(e);
                        }

                        try {
                            url = API + '/cosmos/distribution/v1beta1/params';
                            await fetch(url)
                                .then(function (response) {
                                    if (response.ok) {
                                        response.json().then((data) => {
                                            chain.distribution = data;

                                        })
                                    }
                                });
                        }
                        catch (e) {
                            console.log(url);
                            console.log(e);
                        }
                    }

                    if (Meteor.settings.public.modules.minting){
                        try {
                            url = API + '/cosmos/mint/v1beta1/inflation';
                            await fetch(url)
                                .then(function (response) {
                                    if (response.ok) {
                                        response.json().then((data) => {
                                            let inflation = data?.inflation;
                                            if (inflation) {
                                                chainStates.inflation = parseFloat(inflation)
                                            }
                                        })
                                    }
                                });
                        }
                        catch (e) {
                            console.log(url);
                            console.log(e);
                        }


                        try {
                            url = API + '/cosmos/mint/v1beta1/annual_provisions';
                            await fetch(url)
                                .then(function (response) {
                                    if (response.ok) {
                                        response.json().then((data) => {
                                            let provisions = data?.annual_provisions;
                                            if (provisions) {
                                                chainStates.annualProvisions = parseFloat(provisions)
                                            }
                                        })
                                    }
                                });
                        }
                        catch (e) {
                            console.log(url);
                            console.log(e);
                        }

                        // update mint params
                        try {
                            url = API + '/cosmos/mint/v1beta1/params';
                            await fetch(url)
                                .then(function (response) {
                                    if (response.ok) {
                                        response.json().then((data) => {
                                            chain.mint = data;

                                        })
                                    }
                                });
                        }
                        catch (e) {
                            console.log(url);
                            console.log(e);
                        }
                    }

                    if (Meteor.settings.public.modules.gov){
                        // update mint params
                        try {
                            url = API + '/cosmos/gov/v1beta1/params';
                            await fetch(url)
                                .then(function (response) {
                                    if (response.ok) {
                                        response.json().then((data) => {
                                            chain.gov = data;

                                        })
                                    }
                                });
                        }
                        catch (e) {
                            console.log(url);
                            console.log(e);
                        }
                    }
                }

                ChainStates.insert(chainStates);
            }

            Chain.update({chainId:chain.chainId}, {$set:chain}, {upsert: true});

            return chain.latestBlockHeight;
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
