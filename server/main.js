// Server entry point, imports all server code

import '/imports/startup/server';
import '/imports/startup/both';
// import '/imports/api/blocks/blocks.js';

SYNCING = false;
RPC = Meteor.settings.remote.rpc;
LCD = Meteor.settings.remote.lcd;
timer = 0;

updateBlock = () => {
    Meteor.call('blocks.blocksUpdate', (error, result) => {
        if (error){
            console.log(error);
        }
        else{
            console.log(result);
        }
    })
}

Meteor.startup(function(){
    timer = Meteor.setInterval(function(){
        updateBlock();
    }, Meteor.settings.params.interval);
    // Meteor.call('getGenesisValidators', (err, results) => {
    //     this.updateBlock();
    // });
    // // while(true){
        
    // //}
});