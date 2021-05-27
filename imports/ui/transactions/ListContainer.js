import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Transactions } from '/imports/api/transactions/transactions.js';
import List from './List.jsx';

export default ValidatorDetailsContainer = withTracker((props) => {
    let transactionsHandle, transactions, transactionsExist;
    let loading = true;

    if (Meteor.isClient){
        transactionsHandle = Meteor.subscribe('transactions.list', 2200);
        loading = !transactionsHandle.ready() && props.limit == Meteor.settings.public.initialPageSize;

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
        transactions: transactionsExist ? transactions : {},
        transactionsCount: transactionsExist ? transactions.length : 0
    };
})(List);