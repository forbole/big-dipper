import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { BlockScan } from '/imports/api/blocks/blocks.js';
import Block from './Block.jsx';

export default BlockContainer = withTracker((props) => {
    // console.log(props);
    // const transactionsHandle = Meteor.subscribe('transactions.findOne', props.match.params.txId);
    // const loading = !transactionsHandle.ready();
    // const transaction = Transactions.findOne({txhash: props.match.params.txId});
    // const transactionExist = !loading && !!transaction;
    return {
        // loading,
        // transactionExist,
        // transaction: transactionExist ? transaction : {},
    };
})(Block);