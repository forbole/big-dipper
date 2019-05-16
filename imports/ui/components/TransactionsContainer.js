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
                {"tx.value.msg.type":"irishub/bank/Send"},
            ]
        }).fetch() : {},
        stakingTxs: transactionsExist ? Transactions.find({
            $or: [
                {"tx.value.msg.type":"irishub/stake/MsgCreateValidator"},
                {"tx.value.msg.type":"irishub/stake/MsgEditValidator"},
                {"tx.value.msg.type":"irishub/stake/MsgDelegate"},
                {"tx.value.msg.type":"irishub/stake/BeginUnbonding"},
                {"tx.value.msg.type":"irishub/stake/BeginRedelegate"}
            ]
        }).fetch() : {},
        distributionTxs: transactionsExist ? Transactions.find({
            $or: [
                {"tx.value.msg.type":"irishub/distr/MsgWithdrawDelegationRewardsAll"},
                {"tx.value.msg.type":"irishub/distr/MsgWithdrawValidatorRewardsAll"},
                {"tx.value.msg.type":"irishub/distr/MsgWithdrawDelegationReward"},
                {"tx.value.msg.type":"irishub/distr/MsgModifyWithdrawAddress"}
            ]
        }).fetch() : {},
        governanceTxs: transactionsExist ? Transactions.find({
            $or: [
                {"tx.value.msg.type":"irishub/gov/MsgSubmitProposal"},
                {"tx.value.msg.type":"irishub/gov/MsgDeposit"},
                {"tx.value.msg.type":"irishub/gov/MsgVote"}
            ]
        }).fetch() : {},
        slashingTxs: transactionsExist ? Transactions.find({
            $or: [
                {"tx.value.msg.type":"irishub/slashing/MsgUnjail"}
            ]
        }).fetch() : {},
        IBCTxs: transactionsExist ? Transactions.find({
            $or: [
                {"tx.value.msg.type":"cosmos-sdk/IBCTransferMsg"},
                {"tx.value.msg.type":"cosmos-sdk/IBCReceiveMsg"}
            ]
        }).fetch() : {}
    };
})(ValidatorTransactions);
