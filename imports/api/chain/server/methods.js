import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import { Chain } from '../chain.js';

Meteor.methods({
    'chain.updateStatus': function(){
        this.unblock();
        let url = RPC+'/status';
        try{
            let response = HTTP.get(url);
            let status = JSON.parse(response.content);
            status = status.result;
            let chain = {};
            chain.chainId = status.node_info.network;
            chain.latestBlockHeight = status.sync_info.latest_block_height;
            chain.latestBlockTime = status.sync_info.latest_block_time;
            Chain.update({chainId:chain.chainId}, {$set:chain}, {upsert: true});
            return chain.latestBlockHeight;
        }
        catch (e){
            return "Error getting chain status.";
        }
    },
    'chain.getLatestStatus': function(){
        Chain.find().sort({created:-1}).limit(1);
    }
})