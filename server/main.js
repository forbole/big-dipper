// Server entry point, imports all server code

import '/imports/startup/server';
import '/imports/startup/both';
// import '/imports/api/blocks/blocks.js';

SYNCING = false;
RPC = Meteor.settings.remote.rpc;
LCD = Meteor.settings.remote.lcd;
timerBlocks = 0;
timerChain = 0;

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

Meteor.startup(function(){
    Meteor.call('chain.updateStatus', function(error, result){
        if (result){
            timerBlocks = Meteor.setInterval(function(){
                updateBlock();
            }, Meteor.settings.params.interval);

            timerChain = Meteor.setInterval(function(){
                updateChainStatus();
            }, Meteor.settings.params.interval);
        }
    })
    
});