import React from 'react';
import { Badge } from 'reactstrap';
import i18n from 'meteor/universe:i18n';

const T = i18n.createComponent();

export const MsgType = (props) => {
    switch (props.type){
    // bank
    case "irishub/bank/Send":
        return <Badge color="success"><T>messageTypes.send</T></Badge>
    case "irishub/bank/Issue":
        return <Badge color="success"><T>messageTypes.issue</T></Badge>
    case "irishub/bank/Burn":
        return <Badge color="success"><T>messageTypes.burn</T></Badge>
        
        // staking
    case "irishub/stake/MsgCreateValidator":
        return <Badge color="warning"><T>messageTypes.createValidator</T></Badge>;
    case "irishub/stake/MsgEditValidator":
        return <Badge color="warning"><T>messageTypes.editValidator</T></Badge>;
    case "irishub/stake/MsgDelegate":
        return <Badge color="warning"><T>messageTypes.delegate</T></Badge>;
    case "irishub/stake/BeginUnbonding":
        return <Badge color="warning"><T>messageTypes.undelegate</T></Badge>;
    case "irishub/stake/BeginRedelegate":
        return <Badge color="warning"><T>messageTypes.redelegate</T></Badge>;
        
        // gov
    case "irishub/gov/MsgSubmitProposal":
        return <Badge color="info"><T>messageTypes.submitProposal</T></Badge>
    case "irishub/gov/MsgSubmitTxTaxUsageProposal":
        return <Badge color="info"><T>messageTypes.submitTextUsageProposal</T></Badge>
    case "irishub/gov/MsgSubmitSoftwareUpgradeProposal":
        return <Badge color="info"><T>messageTypes.submitUpgradeProposal</T></Badge>
    case "irishub/gov/MsgDeposit":
        return <Badge color="info"><T>messageTypes.deposit</T></Badge>
    case "irishub/gov/MsgVote":
        return <Badge color="info"><T>messageTypes.vote</T></Badge>;
        
        // distribution
    case "irishub/distr/MsgWithdrawDelegationRewardsAll":
        return <Badge color="secondary"><T>messageTypes.withdrawDelegationRewardsAll</T></Badge>;
    case "irishub/distr/MsgWithdrawDelegationReward":
        return <Badge color="secondary"><T>messageTypes.withdrawDelegationReward</T></Badge>;
    case "irishub/distr/MsgWithdrawValidatorRewardsAll":
        return <Badge color="secondary"><T>messageTypes.withdrawValidatorRewardsAll</T></Badge>;
    case "irishub/distr/MsgModifyWithdrawAddress":
        return <Badge color="secondary"><T>messgeTypes.modifyWithdrawAddress</T></Badge>;

        // slashing
    case "irishub/slashing/MsgUnjail":
        return <Badge color="danger"><T>messageTypes.unjail</T></Badge>;
        
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


    default:
        return <Badge color="primary">{props.type}</Badge>;
    }
}