// import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
// import { check } from 'meteor/check';

import { Blockscon } from '/imports/api/blocks/blocks.js';
import { ValidatorSets } from '/imports/api/validator-sets/validator-sets.js';

RPC = Meteor.settings.remote.rpc;
LCD = Meteor.settings.remote.lcd;

Meteor.methods({
    'blocks.getLatestHeight': function() {
        this.unblock();
        let url = RPC+'/status';
        let response = HTTP.get(url);
        let status = JSON.parse(response.content);
        return (status.result.sync_info.latest_block_height);
    },
    'blocks.getCurrentHeight': function() {
        this.unblock();
        return (Blockscon.find().count());
    },
    'blocks.blocksUpdate': function() {
        if (SYNCING)
            return "Syncing...";
        // Meteor.clearInterval(Meteor.timerHandle);
        // get the latest height
        let until = Meteor.call('blocks.getLatestHeight');
        // console.log(until);
        // get the current height in db
        let curr = Meteor.call('blocks.getCurrentHeight');
        // console.log(curr);
        // Blockscon.insert({height: 123, hash: "1234", transNum: 1234, time: "1234"});
        // loop if there's update in db
        if (until > curr) {
            SYNCING = true;
            for (let height = curr+1 ; height <= until ; height++) {
                // add timeout here? and outside this loop (for catched up and keep fetching)?
                this.unblock();
                let url = RPC+'/block?height=' + height;
                console.log(url);
                let response = HTTP.get(url);
                let block = JSON.parse(response.content);
                block = block.result;
                // console.log(block);
                // store height, hash, numtransaction and time in db
                let blockData = {};
                blockData.height = height;
                blockData.hash = block.block_meta.block_id.hash;
                blockData.transNum = block.block_meta.header.num_txs;
                blockData.time = block.block.header.time;
                blockData.lastBlockHash = block.block.header.last_block_id.hash;
                blockData.validators = [];
                let precommits = block.block.last_commit.precommits;
                if (precommits != null){
                    console.log(precommits.length);
                    for (let i=0; i<precommits.length; i++){
                        if (precommits[i] != null){
                            blockData.validators.push(precommits[i].validator_address);
                        }
                        // console.log(i);
                        // console.log(precommits[i].validator_address);
                    }    
                }
                // console.log(precommits[10]);
                console.log(blockData);
                Blockscon.insert(blockData);

                url = RPC+'/validators?height='+height;
                response = HTTP.get(url);
                let validators = JSON.parse(response.content);
                ValidatorSets.insert(validators.result);
            }
            SYNCING = false;
        }
        
        return until;
    },
    // 'addLimit': function(limit) {
    //     console.log(limit+10)
    //     return (limit+10);
    // },
    // 'hasMore': function(limit) {
    //     if (limit > Meteor.call('getCurrentHeight')) {
    //         return (false);
    //     } else {
    //         return (true);
    //     }
    // }
});