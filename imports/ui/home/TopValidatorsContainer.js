import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Chain } from '/imports/api/chain/chain.js';
import { Validators } from '/imports/api/validators/validators.js';
import TopValidators from './TopValidators.jsx';

export default TopValidatorsContainer = withTracker(() => {
    let chainHandle;
    let validatorsHandle;
    let loading = true;

    if (Meteor.isClient){
        chainHandle = Meteor.subscribe('chain.status');
        validatorsHandle = Meteor.subscribe('validators.all');
        loading = (!validatorsHandle.ready() && !chainHandle.ready());    
    }

    let status;
    let validators;

    if (Meteor.isServer || !loading){
        status = Chain.findOne({chainId:Meteor.settings.public.chainId});
        validators = Validators.find({status: 2, jailed:false}).fetch();
        loading = false;
    }

    const validatorsExist = !loading && !!validators && !!status;
    // console.log(props.state.limit);
    return {
        loading,
        validatorsExist,
        status: validatorsExist ? status : {},
        validators: validatorsExist ? validators : {}
    };
})(TopValidators);

