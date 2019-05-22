// Server entry point, imports all server code

import '/imports/startup/server';
import '/imports/startup/both';
// import moment from 'moment';
// import '/imports/api/blocks/blocks.js';

SYNCING = false;
COUNTMISSEDBLOCKS = false;
RPC = Meteor.settings.remote.rpc;
LCD = Meteor.settings.remote.lcd;
timerBlocks = 0;
timerChain = 0;
timerConsensus = 0;
timerProposal = 0;
timerProposalsResults = 0;
timerMissedBlock = 0;
timerDelegation = 0;
timerAggregate = 0;


updateChainStatus = () => {
    Meteor.call('chain.updateStatus', (error, result) => {
        if (error){
            console.log("updateStatus: "+error);
        }
        else{
            console.log("updateStatus: "+result);
        }
    })
}

updateBlock = () => {
    Meteor.call('blocks.blocksUpdate', (error, result) => {
        if (error){
            console.log("updateBlocks: "+error);
        }
        else{
            console.log("updateBlocks: "+result);
        }
    })
}

getConsensusState = () => {
    Meteor.call('chain.getConsensusState', (error, result) => {
        if (error){
            console.log("get consensus: "+error)
        }
    })
}

getProposals = () => {
    Meteor.call('proposals.getProposals', (error, result) => {
        if (error){
            console.log("get porposal: "+ error);
        }
        if (result){
            console.log("get proposal: "+result);
        }
    });
}

getProposalsResults = () => {
    Meteor.call('proposals.getProposalResults', (error, result) => {
        if (error){
            console.log("get proposals result: "+error);
        }
        if (result){
            console.log("get proposals result: "+result);
        }
    });
}

updateMissedBlockStats = () => {
    Meteor.call('ValidatorRecords.calculateMissedBlocks', (error, result) =>{
        if (error){
            console.log("missblocks error: "+ error)
        }
        if (result){
            console.log("missed blocks ok:" + result);
        }
    });
}

getDelegations = () => {
    Meteor.call('delegations.getDelegations', (error, result) => {
        if (error){
            console.log("get delegation error: "+ error)
        }
        else{
            console.log("get delegtaions ok: "+ result)
        }
    });
}

aggregateMinutely = () =>{
    // doing something every min
    Meteor.call('Analytics.aggregateBlockTimeAndVotingPower', "m", (error, result) => {
        if (error){
            console.log("aggregate minutely block time error: "+error)
        }
        else{
            console.log("aggregate minutely block time ok: "+result)
        }
    });

    Meteor.call('coinStats.getCoinStats', (error, result) => {
        if (error){
            console.log("get coin stats: "+error);
        }
        else{
            console.log("get coin stats ok: "+result)
        }
    });
}

aggregateHourly = () =>{
    // doing something every hour
    Meteor.call('Analytics.aggregateBlockTimeAndVotingPower', "h", (error, result) => {
        if (error){
            console.log("aggregate hourly block time error: "+error)
        }
        else{
            console.log("aggregate hourly block time ok: "+result)
        }
    });
}

aggregateDaily = () =>{
    // doing somthing every day
    Meteor.call('Analytics.aggregateBlockTimeAndVotingPower', "d", (error, result) => {
        if (error){
            console.log("aggregate daily block time error: "+error)
        }
        else{
            console.log("aggregate daily block time ok: "+result)
        }
    });

    Meteor.call('Analytics.aggregateValidatorDailyBlockTime', (error, result) => {
        if (error){
            console.log("aggregate validators block time error:"+ error)
        }
        else {
            console.log("aggregate validators block time ok:"+ result);
        }
    })
}


Meteor.startup(function(){
    if (Meteor.isDevelopment){
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
        WebApp.rawConnectHandlers.use(function(req, res, next) {
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.setHeader('Access-Control-Allow-Credentials', true);
            res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PUT, DELTE, OPTIONS');
            res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept");
            return next();
        });
    }

    Meteor.call('chain.genesis', (err, result) => {
        if (err){
            console.log(err);
        }
        if (result){
            if (Meteor.settings.debug.startTimer){
                timerConsensus = Meteor.setInterval(function(){
                    getConsensusState();
                }, Meteor.settings.params.consensusInterval);

                timerBlocks = Meteor.setInterval(function(){
                    updateBlock();
                }, Meteor.settings.params.blockInterval);

                timerChain = Meteor.setInterval(function(){
                    updateChainStatus();
                }, Meteor.settings.params.statusInterval);

                timerProposal = Meteor.setInterval(function(){
                    getProposals();
                }, Meteor.settings.params.proposalInterval);

                timerProposalsResults = Meteor.setInterval(function(){
                    getProposalsResults();
                }, Meteor.settings.params.proposalInterval);

                timerMissedBlock = Meteor.setInterval(function(){
                    updateMissedBlockStats();
                }, Meteor.settings.params.missedBlocksInterval);

                timerDelegation = Meteor.setInterval(function(){
                    getDelegations();
                }, Meteor.settings.params.delegationInterval);

                timerAggregate = Meteor.setInterval(function(){
                    let now = new Date();
                    if ((now.getUTCSeconds() == 0)){
                        aggregateMinutely();
                    }

                    if ((now.getUTCMinutes() == 0) && (now.getUTCSeconds() == 0)){
                        aggregateHourly();
                    }

                    if ((now.getUTCHours() == 0) && (now.getUTCMinutes() == 0) && (now.getUTCSeconds() == 0)){
                        aggregateDaily();
                    }
                }, 1000)
            }
        }
    })

});