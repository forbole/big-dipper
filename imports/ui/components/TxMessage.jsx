import React from 'react';

export const TxMessage = (props) => {
    switch (props.type){
        // bank
        case "cosmos-sdk/Send":
            return 
        case "cosmos-sdk/MultiSend":
            return 
        
        // staking
        case "cosmos-sdk/MsgCreateValidator":
            return 
        case "cosmos-sdk/MsgEditValidator":
            return 
        case "cosmos-sdk/MsgDelegate":
            return 
        case "cosmos-sdk/Undelegate":
            return 
        case "cosmos-sdk/BeginRedelegate":
            return 
        
        // gov
        case "cosmos-sdk/MsgSubmitProposal":
            return 
        case "cosmos-sdk/MsgDeposit":
            return 
        case "cosmos-sdk/MsgVote":
            return 
        
        // distribution
        case "cosmos-sdk/MsgWithdrawValidatorCommission":
            return 
        case "cosmos-sdk/MsgWithdrawDelegationReward":
            return 
        case "cosmos-sdk/MsgModifyWithdrawAddress":
            return 

        // slashing
        case "cosmos-sdk/MsgUnjail":
            return 
        
        // ibc
        case "cosmos-sdk/IBCTransferMsg":
            return 
        case "cosmos-sdk/IBCReceiveMsg":
            return 

        default:
            return <ul>
                <li>{JSON.stringify(props.value)}</li>
            </ul>
    }
}