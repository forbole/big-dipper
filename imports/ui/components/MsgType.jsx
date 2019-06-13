import React from 'react';
import { Badge } from 'reactstrap';

export const MsgType = (props) => {
    switch (props.type){
        // bank
        case "pay/MsgSend":
            return <Badge color="success">Send</Badge>
        case "pay/MsgMultiSend":
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

        // market
        case "market/MsgSwap":
            return <Badge color="info">Swap</Badge>
        
        // oracle
        case "oracle/MsgPriceVote":
            return <Badge color="dark">Vote Price</Badge>
        case "oracle/MsgPricePrevote":
            return <Badge color="dark">PreVote Price</Badge>
        case "oracle/MsgDelegateFeederPermission":
            return <Badge color="dark">PreVote Price</Badge>
                    
        // budget
        case "budget/MsgSubmitProgram":
            return <Badge color="primary">Submit Program</Badge>
        case "budget/MsgWithdrawProgram":
            return <Badge color="primary">Withdraw Program</Badge>
        case "budget/MsgVoteProgram":
            return <Badge color="primary">Vote Program</Badge>

        default:
            return <Badge color="primary">{props.type}</Badge>;
    }
}