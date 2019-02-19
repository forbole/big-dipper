import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Transactions } from '/imports/api/transactions/transactions.js';
import List from './List.jsx';

export default ValidatorDetailsContainer = withTracker((props) => {
    const transactionsHandle = Meteor.subscribe('transactions.list', props.limit);
    const loading = (!transactionsHandle.ready() && props.limit == Meteor.settings.public.initialPageSize);
    const transactions = Transactions.find({}, {sort:{height:-1}}).fetch();
    const transactionsExist = !loading && !!transactions;
    // console.log(props.state.limit);
    return {
        loading,
        transactionsExist,
        transactions: transactionsExist ? transactions : {},
    };
})(List);