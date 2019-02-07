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
timerMissedBlock = 0;
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

aggregateHourly = () =>{
    // doing something every hour
}

aggregateDaily = () =>{
    // doing somthing every day
}



Meteor.startup(function(){
    if (Meteor.isDevelopment){
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
    }

    // console.log(Meteor.call('blocks.averageBlockTime','E161D3FC5A61E381D68CE244FBEC27913930B37D'));
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
        timerMissedBlock = Meteor.setInterval(function(){
            updateMissedBlockStats();
        }, Meteor.settings.params.missedBlocksInterval);
    
        timerAggregate = Meteor.setInterval(function(){
            let now = new Date();
            if ((now.getUTCMinutes() == 0) && (now.getUTCSeconds() == 0)){
                aggregateHourly();
            }
    
            if ((now.getUTCHours() == 0) && (now.getUTCMinutes() == 0) && (now.getUTCSeconds() == 0)){
                aggregateDaily();
            }
        }, 1000)
    }
});