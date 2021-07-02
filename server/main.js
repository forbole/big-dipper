// Server entry point, imports all server code

import '/imports/startup/server';
import '/imports/startup/both';
// import moment from 'moment';
// import '/imports/api/blocks/blocks.js';

SYNCING = false;
TXSYNCING = false;
COUNTMISSEDBLOCKS = false;
COUNTMISSEDBLOCKSSTATS = false;
RPC = Meteor.settings.remote.rpc;
API = Meteor.settings.remote.api;

timerBlocks = 0;
timerTransactions = 0;
timerChain = 0;
timerConsensus = 0;
timerProposal = 0;
timerProposalsResults = 0;
timerMissedBlock = 0;
timerDelegation = 0;
timerAggregate = 0;

const DEFAULTSETTINGS = '/default_settings.json';

updateChainStatus = () => {
    Meteor.call('chain.updateStatus', (error, result) => {
        if (error){
            console.log("updateStatus: %o", error);
        }
        else{
            console.log("updateStatus: %o", result);
        }
    })
}

updateBlock = () => {
    Meteor.call('blocks.blocksUpdate', (error, result) => {
        if (error){
            console.log("updateBlocks: %o", error);
        }
        else{
            console.log("updateBlocks: %o", result);
        }
    })
}

updateTransactions = () => {
    Meteor.call('Transactions.updateTransactions', (error, result) => {
        if (error){
            console.log("updateTransactions: %o",error);
        }
        else{
            console.log("updateTransactions: %o",result);
        }
    })
}

getConsensusState = () => {
    Meteor.call('chain.getConsensusState', (error, result) => {
        if (error){
            console.log("get consensus: %o", error)
        }
    })
}

getProposals = () => {
    Meteor.call('proposals.getProposals', (error, result) => {
        if (error){
            console.log("get proposal: %o", error);
        }
        if (result){
            console.log("get proposal: %o", result);
        }
    });
}

getProposalsResults = () => {
    Meteor.call('proposals.getProposalResults', (error, result) => {
        if (error){
            console.log("get proposals result: %o", error);
        }
        if (result){
            console.log("get proposals result: %o", result);
        }
    });
}

updateMissedBlocks = () => {
    Meteor.call('ValidatorRecords.calculateMissedBlocks', (error, result) =>{
        if (error){
            console.log("missed blocks error: %o", error)
        }
        if (result){
            console.log("missed blocks ok: %o", result);
        }
    });
}

getDelegations = () => {
    Meteor.call('delegations.getDelegations', (error, result) => {
        if (error){
            console.log("get delegations error: %o", error)
        }
        else{
            console.log("get delegations ok: %o", result)
        }
    });
}

aggregateMinutely = () =>{
    // doing something every min
    Meteor.call('Analytics.aggregateBlockTimeAndVotingPower', "m", (error, result) => {
        if (error){
            console.log("aggregate minutely block time error: %o", error)
        }
        else{
            console.log("aggregate minutely block time ok: %o", result)
        }
    });

    Meteor.call('coinStats.getCoinStats', (error, result) => {
        if (error){
            console.log("get coin stats error: %o", error);
        }
        else{
            console.log("get coin stats ok: %o", result)
        }
    });
}

aggregateHourly = () =>{
    // doing something every hour
    Meteor.call('Analytics.aggregateBlockTimeAndVotingPower', "h", (error, result) => {
        if (error){
            console.log("aggregate hourly block time error: %o", error)
        }
        else{
            console.log("aggregate hourly block time ok: %o", result)
        }
    });
}

aggregateDaily = () =>{
    // doing somthing every day
    Meteor.call('Analytics.aggregateBlockTimeAndVotingPower', "d", (error, result) => {
        if (error){
            console.log("aggregate daily block time error: %o", error)
        }
        else{
            console.log("aggregate daily block time ok: %o", result)
        }
    });

    Meteor.call('Analytics.aggregateValidatorDailyBlockTime', (error, result) => {
        if (error){
            console.log("aggregate validators block time error: %o", error)
        }
        else {
            console.log("aggregate validators block time ok: %o", result);
        }
    })
}



Meteor.startup(async function(){
    if (Meteor.isDevelopment){
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
        import DEFAULTSETTINGSJSON from '../default_settings.json'
        Object.keys(DEFAULTSETTINGSJSON).forEach((key) => {
            if (Meteor.settings[key] == undefined) {
                console.warn(`CHECK SETTINGS JSON: ${key} is missing from settings`)
                Meteor.settings[key] = {};
            }
            Object.keys(DEFAULTSETTINGSJSON[key]).forEach((param) => {
                if (Meteor.settings[key][param] == undefined){
                    console.warn(`CHECK SETTINGS JSON: ${key}.${param} is missing from settings`)
                    Meteor.settings[key][param] = DEFAULTSETTINGSJSON[key][param]
                }
            })
        })
    }

    if (Meteor.settings.debug.startTimer){
        timerConsensus = Meteor.setInterval(function(){
            getConsensusState();
        }, Meteor.settings.params.consensusInterval);

        timerBlocks = Meteor.setInterval(function(){
            updateBlock();
        }, Meteor.settings.params.blockInterval);

        timerTransactions = Meteor.setInterval(function(){
            updateTransactions();
        }, Meteor.settings.params.transactionsInterval);

        timerChain = Meteor.setInterval(function(){
            updateChainStatus();
        }, Meteor.settings.params.statusInterval);

        if (Meteor.settings.public.modules.gov) {
            timerProposal = Meteor.setInterval(function () {
                getProposals();
            }, Meteor.settings.params.proposalInterval);

            timerProposalsResults = Meteor.setInterval(function () {
                getProposalsResults();
            }, Meteor.settings.params.proposalInterval);
        }

        timerMissedBlock = Meteor.setInterval(function(){
            updateMissedBlocks();
        }, Meteor.settings.params.missedBlocksInterval);

        // timerDelegation = Meteor.setInterval(function(){
        //     getDelegations();
        // }, Meteor.settings.params.delegationInterval);

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
});