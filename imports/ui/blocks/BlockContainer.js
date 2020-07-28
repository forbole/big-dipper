import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Blockscon } from '/imports/api/blocks/blocks.js';
import { Transactions } from '/imports/api/transactions/transactions.js';
import Block from './Block.jsx';

export default BlockContainer = withTracker((props) => {
    let blockHandle, transactionHandle;
    let loading = true;

    if (Meteor.isClient) {
        blockHandle = Meteor.subscribe('blocks.findOne', parseInt(props.match.params.blockId));
        transactionHandle = Meteor.subscribe('transactions.height', parseInt(props.match.params.blockId));
        loading = !blockHandle.ready() && !transactionHandle.ready();
    }

    let block, txs, transactionsExist, blockExist;

    if (Meteor.isServer || !loading) {
        block = Blockscon.findOne({ height: parseInt(props.match.params.blockId) });
        txs = Transactions.find({ height: parseInt(props.match.params.blockId) });

        if (Meteor.isServer) {
            loading = false;
            transactionsExist = !!txs;
            blockExist = !!block;
        }
        else {
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
                { "tx.value.msg.type": "cosmos-sdk/MsgSend" },
                { "tx.value.msg.type": "cosmos-sdk/MsgMultiSend" }
            ]
        }).fetch() : {},
        cdpTxs: transactionsExist ? Transactions.find({
            $or: [
                { "tx.value.msg.type": "cdp/MsgCreateCDP" },
                { "tx.value.msg.type": "cdp/MsgDeposit" },
                { "tx.value.msg.type": "cdp/MsgWithdraw" },
                { "tx.value.msg.type": "cdp/MsgDrawDebt" },
                { "tx.value.msg.type": "cdp/MsgRepayDebt" }
            ]
        }).fetch() : {},
        swapTxs: transactionsExist ? Transactions.find({
            $or: [
                { "tx.value.msg.type": "bep3/MsgClaimAtomicSwap" },
                { "tx.value.msg.type": "bep3/MsgCreateAtomicSwap" }
            ]
        }).fetch() : {},
        incentiveTxs: transactionsExist ? Transactions.find({
            $or: [
                { "tx.value.msg.type": "incentive/MsgClaimReward" },
            ]
        }).fetch() : {},
        auctionTxs: transactionsExist ? Transactions.find({
            $or: [
                { "tx.value.msg.type": "auction/MsgPlaceBid" },
            ]
        }).fetch() : {},
        priceTxs: transactionsExist ? Transactions.find({
            $or: [
                { "tx.value.msg.type": "pricefeed/MsgPostPrice" }
            ]
        }).fetch() : {},
        stakingTxs: transactionsExist ? Transactions.find({
            $or: [
                { "tx.value.msg.type": "cosmos-sdk/MsgCreateValidator" },
                { "tx.value.msg.type": "cosmos-sdk/MsgEditValidator" },
                { "tx.value.msg.type": "cosmos-sdk/MsgDelegate" },
                { "tx.value.msg.type": "cosmos-sdk/MsgUndelegate" },
                { "tx.value.msg.type": "cosmos-sdk/MsgBeginRedelegate" }
            ]
        }).fetch() : {},
        distributionTxs: transactionsExist ? Transactions.find({
            $or: [
                { "tx.value.msg.type": "cosmos-sdk/MsgWithdrawValidatorCommission" },
                { "tx.value.msg.type": "cosmos-sdk/MsgWithdrawDelegationReward" },
                { "tx.value.msg.type": "cosmos-sdk/MsgModifyWithdrawAddress" }
            ]
        }).fetch() : {},
        governanceTxs: transactionsExist ? Transactions.find({
            $or: [
                { "tx.value.msg.type": "cosmos-sdk/MsgSubmitProposal" },
                { "tx.value.msg.type": "cosmos-sdk/MsgDeposit" },
                { "tx.value.msg.type": "cosmos-sdk/MsgVote" }
            ]
        }).fetch() : {},
        slashingTxs: transactionsExist ? Transactions.find({
            $or: [
                { "tx.value.msg.type": "cosmos-sdk/MsgUnjail" }
            ]
        }).fetch() : {},
        IBCTxs: transactionsExist ? Transactions.find({
            $or: [
                { "tx.value.msg.type": "cosmos-sdk/IBCTransferMsg" },
                { "tx.value.msg.type": "cosmos-sdk/IBCReceiveMsg" }
            ]
        }).fetch() : {},
    };
})(Block);