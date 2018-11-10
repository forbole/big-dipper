import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import { Chain } from '../chain.js';
import { Validators } from '../../validators/validators.js';

Meteor.methods({
    'chain.getConsensusState': function(){
        this.unblock();
        let url = RPC+'/consensus_state';
        try{
            let response = HTTP.get(url);
            let consensus = JSON.parse(response.content);
            consensus = consensus.result;
            let roundState = consensus.round_state['height/round/step'].split('/');
            let height = roundState[0];
            let round = roundState[1];
            let votedPower = Math.round(parseFloat(consensus.round_state.height_vote_set[round].prevotes_bit_array.split(" ")[3])*100);

            Chain.update({chainId:Meteor.settings.public.chainId}, {$set:{votingHeight:height, votedPower:votedPower}});
            // console.log(votingPower);

            // console.log(consensus.round_state['height/round/step']);
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
                // console.log();
                let vp = Math.round(parseFloat(eval(validatorSet[v].tokens)));
                totalVP += parseInt(vp);
                // try{
                //     if ((validatorSet[v].description.identity.length > 0) && (validatorSet[v].description.identity != "[do-not-modify]")){
                //         url = "https://keybase.io/_/api/1.0/user/lookup.json?key_suffix="+validatorSet[v].description.identity+"&fields=pictures";
                //         response = HTTP.get(url);
                //         let picture = JSON.parse(response.content);
                //         // console.log(picture);
                //         console.log("picture:"+v);
                //         if (picture.status.code == 0){
                //             if (picture.them != null){
                //                 if ((picture.them.length > 0) && (picture.them[0].pictures))
                //                     validatorSet[v].picture = picture.them[0].pictures.primary.url
                //             }
                //         }
                //     }
                // }
                // catch (e){
                //     console.log(e);
                // }
                // console.log(validatorSet[v].revoked);
                Validators.update({pub_key:validatorSet[v].pub_key}, {$set:validatorSet[v]});
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