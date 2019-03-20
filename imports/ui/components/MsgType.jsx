import React from 'react';
import { Badge } from 'reactstrap';

export const MsgType = (props) => {
    switch (props.type){
        // bank
        case "cosmos-sdk/Send":
            return <Badge color="success">Send</Badge>
        case "cosmos-sdk/MultiSend":
            return <Badge color="success">Multi Send</Badge>
        
        // staking
        case "cosmos-sdk/MsgCreateValidator":
            return <Badge color="warning">Create Validator</Badge>;
        case "cosmos-sdk/MsgEditValidator":
            return <Badge color="warning">Edit Validator</Badge>;
        case "cosmos-sdk/MsgDelegate":
            return <Badge color="warning">Delegate</Badge>;
        case "cosmos-sdk/MsgUndelegate":
            return <Badge color="warning">Undelegate</Badge>;
        case "cosmos-sdk/MsgBeginRedelegate":
            return <Badge color="warning">Redelegate</Badge>;
        
        // gov
        case "cosmos-sdk/MsgSubmitProposal":
            return <Badge color="info">Submit Proposal</Badge>
        case "cosmos-sdk/MsgDeposit":
            return <Badge color="info">Deposit</Badge>
        case "cosmos-sdk/MsgVote":
            return <Badge color="info">Vote</Badge>;
        
        // distribution
        case "cosmos-sdk/MsgWithdrawValidatorCommission":
            return <Badge color="secondary">Withdraw Commission</Badge>;
        case "cosmos-sdk/MsgWithdrawDelegationReward":
            return <Badge color="secondary">Withdraw Reward</Badge>;
        case "cosmos-sdk/MsgModifyWithdrawAddress":
            return <Badge color="secondary">Modify Withdraw Address</Badge>;

        // slashing
        case "cosmos-sdk/MsgUnjail":
            return <Badge color="danger">Unjail</Badge>;
        
        // ibc
        case "cosmos-sdk/IBCTransferMsg":
            return <Badge color="dark">IBC Transfer</Badge>;
        case "cosmos-sdk/IBCReceiveMsg":
            return <Badge color="dark">IBC Receive</Badge>;

        default:
            return <Badge color="primary">{props.type}</Badge>;
    }
}