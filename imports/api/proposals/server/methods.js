import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import { Proposals } from '../proposals.js';
import { Chain } from '../../chain/chain.js';
import { Validators } from '../../validators/validators.js';

Meteor.methods({
    'proposals.getProposals': function(){
        this.unblock();

        // get gov tally prarams
        let url = API + '/cosmos/gov/v1beta1/params/tallying';
        try{
            let response = HTTP.get(url);
            let params = JSON.parse(response.content);

            Chain.update({chainId: Meteor.settings.public.chainId}, {$set:{"gov.tallyParams":params.tally_params}});

            url = API + '/cosmos/gov/v1beta1/proposals';
            response = HTTP.get(url);
            let proposals = JSON.parse(response.content).proposals;
            // console.log(proposals);

            let finishedProposalIds = new Set(Proposals.find(
                {"proposal_status":{$in:["PROPOSAL_STATUS_PASSED", "PROPOSAL_STATUS_REJECTED", "PROPOSAL_STATUS_REMOVED"]}}
            ).fetch().map((p)=> p.proposalId));

            let proposalIds = [];
            if (proposals.length > 0){
                // Proposals.upsert()
                const bulkProposals = Proposals.rawCollection().initializeUnorderedBulkOp();
                for (let i in proposals){
                    let proposal = proposals[i];
                    proposal.proposalId = parseInt(proposal.proposal_id);
                    proposalIds.push(proposal.proposalId);
                    if (proposal.proposalId > 0 && !finishedProposalIds.has(proposal.proposalId)) {
                        try{
                            // url = API + '/cosmos/gov/v1beta1/proposals/'+proposal.proposalId+'/proposer';
                            // let response = HTTP.get(url);
                            // if (response.statusCode == 200){
                            //     let proposer = JSON.parse(response.content).result;
                            //     if (proposer.proposal_id && (proposer.proposal_id == proposal.id)){
                            //         proposal.proposer = proposer.proposer;
                            //     }
                            // }
                            bulkProposals.find({proposalId: proposal.proposalId}).upsert().updateOne({$set:proposal});
                        }
                        catch(e){
                            bulkProposals.find({proposalId: proposal.proposalId}).upsert().updateOne({$set:proposal});
                            // proposalIds.push(proposal.proposalId);
                            console.log(url);
                            console.log(e.response.content);
                        }
                    }
                }
                bulkProposals.find({proposalId:{$nin:proposalIds}, status:{$nin:["PROPOSAL_STATUS_VOTING_PERIOD", "PROPOSAL_STATUS_PASSED", "PROPOSAL_STATUS_REJECTED", "PROPOSAL_STATUS_REMOVED"]}})
                    .update({$set: {"status": "PROPOSAL_STATUS_REMOVED"}});
                bulkProposals.execute();
            }
            return true
        }
        catch (e){
            console.log(url);
            console.log(e);
        }
    },
    'proposals.getProposalResults': function(){
        this.unblock();
        let proposals = Proposals.find({"status":{$nin:["PROPOSAL_STATUS_PASSED", "PROPOSAL_STATUS_REJECTED", "PROPOSAL_STATUS_REMOVED"]}}).fetch();

        if (proposals && (proposals.length > 0)){
            for (let i in proposals){
                if (parseInt(proposals[i].proposalId) > 0){
                    let url = "";
                    try{
                        // get proposal deposits
                        url = API + '/cosmos/gov/v1beta1/proposals/'+proposals[i].proposalId+'/deposits?pagination.limit=2000&pagination.count_total=true';
                        let response = HTTP.get(url);
                        let proposal = {proposalId: proposals[i].proposalId};
                        if (response.statusCode == 200){
                            let deposits = JSON.parse(response.content).deposits;
                            proposal.deposits = deposits;
                        }

                        url = API + '/cosmos/gov/v1beta1/proposals/'+proposals[i].proposalId+'/votes?pagination.limit=2000&pagination.count_total=true';
                        response = HTTP.get(url);
                        if (response.statusCode == 200){
                            let votes = JSON.parse(response.content).votes;
                            proposal.votes = getVoteDetail(votes);
                        }

                        url = API + '/cosmos/gov/v1beta1/proposals/'+proposals[i].proposalId+'/tally';
                        response = HTTP.get(url);
                        if (response.statusCode == 200){
                            let tally = JSON.parse(response.content).tally;
                            proposal.tally = tally;
                        }

                        proposal.updatedAt = new Date();
                        Proposals.update({proposalId: proposals[i].proposalId}, {$set:proposal});
                    }
                    catch(e){
                        console.log(url);
                        console.log(e);
                    }
                }
            }
        }
        return true
    }
})

const getVoteDetail = (votes) => {
    if (!votes) {
        return [];
    }

    let voters = votes.map((vote) => vote.voter);
    let votingPowerMap = {};
    let validatorAddressMap = {};
    Validators.find({delegator_address: {$in: voters}}).forEach((validator) => {
        votingPowerMap[validator.delegator_address] = {
            moniker: validator.description.moniker,
            address: validator.address,
            tokens: parseFloat(validator.tokens),
            delegatorShares: parseFloat(validator.delegator_shares),
            deductedShares: parseFloat(validator.delegator_shares)
        }
        validatorAddressMap[validator.operator_address] = validator.delegator_address;
    });
    voters.forEach((voter) => {
        if (!votingPowerMap[voter]) {
            // voter is not a validator
            let url = `${API}/cosmos/staking/v1beta1/delegations/${voter}`;
            let delegations;
            let votingPower = 0;
            try{
                let response = HTTP.get(url);
                if (response.statusCode == 200){
                    delegations = JSON.parse(response.content).delegations_response;
                    if (delegations && delegations.length > 0) {
                        delegations.forEach((delegation) => {
                            let shares = parseFloat(delegation.delegation.shares);
                            if (validatorAddressMap[delegation.delegation.validator_address]) {
                                // deduct delegated shareds from validator if a delegator votes
                                let validator = votingPowerMap[validatorAddressMap[delegation.validator_address]];
                                validator.deductedShares -= shares;
                                if (validator.delegatorShares != 0){ // avoiding division by zero
                                    votingPower += (shares/validator.delegatorShares) * validator.tokens;
                                }

                            } else {
                                let validator = Validators.findOne({operatorAddress: delegation.validator_address});
                                if (validator && validator.delegatorShares != 0){ // avoiding division by zero
                                    votingPower += (shares/parseFloat(validator.delegatorShares)) * parseFloat(validator.tokens);
                                }
                            }
                        });
                    }
                }
            }
            catch (e){
                console.log(url);
                console.log(e.response.content);
            }
            votingPowerMap[voter] = {votingPower: votingPower};
        }
    });
    return votes.map((vote) => {
        let voter = votingPowerMap[vote.voter];
        let votingPower = voter.votingPower;
        if (votingPower == undefined) {
            // voter is a validator
            votingPower = voter.delegatorShares?((voter.deductedShares/voter.delegatorShares) * voter.tokens):0;
        }
        return {...vote, votingPower};
    });
}
