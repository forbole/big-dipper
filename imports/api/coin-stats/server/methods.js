import { Meteor } from 'meteor/meteor';
import { CoinStats } from '../coin-stats.js';
import fetch from 'node-fetch'


Meteor.methods({
    'coinStats.getCoinStats': async function(){
        this.unblock();
        let coinId = Meteor.settings.public.coingeckoId;
        if (coinId){
            try{
                let now = new Date();
                now.setMinutes(0);
                let url = "https://api.coingecko.com/api/v3/simple/price?ids="+coinId+"&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true";
                try {
                    await fetch(url)
                        .then(function (response) {
                            if (response.ok) {
                                response.json().then((data) => {
                                    let coinData = data;
                                    coinData = coinData[coinId];
                                    return CoinStats.upsert({ last_updated_at: coinData.last_updated_at }, { $set: coinData });
                                })
                            }
                        });
                }
                catch (e) {
                    console.log(url);
                    console.log(e);
                }
            }
            catch(e){
                console.log(url);
                console.log(e);
            }
        }
        else{
            return "No coingecko Id provided."
        }
    },
    'coinStats.getStats': function(){
        this.unblock();
        let coinId = Meteor.settings.public.coingeckoId;
        if (coinId){
            return (CoinStats.findOne({},{sort:{last_updated_at:-1}}));
        }
        else{
            return "No coingecko Id provided.";
        }

    }
})