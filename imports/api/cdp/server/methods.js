import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import { CDPCollection } from '../cdp';


Meteor.methods({
    'cdp.list': function () {
        this.unblock();
        let collateralTypes = [];
        let CDPList = {};
        let cdp = CDPCollection.find().fetch();
        let parameters = cdp[0]?.parameters?.collateral_params;
        for(let c in parameters){
            collateralTypes[c] = parameters[c]?.type
        }
        
        for(let collateral in collateralTypes){
            let url = LCD + '/cdp/cdps/collateralType/' + collateralTypes[collateral];
            try {
                let result = HTTP.get(url);
                if (result.statusCode == 200) {
                    let list = JSON.parse(result.content).result;
                    CDPList[collateralTypes[collateral]] = list;

                }
                else {
                    console.log("No CDP for collateral type " + collateralTypes[collateral])
                }
            } catch (e) {
                console.log(e)
            }
        }

        if (CDPList){
            try{
                CDPCollection.upsert({}, { $set: { CDPList } });
            }
            catch(e){
                console.log("Error updating CDP list " + e)
            }
        }
        
        return CDPList;
    },
    'cdp.parameters': function () {
        this.unblock();
        let url = LCD + '/cdp/parameters';
        let parameters = {};

        try {
            let response = HTTP.get(url);
            if (response.statusCode == 200) {
                parameters = JSON.parse(response.content).result;
                CDPCollection.upsert({}, { $set: { parameters: parameters  } });
                return parameters
            }
        }
        catch (e) {
            console.log(e)
        }
    },

    'cdp.price': function (market) {
        this.unblock();
        let url = LCD + '/pricefeed/price/' + market;

        try {
            let response = HTTP.get(url);
            if (response.statusCode == 200) {
                price = JSON.parse(response.content).result.price;
                CDPCollection.upsert({}, { $set: { price: price } });
                return price
            }
        }
        catch (e) {
            console.log(e)
        }
    },

    'cdp.auctions': function () {
        this.unblock();
        let url = LCD + '/auction/auctions'

        try {
            let response = HTTP.get(url);
            if (response.statusCode == 200) {
                let auctions = JSON.parse(response.content).result;
                CDPCollection.upsert({}, { $set: { auctions: auctions } });
                return auctions
            }
        }
        catch (e) {
            console.log(url);
            console.log(e)
        }
    },

    'cdp.fetchList': function () {
        this.unblock();
        try{
            let cdp = CDPCollection.find().fetch();
            return cdp[0]
        }
        catch(e){
            console.log(e)
        }
    },

    'cdp.fetchParameters': function () {
        this.unblock();
        try {
            let cdp = CDPCollection.find().fetch();
            return cdp[0].parameters
        }
        catch (e) {
            console.log(e)
        }
    },

    //get Account CDP 
    'cdp.fetchAccount': function (address, collateralType) {
        this.unblock();

        try{
            let CDPList = CDPCollection.find().fetch();
            let findCDP = CDPList[0].CDPList[collateralType]
            for(let d in findCDP){
                if (findCDP[d].cdp.owner === address){
                    return findCDP[d]
                }
            }
        }
        catch(e){
            console.log(e)
        }
    },

    'cdp.fetchPrice': function () {
        this.unblock();
        try {
            let cdp = CDPCollection.find().fetch();
            return cdp[0].price
        }
        catch (e) {
            console.log(e)
        }
    },

    'cdp.fetchAuction': function () {
        this.unblock();
        try {
            let cdp = CDPCollection.find().fetch();
            return cdp[0].auctions
        }
        catch (e) {
            console.log(e)
        }
    },

})