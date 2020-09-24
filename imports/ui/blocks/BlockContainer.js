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
        }).fetch() : {},
    };
})(Block);