/* eslint-disable no-await-in-loop */
/* eslint-disable no-loop-func */
import { Meteor } from 'meteor/meteor';
import { Delegations } from '../delegations.js';
import { Validators } from '../../validators/validators.js';
import fetch from 'node-fetch'


Meteor.methods({
    'delegations.getDelegations': async function(){
        this.unblock();
        let validators = Validators.find({}).fetch();
        let delegations = [];
        console.log("=== Getting delegations ===");
        for (v in validators){
            if (validators[v].operator_address){
                let url = API + '/cosmos/staking/v1beta1/validators/'+validators[v].operatorAddress+"/delegations";
                try {
                    await fetch(url)
                        .then(function (response) {
                            if (response.ok) {
                                response.json().then((data) => {
                                    let delegation = data.result;
                                    delegations = delegations.concat(delegation);
                                })
                            }
                        });
                }
                catch (e) {
                    console.log(url);
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