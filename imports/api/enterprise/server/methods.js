import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import { Enterprise } from '../enterprise.js';

Meteor.methods({
    'enterprise.getPurchaseOrders': function(){
        this.unblock();
        try{
            let url = LCD + '/enterprise/pos';
            let response = HTTP.get(url);
            let purchaseOrders = JSON.parse(response.content).result;

            let finishedPurchaseOrders = new Set(Enterprise.find(
                {"status":{$in:["reject", "complete"]}}
            ).fetch().map((p)=> p.poId));

            let poIds = [];

            if (purchaseOrders.length > 0) {
                const bulkPos = Enterprise.rawCollection().initializeUnorderedBulkOp();
                for (let i in purchaseOrders) {
                    let po = purchaseOrders[i]
                    po.poId = parseInt(po.id);
                    if (po.poId > 0 && !finishedPurchaseOrders.has(po.poId)) {
                        try {
                            bulkPos.find({poId: po.poId}).upsert().updateOne({$set: po});
                            poIds.push(po.poId);
                        } catch(e) {
                            bulkPos.find({poId: po.poId}).upsert().updateOne({$set: po});
                            poIds.push(po.poId);
                            console.log(e.response.content);
                        }
                    }
                }
                if(poIds.length > 0) {
                    bulkPos.execute();
                }
            }
            return true
        }
        catch (e){
            console.log(e);
        }
    }
})
