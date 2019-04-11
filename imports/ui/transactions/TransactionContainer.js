import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Transactions } from '/imports/api/transactions/transactions.js';
import Transaction from './Transaction.jsx';

export default TransactionContainer = withTracker((props) => {
    // console.log(props);
    const transactionsHandle = Meteor.subscribe('transactions.findOne', props.match.params.txId);
    const loading = !transactionsHandle.ready();
    const transaction = Transactions.findOne({txhash: props.match.params.txId});
    const transactionExist = !loading && !!transaction;
    return {
        loading,
        transactionExist,
        transaction: transactionExist ? transaction : {},
    };
})(Transaction);