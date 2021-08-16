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
    case "/ibc.core.client.v1.Height":
        return <Badge style={{ backgroundColor: "#000080" }}><T>messageTypes.IBCHeight</T></Badge>;
            
    case "/ibc.core.channel.v1.MsgRecvPacket":
        return <Badge style={{ backgroundColor: "#000080" }}><T>messageTypes.IBCReceivePacket</T></Badge>;
    case "/ibc.core.channel.v1.Channel":
        return <Badge style={{ backgroundColor: "#000080" }}><T>messageTypes.IBCChannel</T></Badge>;
    case "/ibc.core.channel.v1.Counterparty":
        return <Badge style={{ backgroundColor: "#000080" }}><T>messageTypes.IBCCounterparty</T></Badge>;
    case "/ibc.core.channel.v1.Packet":
        return <Badge style={{ backgroundColor: "#000080" }}><T>messageTypes.IBCPacket</T></Badge>;
    case "/ibc.core.channel.v1.MsgAcknowledgement":
        return <Badge style={{ backgroundColor: "#000080" }}><T>messageTypes.IBCAcknowledgement</T></Badge>;
    case "/ibc.core.channel.v1.MsgChannelCloseConfirm":
        return <Badge style={{ backgroundColor: "#000080" }}><T>messageTypes.IBCChannelCloseConfirm</T></Badge>;
    case "/ibc.core.channel.v1.MsgChannelCloseInit":
        return <Badge style={{ backgroundColor: "#000080" }}><T>messageTypes.IBCChannelCloseInit</T></Badge>;
    case "/ibc.core.channel.v1.MsgChannelOpenAck":
        return <Badge style={{ backgroundColor: "#000080" }}><T>messageTypes.IBCChannelOpenAck</T></Badge>;
    case "/ibc.core.channel.v1.MsgChannelOpenConfirm":
        return <Badge style={{ backgroundColor: "#000080" }}><T>messageTypes.IBCChannelOpenConfirm</T></Badge>;
    case "/ibc.core.channel.v1.MsgChannelOpenInit":
        return <Badge style={{ backgroundColor: "#000080" }}><T>messageTypes.IBCChannelOpenInit</T></Badge>;
    case "/ibc.core.channel.v1.MsgChannelOpenTry":
        return <Badge style={{ backgroundColor: "#000080" }}><T>messageTypes.IBCChannelOpenTry</T></Badge>;
    case "/ibc.core.channel.v1.MsgTimeout":
        return <Badge style={{ backgroundColor: "#000080" }}><T>messageTypes.IBCTimeout</T></Badge>;
    case "/ibc.core.channel.v1.MsgTimeoutOnClose":
        return <Badge style={{ backgroundColor: "#000080" }}><T>messageTypes.IBCTimeoutOnClose</T></Badge>;

    case "/ibc.core.connection.v1.MsgConnectionOpenAck":
        return <Badge style={{ backgroundColor: "#000080" }}><T>messageTypes.IBCConnectionOpenAck</T></Badge>;
    case "/ibc.core.connection.v1.MsgConnectionOpenConfirm":
        return <Badge style={{ backgroundColor: "#000080" }}><T>messageTypes.IBCConnectionOpenConfirm</T></Badge>;
    case "/ibc.core.connection.v1.MsgConnectionOpenInit":
        return <Badge style={{ backgroundColor: "#000080" }}><T>messageTypes.IBCConnectionOpenInit</T></Badge>;
    case "/ibc.core.connection.v1.MsgConnectionOpenTry":
        return <Badge style={{ backgroundColor: "#000080" }}><T>messageTypes.IBCConnectionOpenTry</T></Badge>;
    case "/ibc.core.connection.v1.ConnectionEnd":
        return <Badge style={{ backgroundColor: "#000080" }}><T>messageTypes.IBCConnectionEnd</T></Badge>;
    case "/ibc.core.connection.v1.Counterparty":
        return <Badge style={{ backgroundColor: "#000080" }}><T>messageTypes.IBCCounterparty</T></Badge>;
    case "/ibc.core.connection.v1.Version":
        return <Badge style={{ backgroundColor: "#000080" }}><T>messageTypes.IBCVersion</T></Badge>;

    case "/ibc.applications.transfer.v1.MsgTransfer":
        return <span className="mr-1"><Badge style={{ backgroundColor: "#000080" }}><T>messageTypes.IBCMsgTransfer</T></Badge></span>;

    default:
        return <Badge color="primary">{props.type}</Badge>;
    }
}
