import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import { Proposals } from '../proposals.js';
import { Chain } from '../../chain/chain.js';
import { Validators } from '../../validators/validators.js';

Meteor.methods({
    'proposals.getProposals': function () {
        this.unblock();

        try {
            url = API + '/gov/proposals';
            response = HTTP.get(url);
            let proposals = JSON.parse(response.content).result;
            let finishedProposalIds = new Set(Proposals.find(
                { "proposal_status": { $in: ["PROPOSAL_STATUS_PASSED", "PROPOSAL_STATUS_REJECTED", "PROPOSAL_STATUS_REMOVED"] } }
            ).fetch().map((p) => p.proposalId));

            let proposalIds = [];
            if (proposals.length > 0) {
                const bulkProposals = Proposals.rawCollection().initializeUnorderedBulkOp();
                for (let i in proposals) {
                    let proposal = proposals[i];
                    proposal.proposalId = parseInt(proposal.proposal_id);
                    proposalIds.push(proposal.proposalId);
                    if (proposal.proposalId > 0 && !finishedProposalIds.has(proposal.proposalId)) {
                        try {
                            bulkProposals.find({ proposalId: proposal.proposalId }).upsert().updateOne({ $set: proposal });
                        }
                        catch (e) {
                            bulkProposals.find({ proposalId: proposal.proposalId }).upsert().updateOne({ $set: proposal });
                            console.log(url);
                            console.log(e.response.content);
                        }
                    }
                }
                bulkProposals.find({ proposalId: { $nin: proposalIds }, status: { $nin: ["PROPOSAL_STATUS_VOTING_PERIOD", "PROPOSAL_STATUS_PASSED", "PROPOSAL_STATUS_REJECTED", "PROPOSAL_STATUS_REMOVED"] } })
                    .update({ $set: { "status": "PROPOSAL_STATUS_REMOVED" } });
                bulkProposals.execute();
            }
            return true
        }
        catch (e) {
            console.log(url);
            console.log(e);
        }
    },
    'proposals.getProposalResults': function () {
        this.unblock();
        let proposals = Proposals.find({ "status": { $nin: ["PROPOSAL_STATUS_PASSED", "PROPOSAL_STATUS_REJECTED", "PROPOSAL_STATUS_REMOVED"] } }).fetch();

        if (proposals && (proposals.length > 0)) {
            for (let i in proposals) {
                if (parseInt(proposals[i].proposalId) > 0) {
                    let url = "";
                    try {
                        // get proposal deposits
                        url = API + '/gov/proposals/' + proposals[i].proposalId + '/deposits';
                        let response = HTTP.get(url);
                        let proposal = { proposalId: proposals[i].proposalId };
                        if (response.statusCode == 200) {
                            let deposits = JSON.parse(response.content).result;
                            proposal.deposits = deposits;
                        }

                        url = API + '/gov/proposals/' + proposals[i].proposalId + '/votes';
                        response = HTTP.get(url);
                        if (response.statusCode == 200) {
                            let votes = JSON.parse(response.content).result;
                            proposal.votes = getVoteDetail(votes);
                        }

                        url = API + '/gov/proposals/' + proposals[i].proposalId + '/tally';
                        response = HTTP.get(url);
                        if (response.statusCode == 200) {
                            let tally = JSON.parse(response.content).result;
                            proposal.tally = tally;
                        }

                        proposal.updatedAt = new Date();
                        Proposals.update({ proposalId: proposals[i].proposalId }, { $set: proposal });
                    }
                    catch (e) {
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
    Validators.find({ delegator_address: { $in: voters } }).forEach((validator) => {
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
            let url = `${API}/staking/delegators/${voter}/delegations`;
            let delegations;
            let votingPower = 0;
            try {
                let response = HTTP.get(url);
                if (response.statusCode == 200) {
                    delegations = JSON.parse(response.content).result;
                    if (delegations && delegations.length > 0) {
                        delegations.forEach((delegation) => {
                            let shares = parseFloat(delegation.shares);
                            if (validatorAddressMap[delegation.validator_address]) {
                                // deduct delegated shareds from validator if a delegator votes
                                let validator = votingPowerMap[validatorAddressMap[delegation.validator_address]];
                                validator.deductedShares -= shares;
                                if (validator.delegator_shares != 0) { // avoiding division by zero
                                    votingPower += (shares / validator.delegator_shares) * validator.tokens;
                                }

                            } else {
                                let validator = Validators.findOne({ operator_address: delegation.validator_address });
                                if (validator && validator.delegator_shares != 0) { // avoiding division by zero
                                    votingPower += (shares / parseFloat(validator.delegator_shares)) * parseFloat(validator.tokens);
                                }
                            }
                        });
                    }
                }
            }
            catch (e) {
                console.log(url);
                console.log(e);
            }
            votingPowerMap[voter] = { votingPower: votingPower };
        }
    });
    return votes.map((vote) => {
        let voter = votingPowerMap[vote.voter];
        let votingPower = voter.votingPower;
        if (votingPower == undefined) {
            // voter is a validator
            votingPower = voter.delegatorShares ? ((voter.deductedShares / voter.delegatorShares) * voter.tokens) : 0;
        }
        return { ...vote, votingPower };
    });
}