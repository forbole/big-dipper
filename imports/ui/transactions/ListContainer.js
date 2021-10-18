import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Transactions } from '/imports/api/transactions/transactions.js';
import List from './List.jsx';

export default ValidatorDetailsContainer = withTracker((props) => {
    let transactionsHandle, transactionsExist;
    let loading = true;
    let transactions = [];

    if (Meteor.isClient){
        transactionsHandle = Meteor.subscribe('transactions.list', props.limit);
        loading = !transactionsHandle.ready();

        if (!loading) {
            transactions = Transactions.find({}, {sort:{height:-1}}).fetch();
            transactionsExist = !loading && !!transactions;
        }
    }

    if (Meteor.isServer){
        transactions = Transactions.find({}, {sort:{height:-1}}).fetch();
        transactionsExist = !!transactions;
    }
    
    return {
        loading,
        transactionsExist,
        transactions: transactions,
    };
})(List);