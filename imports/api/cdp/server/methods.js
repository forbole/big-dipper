import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import { CDP } from '../cdp';


Meteor.methods({
    'cdp.list': function () {
        this.unblock();
        let collateralTypes = ['ukava-a', 'bnb-a', 'hard-a', 'btcb-a', 'xrpb-a', 'busd-a', 'busd-b']
        let CDPList = {};
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

        CDP.upsert({}, { $set: { CDPList }});
        return CDPList;
    },
    'cdp.parameters': function () {
        this.unblock();
        let url = LCD + '/cdp/parameters';
        let cdpParams = {};

        try {
            let response = HTTP.get(url);
            if (response.statusCode == 200) {
                cdpParams = JSON.parse(response.content).result;
                return cdpParams
            }
        }
        catch (e) {
            console.log(e)
        }
    },

    'cdp.price': function (market) {
        this.unblock();
        let url = LCD + '/pricefeed/price/' + market;
        let cdpPrice = null;

        try {
            let response = HTTP.get(url);
            if (response.statusCode == 200) {
                cdpPrice = JSON.parse(response.content).result.price;
                return cdpPrice
            }
        }
        catch (e) {
            console.log(e)
        }
    },

    'cdp.deposits': function (address, collateral) {
        this.unblock();
        let url = LCD + '/cdp/cdps/cdp/deposits/' + address + '/' + collateral;

        try {
            let response = HTTP.get(url);
            if (response.statusCode == 200) {
                return JSON.parse(response.content).result
            }
        }
        catch (e) {
            console.log(url);
            console.log(e)
        }
    },

})