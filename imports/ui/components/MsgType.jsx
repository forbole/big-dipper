import React from 'react';
import { Badge } from 'reactstrap';

export const MsgType = (props) => {
    switch (props.type){
        // bank
        case "irishub/bank/Send":
            return <Badge color="success">Send</Badge>
        case "irishub/bank/Issue":
            return <Badge color="success">Issue</Badge>
        case "irishub/bank/Burn":
            return <Badge color="success">Burn</Badge>
        
        // staking
        case "irishub/stake/MsgCreateValidator":
            return <Badge color="warning">Create Validator</Badge>;
        case "irishub/stake/MsgEditValidator":
            return <Badge color="warning">Edit Validator</Badge>;
        case "irishub/stake/MsgDelegate":
            return <Badge color="warning">Delegate</Badge>;
        case "irishub/stake/Undelegate":
            return <Badge color="warning">Undelegate</Badge>;
        case "irishub/stake/BeginRedelegate":
            return <Badge color="warning">Redelegate</Badge>;
        
        // gov
        case "irishub/gov/MsgSubmitProposal":
            return <Badge color="info">Submit Proposal</Badge>
        case "irishub/gov/MsgSubmitTxTaxUsageProposal":
            return <Badge color="info">Submit Tax Usage Proposal</Badge>
        case "irishub/gov/MsgSubmitSoftwareUpgradeProposal":
            return <Badge color="info">Submit Upgrade Proposal</Badge>
        case "irishub/gov/MsgDeposit":
            return <Badge color="info">Deposit</Badge>
        case "irishub/gov/MsgVote":
            return <Badge color="info">Vote</Badge>;
        
        // distribution
        case "irishub/distr/MsgWithdrawDelegationRewardsAll":
            return <Badge color="secondary">Withdraw All Delegation Rewards</Badge>;
        case "irishub/distr/MsgWithdrawDelegationReward":
            return <Badge color="secondary">Withdraw Rewards</Badge>;
        case "irishub/distr/MsgWithdrawValidatorRewardsAll":
            return <Badge color="secondary">Withdraw Validator Rewards</Badge>;
        case "irishub/distr/MsgModifyWithdrawAddress":
            return <Badge color="secondary">Modify Withdraw Address</Badge>;

        // slashing
        case "irishub/slashing/MsgUnjail":
            return <Badge color="danger">Unjail</Badge>;
        
        // guardian
        case "irishub/guardian/MsgAddProfiler":
            return <Badge color="light">Add Profiler</Badge>;
        case "irishub/guardian/MsgAddTrustee":
            return <Badge color="light">Add Trustee</Badge>;
        case "irishub/guardian/MsgDeleteProfiler":
            return <Badge color="light">Delete Profiler</Badge>;
        case "irishub/guardian/MsgDeleteTrustee":
            return <Badge color="light">Delete Trustee</Badge>;
 
        // services
        case "irishub/service/MsgSvcDef":
            return <Badge color="light">Define Service</Badge>;
        case "irishub/service/MsgSvcBinding":
            return <Badge color="light">Bind Service</Badge>;
        case "irishub/service/MsgSvcBindingUpdate":
            return <Badge color="light">Update Service Binding</Badge>;
        case "irishub/service/MsgSvcDisable":
            return <Badge color="light">Disable Service</Badge>;
        case "irishub/service/MsgSvcEnable":
            return <Badge color="light">Enable Service</Badge>;
        case "irishub/service/MsgSvcRefundDeposit":
            return <Badge color="light">Deposit Refund</Badge>;
        case "irishub/service/MsgSvcRequest":
            return <Badge color="light">Request Service</Badge>;
        case "irishub/service/MsgSvcResponse":
            return <Badge color="light">Response Service</Badge>;
        case "irishub/service/MsgSvcRefundFees":
            return <Badge color="light">Refund Service Fees</Badge>;
        case "irishub/service/MsgSvcWithdrawFees":
            return <Badge color="light">Widthdraw Service Fees</Badge>;
        case "irishub/service/MsgSvcWithdrawTax":
            return <Badge color="light">Withdraw Service Tax</Badge>;

        // ibc
        // case "cosmos-sdk/IBCTransferMsg":
        //     return <Badge color="dark">IBC Transfer</Badge>;
        // case "cosmos-sdk/IBCReceiveMsg":
        //     return <Badge color="dark">IBC Receive</Badge>;

        default:
            return <Badge color="primary">{props.type}</Badge>;
    }
}