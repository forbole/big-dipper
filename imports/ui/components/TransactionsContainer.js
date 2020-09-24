import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Transactions } from '/imports/api/transactions/transactions.js';
import ValidatorTransactions from './Transactions.jsx';

export default TransactionsContainer = withTracker((props) => {
    let transactionsHandle, transactions, transactionsExist;
    let loading = true;

    if (Meteor.isClient){
        transactionsHandle = Meteor.subscribe('transactions.validator', props.validator, props.delegator, props.limit);
        loading = !transactionsHandle.ready();
    }

    if (Meteor.isServer || !loading){
        transactions = Transactions.find({}, {sort:{height:-1}});

        if (Meteor.isServer){
            loading = false;
            transactionsExist = !!transactions;
        }
        else{
            transactionsExist = !loading && !!transactions;
        }
    }

    return {
        loading,
        transactionsExist,
        transferTxs: transactionsExist ? Transactions.find({
            $or: [
                {"tx.body.messages.type":"cosmos-sdk/MsgSend"},
                {"tx.body.messages.type":"cosmos-sdk/MsgMultiSend"}
            ]
        }).fetch() : {},
        stakingTxs: transactionsExist ? Transactions.find({
            $or: [
                {"tx.body.messages.type":"cosmos-sdk/MsgCreateValidator"},
                {"tx.body.messages.type":"cosmos-sdk/MsgEditValidator"},
                {"tx.body.messages.type":"cosmos-sdk/MsgDelegate"},
                {"tx.body.messages.type":"cosmos-sdk/MsgUndelegate"},
                {"tx.body.messages.type":"cosmos-sdk/MsgBeginRedelegate"}
            ]
        }).fetch() : {},
        distributionTxs: transactionsExist ? Transactions.find({
            $or: [
                {"tx.body.messages.type":"cosmos-sdk/MsgWithdrawValidatorCommission"},
                {"tx.body.messages.type":"cosmos-sdk/MsgWithdrawDelegationReward"},
                {"tx.body.messages.type":"cosmos-sdk/MsgModifyWithdrawAddress"}
            ]
        }).fetch() : {},
        governanceTxs: transactionsExist ? Transactions.find({
            $or: [
                {"tx.body.messages.type":"cosmos-sdk/MsgSubmitProposal"},
                {"tx.body.messages.type":"cosmos-sdk/MsgDeposit"},
                {"tx.body.messages.type":"cosmos-sdk/MsgVote"}
            ]
        }).fetch() : {},
        slashingTxs: transactionsExist ? Transactions.find({
            $or: [
                {"tx.body.messages.type":"cosmos-sdk/MsgUnjail"}
            ]
        }).fetch() : {},
        IBCTxs: transactionsExist ? Transactions.find({
            $or: [
                {"tx.body.messages.type":"cosmos-sdk/IBCTransferMsg"},
                {"tx.body.messages.type":"cosmos-sdk/IBCReceiveMsg"}
            ]
        }).fetch() : {}
    };
})(ValidatorTransactions);
