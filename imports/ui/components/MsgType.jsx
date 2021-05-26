import React from 'react';
import { Badge } from 'reactstrap';
import i18n from 'meteor/universe:i18n';

const T = i18n.createComponent();

export const MsgType = (props) => {
    switch (props.type){
    // bank
    case "/cosmos.bank.v1beta1.MsgSend":
        return <Badge color="success"><T>messageTypes.send</T></Badge>
    case "/cosmos.bank.v1beta1.MsgMultiSend":
        return <Badge color="success"><T>messageTypes.multiSend</T></Badge>
        
        // staking
    case "/cosmos.staking.v1beta1.MsgCreateValidator":
        return <Badge color="warning"><T>messageTypes.createValidator</T></Badge>;
    case "/cosmos.staking.v1beta1.MsgEditValidator":
        return <Badge color="warning"><T>messageTypes.editValidator</T></Badge>;
    case "/cosmos.staking.v1beta1.MsgDelegate":
        return <Badge color="warning"><T>messageTypes.delegate</T></Badge>;
    case "/cosmos.staking.v1beta1.MsgUndelegate":
        return <Badge color="warning"><T>messageTypes.undelegate</T></Badge>;
    case "/cosmos.staking.v1beta1.MsgBeginRedelegate":
        return <Badge color="warning"><T>messageTypes.redelegate</T></Badge>;
        
        // gov
    case "/cosmos.gov.v1beta1.MsgSubmitProposal":
        return <Badge color="info"><T>messageTypes.submitProposal</T></Badge>
    case "/cosmos.gov.v1beta1.MsgDeposit":
        return <Badge color="info"><T>messageTypes.deposit</T></Badge>
    case "/cosmos.gov.v1beta1.MsgVote":
        return <Badge color="info"><T>messageTypes.vote</T></Badge>;
        
        // distribution
    case "/cosmos.distribution.v1beta1.MsgWithdrawValidatorCommission":
        return <Badge color="secondary"><T>messageTypes.withdrawComission</T></Badge>;
    case "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward":
        return <Badge color="secondary"><T>messageTypes.withdrawReward</T></Badge>;
    case "/cosmos.distribution.v1beta1.MsgModifyWithdrawAddress":
        return <Badge color="secondary"><T>messageTypes.modifyWithdrawAddress</T></Badge>;

        // slashing
    case "/cosmos.slashing.v1beta1.MsgUnjail":
        return <Badge color="danger"><T>messageTypes.unjail</T></Badge>;
        
        // ibc
    case "/cosmos.IBCTransferMsg":
        return <Badge style={{ backgroundColor: "#000080" }}><T>messageTypes.IBCTransfer</T></Badge>;
    case "/cosmos.IBCReceiveMsg":
        return <Badge style={{ backgroundColor: "#000080" }}><T>messageTypes.IBCReceive</T></Badge>;
    case "/ibc.core.client.v1.MsgCreateClient":
        return <Badge style={{ backgroundColor: "#000080" }}><T>messageTypes.IBCCreateClient</T></Badge>;
    case "/ibc.core.client.v1.MsgUpdateClient":
        return <Badge style={{ backgroundColor: "#000080" }}><T>messageTypes.IBCUpdateClient</T></Badge>;
    case "/ibc.core.client.v1.MsgUpgradeClient":
        return <Badge style={{ backgroundColor: "#000080" }}><T>messageTypes.IBCUpgradeClient</T></Badge>;
    case "/ibc.core.client.v1.MsgSubmitMisbehaviour":
        return <Badge style={{ backgroundColor: "#000080" }}><T>messageTypes.IBCSubmitMisbehaviour</T></Badge>;
    case "/ibc.core.channel.v1.MsgRecvPacket":
        return <Badge style={{ backgroundColor: "#000080" }}><T>messageTypes.ReceivePacket</T></Badge>;
    case "/ibc.core.connection.v1.MsgConnectionOpenConfirm":
        return <Badge style={{ backgroundColor: "#000080" }}><T>messageTypes.ConnectionOpenConfirm</T></Badge>;
    case "/ibc.core.connection.v1.MsgConnectionOpenTry":
        return <Badge style={{ backgroundColor: "#000080" }}><T>messageTypes.ConnectionOpenTry</T></Badge>;

    default:
        return <Badge color="primary">{props.type}</Badge>;
    }
}
