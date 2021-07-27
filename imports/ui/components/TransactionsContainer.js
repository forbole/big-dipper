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
        clpTxs: transactionsExist ? Transactions.find({
            $or: [
                {"tx.value.msg.type":"clp/Swap"},
                {"tx.value.msg.type":"clp/AddLiquidity"},
                {"tx.value.msg.type":"clp/CreatePool"},
                {"tx.value.msg.type":"clp/RemoveLiquidity"}
            ]
        }).fetch() : {},
        pegTxs: transactionsExist ? Transactions.find({
            $or: [
                {"tx.value.msg.type":"ethbridge/MsgLock"},
                {"tx.value.msg.type":"ethbridge/MsgBurn"},
                {"tx.value.msg.type":"ethbridge/MsgCreateEthBridgeClaim"},
            ]
        }).fetch() : {},           
        transferTxs: transactionsExist ? Transactions.find({
            $or: [
                {"tx.body.messages.@type":"/cosmos.bank.v1beta1.MsgSend"},
                {"tx.body.messages.@type":"/cosmos.bank.v1beta1.MsgMultiSend"}
            ]
        }).fetch() : {},
        stakingTxs: transactionsExist ? Transactions.find({
            $or: [
                {"tx.body.messages.@type":"/cosmos.staking.v1beta1.MsgCreateValidator"},
                {"tx.body.messages.@type":"/cosmos.staking.v1beta1.MsgEditValidator"},
                {"tx.body.messages.@type":"/cosmos.staking.v1beta1.MsgDelegate"},
                {"tx.body.messages.@type":"/cosmos.staking.v1beta1.MsgUndelegate"},
                {"tx.body.messages.@type":"/cosmos.staking.v1beta1.MsgBeginRedelegate"}
            ]
        }).fetch() : {},
        distributionTxs: transactionsExist ? Transactions.find({
            $or: [
                {"tx.body.messages.@type":"/cosmos.distribution.v1beta1.MsgWithdrawValidatorCommission"},
                {"tx.body.messages.@type":"/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward"},
                {"tx.body.messages.@type":"/cosmos.distribution.v1beta1.MsgModifyWithdrawAddress"}
            ]
        }).fetch() : {},
        governanceTxs: transactionsExist ? Transactions.find({
            $or: [
                {"tx.body.messages.@type":"/cosmos.gov.v1beta1.MsgSubmitProposal"},
                {"tx.body.messages.@type":"/cosmos.gov.v1beta1.MsgDeposit"},
                {"tx.body.messages.@type":"/cosmos.gov.v1beta1.MsgVote"}
            ]
        }).fetch() : {},
        slashingTxs: transactionsExist ? Transactions.find({
            $or: [
                {"tx.body.messages.@type":"/cosmos.slashing.v1beta1.MsgUnjail"}
            ]
        }).fetch() : {},
        IBCTxs: transactionsExist ? Transactions.find({
            $or: [
                {"tx.body.messages.@type":"/cosmos.IBCTransferMsg"},
                {"tx.body.messages.@type":"/cosmos.IBCReceiveMsg"}
            ]
        }).fetch() : {}
    };
})(ValidatorTransactions);
