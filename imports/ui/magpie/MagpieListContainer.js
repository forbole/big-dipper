import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Posts, Likes } from '/imports/api/magpie/magpies.js';
import MagpieList from './MagpieList.jsx';

export default MagpieListContainer = withTracker((props) => {
    const magpieHandle = Meteor.subscribe('magpie.list', props.address);
    const loading = !magpieHandle.ready();
    const magpies = Posts.find({"external_owner":props.address});

    const magpieExist = !loading && !!magpies;
    
    // console.log(props.state.limit);
    return {
        loading,
        magpieExist,
        magpies: magpieExist ? magpies.fetch() : {}
    };
})(MagpieList);

