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
        10: "Insufficient Coins",
        11: "Invalid Coins",
        12: "Out Of Gas",
        13: "Memo Too Large",
        14: "Insufficient Fee",
        15: "Out Of Service",
        16: "Too Many Signatures",
        17: "Gas Price Too Low",
        18: "Invalid Gas",
        19: "Invalid Tx Fee",
        20: "Invalid Fee Denom",
        21: "Exceeds Tx Size",
        22: "Service Tx Limit",
        23: "Pagination Params"
    },
    "stake":{
        101: "Invalid Validator",
        102: "Invalid Delegation",
        103: "Invalid Input",
        104: "Validator Jailed"
    },
    "gov": {
        1: "Unknown Proposal",
        2: "Inactive Proposal",
        3: "Already Active Proposal",
        4: "Already Finished Proposal",
        5: "Address Not Staked",
        6: "Invalid Title",
        7: "Invalid Description",
        8: "Invalid Proposal Type",
        9: "Invalid Vote",
        10: "Invalid Genesis",
        11: "Invalid Proposal Status",
        12: "Invalid Param",
        13: "Invalid Param Op",
        14: "Switch Period In Process",
        15: "Invalid Percent",
        16: "Invalid Usage Type",
        17: "Invalid Input",
        18: "Invalid Version",
        19: "Invalid Proposal",
        20: "Not Enough Initial Deposit",
        21: "Deposit Deleted",
        22: "Vote Not Existed",
        23: "Deposit Not Existed",
        24: "Not In Deposit Period",
        25: "Already Vote",
        26: "Only Validator Vote",
        27: "More Than Max Proposal",
        28: "Invalid Upgrade Params",
        29: "Empty Param"
    },
    "distr": {
        103: "Invalid Input",
        104: "No Distribution Info",
        // 105: "No Validator Commission",
        // 106: "Set Withdraw Addrress Disabled"
    },
    "guardian":{
        100: "Invalid Operator",
        101: "Profiler Exists",
        102: "Profiler Not Exists",
        103: "Trustee Exists",
        104: "Trustee Not Exists",
        105: "Invalid Description",
        106: "Delete Genesis Profiler",
        107: "Delete Genesis Trustee",
        108: "Invalid Guardian"
    },
    "service": {
        100: "Invalid IDL",
        101: "Service Def Exists",
        102: "Service Def Not Exists",
        103: "Invalid Output Privacy Enum",
        104: "Invalid Output Cached Enum",
        105: "Invalid Service Name",
        106: "Invalid ChainId",
        107: "Invalid Author",
        108: "Invalid Method Name",
        109: "Service Binding Exists",
        110: "Service Binding Not Exists",
        111: "Invalid Def Chain Id",
        112: "Invalid Binding Type",
        113: "Invalid Level",
        114: "Invalid Price Count",
        115: "Invalid Refund Deposit",
        116: "Less Than Min Provider Deposit",
        117: "Invalid Disable",
        118: "Invalid Enable",
        119: "Method Not Exists",
        120: "Request Not Active",
        121: "Return Fee Not Exists",
        122: "Withdraw Fee Not Exists",
        123: "Less Than Service Fee",
        124: "Invalid Req Id",
        125: "Service Binding Not Available",
        126: "Not Matching Provider",
        127: "Invalid Req Chain Id",
        128: "Invalid Bind Chain Id",
        129: "Not Matching Req Chain ID",
        130: "Int Overflow",
        131: "Invalid Input"
    },
    "bank":{
        101: "Invalid Input",
        102: "Invalid Output",
        103: "Burn Empty Coins"
    },
    "slashing": {
        101: "Invalid Validator",
        102: "Validator Jailed",
        103: "Validator Not Jailed",
        104: "Missing Self Delegation",
        105: "Self Delegation Too Low"
    },
    "upgrade": {
        100: "Invalid Msg Type",
        101: "Unsupported Msg Type",
        102: "Not Current Proposal",
        103: "Not Validator",
        104: "Double Switch" 
    },
    "params": {
        100: "Invalid Min Deposit",
        101: "Invalid Min Deposit Denom",
        102: "Invalid Min Deposit Amount",
        103: "Invalid Deposit Period",
        104: "Invalid Voting Period",
        105: "Invalid Voting Procedure",
        106: "Invalid Threshold",
        107: "Invalid Participation",
        108: "Invalid Veto",
        109: "Invalid Governance Penalty",
        110: "Invalid Tallying Procedure",
        111: "Invalid Key",
        112: "Invalid Module",
        113: "Invalid Query Params",
        114: "Invalid Max Proposal Num",
        115: "Invalid System Halt Period",

        200: "Invalid Max Request Timeout",
        201: "Invalid Min Deposit Multiple",
        202: "Invalid Service Fee Tax",
        203: "Invalid Slash Fraction",
        204: "Invalid Arbitration Time Limit",
        205: "Complaint Retrospect",
        206: "Invalid Service Tx Size Limit",

        300: "Invalid Upgrade Params",
        
        400: "Invalid Mint Inflation",

        500: "Invalid Unbonding Time",
        501: "Invalid Max Validators",
        502: "Invalid Bond Denom",

        600: "Invalid Gas Price Threshold",
        601: "Invalid Tx Size Limit",

        700: "Invalid Community Tax",
        701: "Invalid Base Proposer Reward",
        702: "Invalid Bonus Proposer Reward",

        800: "Invalid Slash Params"
    }
}

export default class CosmosErrors extends Component {
    constructor(props) {
        super(props);
        this.state = {
            error: errors.sdk[1],
            message: ""
        }
        if (props.logs){
            let jsonRegEx = new RegExp(/{".*"}/, 'g');
            let errorLogs = props.logs.match(jsonRegEx);

            if (errorLogs.length){
                for (let i in errorLogs){
                    let error = JSON.parse(errorLogs[i]);
                    this.state = {
                        error: errors[error.codespace][error.code],
                        message: error.message
                    }
                }
            }
        }
        else{
            if (props.code == 12){
                this.state = {
                    error: errors.sdk[12],
                    message: "gas uses ("+numbro(props.gasUses).format("0,0")+") > gas wanted ("+numbro(props.gasWanted).format("0,0")+")"
                }
            }
        }
    }

    render(){
        return <div>{this.state.error}: <Badge color="dark">{this.state.message}</Badge></div>
    }
}