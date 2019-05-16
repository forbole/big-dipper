import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Blockscon } from '/imports/api/blocks/blocks.js';
import { Transactions } from '/imports/api/transactions/transactions.js';
import Block from './Block.jsx';

export default BlockContainer = withTracker((props) => {
    let blockHandle, transactionHandle;
    let loading = true;

    if (Meteor.isClient){
        blockHandle = Meteor.subscribe('blocks.findOne', parseInt(props.match.params.blockId));
        transactionHandle = Meteor.subscribe('transactions.height', parseInt(props.match.params.blockId));
        loading = !blockHandle.ready() && !transactionHandle.ready();    
    }

    let block, txs, transactionsExist, blockExist;

    if (Meteor.isServer || !loading){
        block = Blockscon.findOne({height: parseInt(props.match.params.blockId)});
        txs = Transactions.find({height:parseInt(props.match.params.blockId)});

        if (Meteor.isServer){
            loading = false;
            transactionsExist = !!txs;
            blockExist = !!block;
        }
        else{
            transactionsExist = !loading && !!txs;
            blockExist = !loading && !!block;
        }
        
    }

    return {
        loading,
        blockExist,
        transactionsExist,
        block: blockExist ? block : {},
        transferTxs: transactionsExist ? Transactions.find({
            $or: [
                {"tx.value.msg.type":"irishub/bank/Send"}
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
        }).fetch() : {}
    };
})(Block);