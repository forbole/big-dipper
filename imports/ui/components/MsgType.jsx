import React from 'react';
import { Badge } from 'reactstrap';
import i18n from 'meteor/universe:i18n';

const T = i18n.createComponent();

export const MsgType = (props) => {
    switch (props.type){
    // starname
    case "domain/AddAccountCertificates":
        return <Badge color="info"><T>messageTypes.accountAddCertificate</T></Badge>
    case "domain/DeleteAccount":
        return <Badge color="warning"><T>messageTypes.accountDelete</T></Badge>
    case "domain/DeleteAccountCertificates":
        return <Badge color="warning"><T>messageTypes.accountDeleteCertificate</T></Badge>
    case "domain/DeleteDomain":
        return <Badge color="warning"><T>messageTypes.domainDelete</T></Badge>
    case "domain/RegisterAccount":
        return <Badge color="success"><T>messageTypes.accountRegister</T></Badge>
    case "domain/RegisterDomain":
        return <Badge color="success"><T>messageTypes.domainRegister</T></Badge>
    case "domain/RenewAccount":
        return <Badge color="success"><T>messageTypes.accountRenew</T></Badge>
    case "domain/RenewDomain":
        return <Badge color="success"><T>messageTypes.domainRenew</T></Badge>
    case "domain/ReplaceAccountResources":
        return <Badge color="info"><T>messageTypes.accountReplaceResources</T></Badge>
    case "domain/SetAccountMetadata":
        return <Badge color="info"><T>messageTypes.accountSetMetadata</T></Badge>
    case "domain/TransferAccount":
        return <Badge color="secondary"><T>messageTypes.accountTransfer</T></Badge>
    case "domain/TransferDomainAll":
        return <Badge color="secondary"><T>messageTypes.domainTransfer</T></Badge>

        // bank
    case "cosmos-sdk/MsgSend":
        return <Badge color="success"><T>messageTypes.send</T></Badge>
    case "cosmos-sdk/MsgMultiSend":
        return <Badge color="success"><T>messageTypes.multiSend</T></Badge>

        // staking
    case "cosmos-sdk/MsgCreateValidator":
        return <Badge color="warning"><T>messageTypes.createValidator</T></Badge>;
    case "cosmos-sdk/MsgEditValidator":
        return <Badge color="warning"><T>messageTypes.editValidator</T></Badge>;
    case "cosmos-sdk/MsgDelegate":
        return <Badge color="warning"><T>messageTypes.delegate</T></Badge>;
    case "cosmos-sdk/MsgUndelegate":
        return <Badge color="warning"><T>messageTypes.undelegate</T></Badge>;
    case "cosmos-sdk/MsgBeginRedelegate":
        return <Badge color="warning"><T>messageTypes.redelegate</T></Badge>;

        // gov
    case "cosmos-sdk/MsgSubmitProposal":
        return <Badge color="info"><T>messageTypes.submitProposal</T></Badge>
    case "cosmos-sdk/MsgDeposit":
        return <Badge color="info"><T>messageTypes.deposit</T></Badge>
    case "cosmos-sdk/MsgVote":
        return <Badge color="info"><T>messageTypes.vote</T></Badge>;

        // distribution
    case "cosmos-sdk/MsgWithdrawValidatorCommission":
        return <Badge color="secondary"><T>messageTypes.withdrawComission</T></Badge>;
    case "cosmos-sdk/MsgWithdrawDelegationReward":
        return <Badge color="secondary"><T>messageTypes.withdrawReward</T></Badge>;
    case "cosmos-sdk/MsgModifyWithdrawAddress":
        return <Badge color="secondary"><T>messgeTypes.modifyWithdrawAddress</T></Badge>;

        // slashing
    case "cosmos-sdk/MsgUnjail":
        return <Badge color="danger"><T>messageTypes.unjail</T></Badge>;

        // ibc
    case "cosmos-sdk/IBCTransferMsg":
        return <Badge color="dark"><T>messageTypes.IBCTransfer</T></Badge>;
    case "cosmos-sdk/IBCReceiveMsg":
        return <Badge color="dark"><T>messageTypes.IBCReceive</T></Badge>;

    default:
        return <Badge color="primary">{props.type}</Badge>;
    }
}
