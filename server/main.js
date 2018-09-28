// Server entry point, imports all server code

import '/imports/startup/server';
import '/imports/startup/both';
// import '/imports/api/blocks/blocks.js';

SYNCING = false;
RPC = Meteor.settings.remote.rpc;
LCD = Meteor.settings.remote.lcd;
timerBlocks = 0;
timerChain = 0;
timerConsensus = 0;

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

Meteor.startup(function(){
    Meteor.call('chain.updateStatus', function(error, result){
        if (result){
            timerConsensus = Meteor.setInterval(function(){
                getConsensusState();
            }, Meteor.settings.params.consensusInterval);
            timerBlocks = Meteor.setInterval(function(){
                updateBlock();
            }, Meteor.settings.params.blockInterval);

            timerChain = Meteor.setInterval(function(){
                updateChainStatus();
            }, Meteor.settings.params.statusInterval);
        }
    })
    
});