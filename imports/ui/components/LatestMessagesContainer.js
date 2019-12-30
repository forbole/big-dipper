import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Transactions } from '/imports/api/transactions/transactions.js';
import LatestMessages from './LatestMessages.jsx';

export default LatestMessagesContainer = withTracker((props) => {
    let messagesHandle;
    let loading = true;

    // if (Meteor.isClient){
    messagesHandle = Meteor.subscribe('posts.latest');
    loading = !messagesHandle.ready();
    const messages = Transactions.find({}, {sort:{height:-1}}).fetch();
    const messagesExist = !loading && !!messages;
    // }
    
    return {
        loading,
        messagesExist,
        messages: messagesExist ? messages : {},
    };
})(LatestMessages);

