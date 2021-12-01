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
    'chain.updateStatus': async function(){
        this.unblock();
        let url = "";
        try{
            url = API + '/blocks/latest';
            let response = HTTP.get(url);
            let latestBlock = JSON.parse(response.content);

            let chain = {};
            chain.chainId = latestBlock.block.header.chain_id;
            chain.latestBlockHeight = parseInt(latestBlock.block.header.height);
            chain.latestBlockTime = latestBlock.block.header.time;
            let latestState = ChainStates.findOne({}, {sort: {height: -1}})
            if (latestState && latestState.height >= chain.latestBlockHeight) {
                return `no updates (getting block ${chain.latestBlockHeight} at block ${latestState.height})`
            }

            // Since Tendermint v0.33, validator page default set to return 30 validators.
            // Query latest height with page 1 and 100 validators per page.

            // validators = validators.validatorsList;
            // chain.validators = validators.length;

            let validators = []
            let page = 0;

            do {
                url = RPC+`/validators?page=${++page}&per_page=100`;
                let response = HTTP.get(url);
                result = JSON.parse(response.content).result;
                validators = [...validators, ...result.validators];
                
            }
            while (validators.length < parseInt(result.total))

            chain.validators = validators.length;
            let activeVP = 0;
            for (v in validators){
                activeVP += parseInt(validators[v].voting_power);
            }
            chain.activeVotingPower = activeVP;

            // update staking params
            try {
                url = API + '/cosmos/staking/v1beta1/params';
                response = HTTP.get(url);
                chain.staking = JSON.parse(response.content);
            }
            catch(e){
                console.log(e);
            }

            // Get chain states
            if (parseInt(chain.latestBlockHeight) > 0){
                let chainStates = {};
                chainStates.height = parseInt(chain.latestBlockHeight);
                chainStates.time = new Date(chain.latestBlockTime);

                try{
                    url = API + '/cosmos/staking/v1beta1/pool';
                    let response = HTTP.get(url);
                    let bonding = JSON.parse(response.content).pool;
                    chainStates.bondedTokens = parseInt(bonding.bonded_tokens);
                    chainStates.notBondedTokens = parseInt(bonding.not_bonded_tokens);
                }
                catch(e){
                    console.log(e);
                }

                if ( Coin.StakingCoin.denom ) {
                    if (Meteor.settings.public.modules.bank){
                        try{
                            url = API + '/cosmos/bank/v1beta1/supply/' + Coin.StakingCoin.denom;
                            let response = HTTP.get(url);
                            let supply = JSON.parse(response.content);
                            chainStates.totalSupply = parseInt(supply.amount.amount);
                        }
                        catch(e){
                            console.log(e);
                        }

                        // update bank params
                        try {
                            url = API + '/cosmos/bank/v1beta1/params';
                            response = HTTP.get(url);
                            chain.bank = JSON.parse(response.content);
                        }
                        catch(e){
                            console.log(e);
                        }

                    }

                    if (Meteor.settings.public.modules.distribution){
                        try {
                            url = API + '/cosmos/distribution/v1beta1/community_pool';
                            let response = HTTP.get(url);
                            let pool = JSON.parse(response.content).pool;
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

                        // update distribution params
                        try {
                            url = API + '/cosmos/distribution/v1beta1/params';
                            response = HTTP.get(url);
                            chain.distribution = JSON.parse(response.content);
                        }
                        catch(e){
                            console.log(e);
                        }
                    }

                    if (Meteor.settings.public.modules.minting){
                        try{
                            url = API + '/cosmos/mint/v1beta1/inflation';
                            let response = HTTP.get(url);
                            let inflation = JSON.parse(response.content).inflation;
                            // response = HTTP.get(url);
                            // let inflation = JSON.parse(response.content).result;
                            if (inflation){
                                chainStates.inflation = parseFloat(inflation)
                            }
                        }
                        catch(e){
                            console.log(e);
                        }

                        try{
                            url = API + '/cosmos/mint/v1beta1/annual_provisions';
                            let response = HTTP.get(url);
                            let provisions = JSON.parse(response.content).annual_provisions;
                            console.log(provisions)
                            if (provisions){
                                chainStates.annualProvisions = parseFloat(provisions)
                            }
                        }
                        catch(e){
                            console.log(e);
                        }

                        // update mint params
                        try {
                            url = API + '/cosmos/mint/v1beta1/params';
                            response = HTTP.get(url);
                            chain.mint = JSON.parse(response.content);
                        }
                        catch(e){
                            console.log(e);
                        }
                    }

                    if (Meteor.settings.public.modules.gov){
                        // update gov params
                        try {
                            url = API + '/cosmos/gov/v1beta1/params/tallying';
                            response = HTTP.get(url);
                            chain.gov = JSON.parse(response.content);
                        }
                        catch(e){
                            console.log(e);
                        }
                    }
                }

                ChainStates.insert(chainStates);
            }

            Chain.update({chainId:chain.chainId}, {$set:chain}, {upsert: true});

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
    'chain.shouldUpdateCosmosAccountsNumber': function () {
        this.unblock();
        let date = new Date();
        let chain = Chain.find().fetch();
        let lastUpdated = chain?.lastUpdated ? new Date(chain?.lastUpdated) : new Date();
        let timeDifference = moment(date).diff(moment(lastUpdated), 'hours');
        let shouldUpdate = timeDifference >= 24 ? true : false;
        return shouldUpdate;
    },
    'chain.getCosmosAccountsNumber': function (totalNumberOfAccountsIndex) {
        this.unblock();
        let date = new Date();
        let dateUTC = date.toUTCString();
        let totalNumberOfCosmosAccounts = {
            total: totalNumberOfAccountsIndex,
            lastUpdated: dateUTC
        }
        try {
            Chain.upsert({ chainId: Meteor.settings.public.chainId }, { $set: { "totalNumberOfCosmosAccounts": totalNumberOfCosmosAccounts } });
        }
        catch (e) {
            console.log(e);
        }
    },
})
