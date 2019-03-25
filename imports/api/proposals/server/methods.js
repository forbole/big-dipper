import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import { Proposals } from '../proposals.js';
// import { Promise } from 'meteor/promise';

Meteor.methods({
    'proposals.getProposals': function(){
        this.unblock();
        try{
            let url = LCD + '/gov/proposals';
            let response = HTTP.get(url);
            let proposals = JSON.parse(response.content);

            // console.log(proposals);

            let proposalIds = [];
            if (proposals.length > 0){
                // Proposals.upsert()
                const bulkProposals = Proposals.rawCollection().initializeUnorderedBulkOp();
                for (let i in proposals){
                    let proposal = proposals[i];
                    proposal.proposalId = parseInt(proposal.value.proposal_id);
                    let url = LCD + '/gov/proposals/'+proposal.proposalId+'/proposer';
                    let response = HTTP.get(url);
                    if (response.statusCode == 200){
                        let proposer = JSON.parse(response.content);
                        if (proposer.proposal_id && (proposer.proposal_id == proposal.value.proposal_id)){
                            proposal.proposer = proposer.proposer;
                        }
                    }                    
                    bulkProposals.find({proposalId: proposal.proposalId}).upsert().updateOne({$set:proposal});
                    proposalIds.push(proposal.proposalId);
                }
                bulkProposals.find({proposalId:{$nin:proposalIds}}).update({$set:{"value.proposal_status":"Removed"}});
                bulkProposals.execute();
            }
        }
        catch (e){

        }
    },
    'proposals.getProposalResults': function(){
        this.unblock();
        let proposals = Proposals.find({"value.proposal_status":{$nin:["Passed", "Rejected", "Removed"]}}).fetch();

        if (proposals && (proposals.length > 0)){
            for (let i in proposals){
                try{
                    // get proposal deposits
                    let url = LCD + '/gov/proposals/'+proposals[i].proposalId+'/deposits';
                    let response = HTTP.get(url);
                    let proposal = {proposalId: proposals[i].proposalId};
                    if (response.statusCode == 200){
                        let deposits = JSON.parse(response.content);
                        proposal.deposits = deposits;
                    }

                    url = LCD + '/gov/proposals/'+proposals[i].proposalId+'/votes';
                    response = HTTP.get(url);
                    if (response.statusCode == 200){
                        let votes = JSON.parse(response.content);
                        proposal.votes = votes;
                    }

                    url = LCD + '/gov/proposals/'+proposals[i].proposalId+'/tally';
                    response = HTTP.get(url);
                    if (response.statusCode == 200){
                        let tally = JSON.parse(response.content);
                        proposal.tally = tally;
                    }

                    proposal.updatedAt = new Date();
                    Proposals.update({proposalId: proposals[i].proposalId}, {$set:proposal});
                }
                catch(e){

                }                
            }
        }
    }
})