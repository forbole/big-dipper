import { Meteor } from 'meteor/meteor';
import { Delegations } from '../delegations.js';
import { Validators } from '../../validators/validators.js';
import { Cosmos } from '@forbole/cosmos-protobuf-js'

Meteor.methods({
    'delegations.getDelegations': async function(){
        this.unblock();
        let validators = Validators.find({}).fetch();
        let delegations = [];
        console.log("=== Getting delegations ===");
        for (v in validators){
            if (validators[v].operatorAddress){
                // let url = API + '/cosmos/staking/v1beta1/validators/'+validators[v].operatorAddress+"/delegations";
                try{
                    // let response = HTTP.get(url);
                    // if (response.statusCode == 200){
                    //     let delegation = JSON.parse(response.content).result;
                    //     // console.log(delegation);
                    //     delegations = delegations.concat(delegation);
                    // }
                    // else{
                    //     console.log(response.statusCode);
                    // }
                    let req = new Cosmos.Staking.QueryValidatorDelegationsRequest();
                    req.setValidatorAddr(validators[v].operatorAddress);
                    let delegations = await Cosmos.gRPC.unary(Cosmos.Staking.Query.ValidatorDelegations, req, GRPC);
                    console.log("delegations: %o", delegations);
                }
                catch (e){
                    // console.log(url);
                    console.log(e);
                }    
            }
        }

        for (i in delegations.delegationResponsesList){
            if (delegations.delegationResponsesList[i].delegation && delegations.delegationResponsesList[i].delegation.shares)
                delegations.delegationResponsesList[i].delegation.shares = parseFloat(delegations.delegationResponsesList[i].delegation.shares);
        }

        // console.log(delegations);
        let data = {
            delegations: delegations.delegationResponsesList,
            createdAt: new Date(),
        }

        return Delegations.insert(data);
    }
})