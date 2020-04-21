import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';

Meteor.methods({
    'bep3.getSwap': function(swapID){
        this.unblock();
        let url = LCD + '/bep3/swap/'+ swapID;
        try{
            let response = HTTP.get(url);
            if (response.statusCode == 200){
                return JSON.parse(response.content).result;
            }
        }
        catch (e){
            console.log(e)
        }
    },

    'bep3.createSwap': function(){
        this.unblock();
        let url = LCD +'bep3/swap/create';
        try{
            let response = HTTP.get(url);
            if (response.statusCode == 200){
                return JSON.parse(response.content).result;
            }
        }
        catch (e){
            console.log(e)
        }
    }



})