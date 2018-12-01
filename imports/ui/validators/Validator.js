import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Validators } from '/imports/api/validators/validators.js';
import Validator from './Validator.jsx';

export default ValidatorDetailsContainer = withTracker((props) => {
    const validatorsHandle = Meteor.subscribe('validators.all');
    const loading = !validatorsHandle.ready();
    const validator = Validators.find({address:props.address}).fetch();
    const validatorExist = !loading && !!validator;
    // console.log(props.state.limit);
    return {
        loading,
        validatorExist,
        validator: validatorExist ? validator : {}
    };
})(Validator);
