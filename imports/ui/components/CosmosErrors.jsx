import React, {Component} from 'react';
import { Badge } from 'reactstrap';
import numbro from 'numbro';

let errors = {
    "sdk": {
        1: "Internal Error",
        2: "Tx Decode Error",
        3: "Invalid Sequence Number",
        4: "Unauthorized",
        5: "Insufficient Funds",
        6: "Unknown Request",
        7: "Invalid Address",
        8: "Invalid PubKey",
        9: "Unknown Address",
        10: "Invalid Coins",
        11: "Out of Gas",
        12: "Memo too Large",
        13: "Insufficient Fee",
        14: "Too Many Signatures",
        15: "No Signatures",
        16: "Failed to Marshal JSON bytes",
        17: "Failed to Unmarshal JSON bytes",
        18: "Invalid Request",
        19: "Tx Already in Mempool",
        20: "Mempool is Full",
        21: "Tx too Large"
    },
    "staking":{
        1: "Empty Validator Address",
        2: "Invalid Validator Address",
        3: "Validator Does Not Exist",
        4: "Validator Already Exists for Operator Address",
        5: "Validator Already Exists for pubkey",
        6: "Validator pubkey Type Not Supported",
        7: "Validator For This Address Currently Jailed",
        8: "Failed to Remove Validator",
        9: "Commission Not Positive",
        10: "Commission More Than 100%",
        11: "Commission More Than Max Rate",
        12: "Commission Already Changed Recently",
        13: "Commission Change Rate Not Positive",
        14: "Commission Change Rate More Than Max Rate",
        15: "Commission Change More Than Max Change Rate",
        16: "Validator's Self Delegation Too Low",
        17: "Minimum Self Delegation Not Positive",
        18: "Minimum Self Delegation Decreased",
        19: "Empty Delegator Address",
        20: "Invalid Coin",
        21: "Invalid Address",
        22: "Invalid Amount",
        23: "No Delegation",
        24: "Delegator Does Not Exist",
        25: "Delegator Does Not Contain Delegation",
        26: "Insufficient Shares",
        27: "Delegated to Empty Validator",
        28: "Insufficient Shares",
        29: "Invalid Shares Amount",
        30: "Invalid Shares Percent",
        31: "Not Mature",
        32: "No Unbonding Delegation",
        33: "Too Many Unbonding Delegation Entries",
        34: "Invalid Address",
        35: "No Redelegation",
        36: "Cannot Redelegate",
        37: "Too Few Coins",
        38: "Redelegation Destination Validator Not Found",
        39: "Redelegation Already in Progress",
        40: "Too Many Redelegation Entries",
        41: "Cannot Delegate",
        42: "Invalid Shares",
        43: "Invalid Shares",
        44: "Invalid Historical Info",
        45: "No Historical Info",
        // legacy
        101: "Invalid Validator",
        102: "Invalid Delegation",
        103: "Invalid Input",
        104: "Validator Jailed"
    },
    "gov": {
        1: "Unknown Proposal",
        2: "Inactive Proposal",
        3: "Already Active Proposal",
        4: "invalid proposal content",
        5: "Invalid Proposal Type",
        6: "Invalid Vote",
        7: "Invalid Genesis",
        8: "No Handler"
    },
    "distr": {
        1: "Empty Delegator Address",
        2: "Empty Withdraw Address",
        3: "Empty Validator Address",
        4: "No Delegation Distribution Info",
        5: "No Validator Distribution Info",
        6: "No Validator Commission to Withdraw",
        7: "Set Withdraw Address Disabled",
        8: "Insufficient Community Pool Coins",
        9: "invalid Community Pool Spend Proposal Amount",
        10: "Invalid Community Pool Spend Proposal Recipient",
        11: "Validator Does Not Exist",
        12: "Delegation Does Not Exist",
        // legacy
        103: "Invalid Input",
        104: "No Distribution Info",
        105: "No Validator Commission",
        106: "Set Withdraw Addrress Disabled"
    },
    "bank":{
        1: "No Inputs",
        2: "No Outputs",
        3: "Invalid Inputs Outputs",
        4: "Send Disabled",
        // legacy
        101: "Send Disabled",
        102: "Invalid Inputs Outputs"
    },
    "slashing": {
        1: "Invalid Validator",
        2: "Validator Does Not Exist",
        3: "Validator Jailed",
        4: "Validator Not Jailed",
        5: "Missing Self Delegation",
        6: "Self Delegation Too Low",
        7: "No Validator Signing Info",
        // legacy
        101: "Invalid Validator",
        102: "Validator Jailed",
        103: "Validator Not Jailed",
        104: "Missing Self Delegation",
        105: "Self Delegation Too Low"
    },
    "crisis": {
        1: "Sender Address Empty",
        2: "Unknown Invariant"
    },
    "evidence": {
        1: "Unregistered Handler",
        2: "Invalid Evidence",
        3: "Evidence Does Not Exist",
        4: "Evidence Already Exists",
    },
    "params": {
        1: "Unknown Subspace",
        2: "Failed to Set",
        3: "Submitted Changes Empty",
        4: "Parameter Subspace Empty",
        5: "Parameter Key Empty",
        6: "Parameter Value Empty",
    },
    "enterprise": {
        101: "Invalid Genesis",
        102: "Purchase Order does not exist",
        103: "Purchase Order already processed",
        104: "Invalid Decision",
        105: "Invalid denomination",
        106: "Invalid status",
        107: "Purchase Order not raised",
        108: "Signer already made decision for Purchase Order"
    },
    "wrkchain": {
        101: "Invalid Genesis",
        201: "WRKChain does not exist",
        202: "WRKChain already registered",
        203: "WRKChain hashes already recorded",
        204: "Not WRKChain owner",
        301: "Insufficient WRKChain fee",
        302: "Too much WRKChain fee",
        303: "Invalid WRKChain fee denomination",
        401: "Fee Payer not WRKChain Owner"
    },
    "beacon": {
        101: "Invalid Genesis",
        201: "BEACON does not exist",
        202: "BEACON already registered",
        203: "BEACON timestamp already recorded",
        204: "Not BEACON owner",
        301: "Insufficient BEACON fee",
        302: "Too much BEACON fee",
        303: "Invalid BEACON fee denomination",
        401: "Fee Payer not BEACON Owner"
    },
    "undefined": {
        1: "Internal",
        111222: "Internal"
    }
}

export default class CosmosErrors extends Component {
    constructor(props) {
        super(props);
        this.state = {
            error: errors.sdk[1],
            message: ""
        }
        if(props.codespace && props.code) {
            try {
                this.state = {
                    error: errors[props.codespace][props.code],
                    message: props.raw_log
                }
            } catch(e) {
                this.state = {
                    error: errors.undefined[1],
                    message: ("raw_log" in props) ? props.raw_log: ""
                }
            }
        }
        else{
            if (props.code == 11){
                this.state = {
                    error: errors.sdk[11],
                    message: "gas uses ("+numbro(props.gasUses).format("0,0")+") > gas wanted ("+numbro(props.gasWanted).format("0,0")+")"
                }
            }
        }
    }

    render(){
        return <div>{this.state.error}: <Badge color="dark">{this.state.message}</Badge></div>
    }
}