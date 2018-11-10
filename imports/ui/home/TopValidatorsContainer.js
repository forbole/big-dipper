import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Chain } from '/imports/api/chain/chain.js';
import { Validators } from '/imports/api/validators/validators.js';
import TopValidators from './TopValidators.jsx';

export default TopValidatorsContainer = withTracker(() => {
    const chainHandle = Meteor.subscribe('chain.status');
    const validatorsHandle = Meteor.subscribe('validators.all');
    const loading = (!validatorsHandle.ready() && !chainHandle.ready());
    const status = Chain.findOne({chainId:Meteor.settings.public.chainId});
    const validators = Validators.find({jailed:false}).fetch();
    const validatorsExist = !loading && !!validators && !!status;
    // console.log(props.state.limit);
    return {
        loading,
        validatorsExist,
        status: validatorsExist ? status : {},
        validators: validatorsExist ? validators : {}
    };
})(TopValidators);

