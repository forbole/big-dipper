import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import { Chain, ChainStates } from '../chain.js';
import Coin from '../../../../both/utils/coins.js';
import { goTimeToISOString } from '../../../../both/utils/time';
import { Cosmos } from '@forbole/cosmos-protobuf-js'

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
    'chain.updateStatus': async function(){
        this.unblock();
        try{
            let req = new Cosmos.Base.Tendermint.GetLatestBlockRequest();
            let latestBlock = await Cosmos.gRPC.unary(Cosmos.Base.Tendermint.Service.GetLatestBlock, req, GRPC);
            // console.log(JSON.stringify(latestBlock));
            let chain = {};
            chain.chainId = latestBlock.block.header.chainId;
            chain.latestBlockHeight = latestBlock.block.header.height;
            chain.latestBlockTime = goTimeToISOString(latestBlock.block.header.time)
            let latestState = ChainStates.findOne({}, {sort: {height: -1}})
            if (latestState && latestState.height >= chain.latestBlockHeight) {
                return `no updates (getting block ${chain.latestBlockHeight} at block ${latestState.height})`
            }

            // Since Tendermint v0.33, validator page default set to return 30 validators.
            // Query latest height with page 1 and 100 validators per page.
            // req = new Cosmos.Base.Tendermint.GetLatestValidatorSetRequest()
            // let validators = await Cosmos.gRPC.unary(Cosmos.Base.Tendermint.Service.GetLatestValidatorSet, req, GRPC)
            // console.log(validators)

            // validators = validators.validatorsList;
            // chain.validators = validators.length;

            let validators = []
            let page = 0;

            do {
                let url = RPC+`/validators?page=${++page}&per_page=100`;
                let response = HTTP.get(url);
                result = JSON.parse(response.content).result;
                // console.log("========= validator result ==========: %o", result)
                validators = [...validators, ...result.validators];
                
            }
            while (validators.length < parseInt(result.total))

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
                chainStates.height = parseInt(chain.latestBlockHeight);
                chainStates.time = new Date(chain.latestBlockTime);

                try{
                    req = new Cosmos.Staking.QueryPoolRequest();
                    let bonding = await Cosmos.gRPC.unary(Cosmos.Staking.Query.Pool, req, GRPC);
                    chainStates.bondedTokens = parseInt(bonding.pool.bondedTokens);
                    chainStates.notBondedTokens = parseInt(bonding.pool.notBondedTokens);
                }
                catch(e){
                    console.log(e);
                }

                if ( Coin.StakingCoin.denom ) {
                    if (Meteor.settings.public.modules.bank){
                        try{
                            req = new Cosmos.Bank.QuerySupplyOfRequest();
                            req.setDenom(Coin.StakingCoin.denom);
                            let supply = await Cosmos.gRPC.unary(Cosmos.Bank.Query.SupplyOf, req, GRPC);
                            chainStates.totalSupply = parseInt(supply.amount.amount);
                        }
                        catch(e){
                            console.log(e);
                        }
                    }

                    if (Meteor.settings.public.modules.distribution){
                        try {
                            req = new Cosmos.Distribution.QueryCommunityPoolRequest();
                            let pool = await Cosmos.gRPC.unary(Cosmos.Distribution.Query.CommunityPool, req, GRPC);
                            pool = pool.poolList;
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
                            console.log(e)
                        }
                    }

                    // if (Meteor.settings.public.modules.minting){
                    //     try{
                    //         req = new Cosmos.Mint.QueryInflationRequest()
                    //         let inflation = await Cosmos.gRPC.unary(Cosmos.Mint.Query.Inflation, req, GRPC);
                    //         console.log(inflation);
                    //         // response = HTTP.get(url);
                    //         // let inflation = JSON.parse(response.content).result;
                    //         if (inflation){
                    //             chainStates.inflation = parseFloat(inflation)
                    //         }
                    //     }
                    //     catch(e){
                    //         console.log(e);
                    //     }

                    //     try{
                    //         req = new Cosmos.Mint.QueryAnnualProvisionsRequest();
                    //         let provisions = await Cosmos.gRPC.unary(Cosmos.Mint.Query.AnnualProvisions, req, GRPC)
                    //         console.log(provisions)
                    //         if (provisions){
                    //             chainStates.annualProvisions = parseFloat(provisions)
                    //         }
                    //     }
                    //     catch(e){
                    //         console.log(e);
                    //     }
                    // }
                }

                ChainStates.insert(chainStates);
            }

            // chain.totalVotingPower = totalVP;

            // validators = Validators.find({}).fetch();
            // console.log(validators);
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
