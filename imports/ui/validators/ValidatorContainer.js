import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Validators } from '/imports/api/validators/validators.js';
import { ValidatorRecords } from '/imports/api/records/records.js';
import { Chain } from '/imports/api/chain/chain.js';
import Validator from './Validator.jsx';

export default ValidatorDetailsContainer = withTracker((props) => {
    const chainHandle = Meteor.subscribe('chain.status');
    const validatorsHandle = Meteor.subscribe('validator.details', props.address);
    // const validatorRecordsHandle = Meteor.subscribe('validator_records.uptime', props.address, Meteor.settings.public.uptimeWindow);
    const loading = !validatorsHandle.ready() && !chainHandle.ready();
    let options = {address:props.address};
    if (props.address.indexOf(Meteor.settings.public.bech32PrefixValAddr) != -1){
        options = {operator_address:props.address}
    }
    const validator = Validators.findOne(options);
    let validatorRecords;
    if (validator){
        validatorRecords = ValidatorRecords.find({address:validator.address}, {sort:{height:-1}}).fetch();
    }
    const chainStatus = Chain.findOne({chainId:Meteor.settings.public.chainId});
    const validatorExist = !loading && !!validator && !!validatorRecords && !!chainStatus;
    // console.log(props.state.limit);
    return {
        loading,
        validatorExist,
        validator: validatorExist ? validator : {},
        records: validatorExist ? validatorRecords : {},
        chainStatus: validatorExist ? chainStatus : {}
    };
})(Validator);
