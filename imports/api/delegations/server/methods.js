import { Meteor } from 'meteor/meteor';
import { Delegations } from '../delegations.js';
import { Validators } from '../../validators/validators.js';

Meteor.methods({
    'delegations.getDelegations': async function(){
        this.unblock();
        let validators = Validators.find({}).fetch();
        let delegations = [];
        console.log("=== Getting delegations ===");
        for (v in validators){
            if (validators[v].operator_address){
                let url = API + '/cosmos/staking/v1beta1/validators/'+validators[v].operatorAddress+"/delegations";
                try{
                    let response = HTTP.get(url);
                    if (response.statusCode == 200){
                        let delegation = JSON.parse(response.content).result;
                        // console.log(delegation);
                        delegations = delegations.concat(delegation);
                    }
                    else{
                        console.log(response.statusCode);
                    }
                }
                catch (e){
                    // console.log(url);
                    console.log(e);
                }    
            }
        }

        let data = {
            delegations: delegations,
            createdAt: new Date(),
        }

        return Delegations.insert(data);
    }
})