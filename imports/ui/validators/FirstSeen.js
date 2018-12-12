import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Validators } from '/imports/api/validators/validators.js';
import FirstSeenList from './FirstSeenList.jsx';

export default FirstSeenListContainer = withTracker((props) => {
    const validatorsHandle = Meteor.subscribe('validators.all');
    const loading = !validatorsHandle.ready();
    const validators = Validators.find({},{sort:{firstseen:-1}}).fetch();
    const validatorsExist = !loading && !!validators;
    // console.log(props.state.limit);
    return {
        loading,
        validatorsExist,
        validators: validatorsExist ? validators : {},
    };
})(FirstSeenList);
