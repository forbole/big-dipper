"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.TallyParams = exports.VotingParams = exports.DepositParams = exports.Vote = exports.TallyResult = exports.Proposal = exports.Deposit = exports.TextProposal = exports.WeightedVoteOption = exports.proposalStatusToJSON = exports.proposalStatusFromJSON = exports.ProposalStatus = exports.voteOptionToJSON = exports.voteOptionFromJSON = exports.VoteOption = exports.protobufPackage = void 0;
/* eslint-disable */
var long_1 = __importDefault(require("long"));
var minimal_1 = __importDefault(require("protobufjs/minimal"));
var any_1 = require("@cosmjs/stargate/build/codec/google/protobuf/any");
var duration_1 = require("@cosmjs/stargate/build/codec/google/protobuf/duration");
var timestamp_1 = require("@cosmjs/stargate/build/codec/google/protobuf/timestamp");
var coin_1 = require("@cosmjs/stargate/build/codec/cosmos/base/v1beta1/coin");
exports.protobufPackage = "cosmos.gov.v1beta1";
/** VoteOption enumerates the valid vote votes for a given governance proposal. */
var VoteOption;
(function (VoteOption) {
    /** VOTE_OPTION_UNSPECIFIED - VOTE_OPTION_UNSPECIFIED defines a no-op vote vote. */
    VoteOption[VoteOption["VOTE_OPTION_UNSPECIFIED"] = 0] = "VOTE_OPTION_UNSPECIFIED";
    /** VOTE_OPTION_YES - VOTE_OPTION_YES defines a yes vote vote. */
    VoteOption[VoteOption["VOTE_OPTION_YES"] = 1] = "VOTE_OPTION_YES";
    /** VOTE_OPTION_ABSTAIN - VOTE_OPTION_ABSTAIN defines an abstain vote vote. */
    VoteOption[VoteOption["VOTE_OPTION_ABSTAIN"] = 2] = "VOTE_OPTION_ABSTAIN";
    /** VOTE_OPTION_NO - VOTE_OPTION_NO defines a no vote vote. */
    VoteOption[VoteOption["VOTE_OPTION_NO"] = 3] = "VOTE_OPTION_NO";
    /** VOTE_OPTION_NO_WITH_VETO - VOTE_OPTION_NO_WITH_VETO defines a no with veto vote vote. */
    VoteOption[VoteOption["VOTE_OPTION_NO_WITH_VETO"] = 4] = "VOTE_OPTION_NO_WITH_VETO";
    VoteOption[VoteOption["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(VoteOption = exports.VoteOption || (exports.VoteOption = {}));
function voteOptionFromJSON(object) {
    switch (object) {
        case 0:
        case "VOTE_OPTION_UNSPECIFIED":
            return VoteOption.VOTE_OPTION_UNSPECIFIED;
        case 1:
        case "VOTE_OPTION_YES":
            return VoteOption.VOTE_OPTION_YES;
        case 2:
        case "VOTE_OPTION_ABSTAIN":
            return VoteOption.VOTE_OPTION_ABSTAIN;
        case 3:
        case "VOTE_OPTION_NO":
            return VoteOption.VOTE_OPTION_NO;
        case 4:
        case "VOTE_OPTION_NO_WITH_VETO":
            return VoteOption.VOTE_OPTION_NO_WITH_VETO;
        case -1:
        case "UNRECOGNIZED":
        default:
            return VoteOption.UNRECOGNIZED;
    }
}
exports.voteOptionFromJSON = voteOptionFromJSON;
function voteOptionToJSON(object) {
    switch (object) {
        case VoteOption.VOTE_OPTION_UNSPECIFIED:
            return "VOTE_OPTION_UNSPECIFIED";
        case VoteOption.VOTE_OPTION_YES:
            return "VOTE_OPTION_YES";
        case VoteOption.VOTE_OPTION_ABSTAIN:
            return "VOTE_OPTION_ABSTAIN";
        case VoteOption.VOTE_OPTION_NO:
            return "VOTE_OPTION_NO";
        case VoteOption.VOTE_OPTION_NO_WITH_VETO:
            return "VOTE_OPTION_NO_WITH_VETO";
        default:
            return "UNKNOWN";
    }
}
exports.voteOptionToJSON = voteOptionToJSON;
/** ProposalStatus enumerates the valid statuses of a proposal. */
var ProposalStatus;
(function (ProposalStatus) {
    /** PROPOSAL_STATUS_UNSPECIFIED - PROPOSAL_STATUS_UNSPECIFIED defines the default propopsal status. */
    ProposalStatus[ProposalStatus["PROPOSAL_STATUS_UNSPECIFIED"] = 0] = "PROPOSAL_STATUS_UNSPECIFIED";
    /**
     * PROPOSAL_STATUS_DEPOSIT_PERIOD - PROPOSAL_STATUS_DEPOSIT_PERIOD defines a proposal status during the deposit
     * period.
     */
    ProposalStatus[ProposalStatus["PROPOSAL_STATUS_DEPOSIT_PERIOD"] = 1] = "PROPOSAL_STATUS_DEPOSIT_PERIOD";
    /**
     * PROPOSAL_STATUS_VOTING_PERIOD - PROPOSAL_STATUS_VOTING_PERIOD defines a proposal status during the voting
     * period.
     */
    ProposalStatus[ProposalStatus["PROPOSAL_STATUS_VOTING_PERIOD"] = 2] = "PROPOSAL_STATUS_VOTING_PERIOD";
    /**
     * PROPOSAL_STATUS_PASSED - PROPOSAL_STATUS_PASSED defines a proposal status of a proposal that has
     * passed.
     */
    ProposalStatus[ProposalStatus["PROPOSAL_STATUS_PASSED"] = 3] = "PROPOSAL_STATUS_PASSED";
    /**
     * PROPOSAL_STATUS_REJECTED - PROPOSAL_STATUS_REJECTED defines a proposal status of a proposal that has
     * been rejected.
     */
    ProposalStatus[ProposalStatus["PROPOSAL_STATUS_REJECTED"] = 4] = "PROPOSAL_STATUS_REJECTED";
    /**
     * PROPOSAL_STATUS_FAILED - PROPOSAL_STATUS_FAILED defines a proposal status of a proposal that has
     * failed.
     */
    ProposalStatus[ProposalStatus["PROPOSAL_STATUS_FAILED"] = 5] = "PROPOSAL_STATUS_FAILED";
    ProposalStatus[ProposalStatus["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(ProposalStatus = exports.ProposalStatus || (exports.ProposalStatus = {}));
function proposalStatusFromJSON(object) {
    switch (object) {
        case 0:
        case "PROPOSAL_STATUS_UNSPECIFIED":
            return ProposalStatus.PROPOSAL_STATUS_UNSPECIFIED;
        case 1:
        case "PROPOSAL_STATUS_DEPOSIT_PERIOD":
            return ProposalStatus.PROPOSAL_STATUS_DEPOSIT_PERIOD;
        case 2:
        case "PROPOSAL_STATUS_VOTING_PERIOD":
            return ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD;
        case 3:
        case "PROPOSAL_STATUS_PASSED":
            return ProposalStatus.PROPOSAL_STATUS_PASSED;
        case 4:
        case "PROPOSAL_STATUS_REJECTED":
            return ProposalStatus.PROPOSAL_STATUS_REJECTED;
        case 5:
        case "PROPOSAL_STATUS_FAILED":
            return ProposalStatus.PROPOSAL_STATUS_FAILED;
        case -1:
        case "UNRECOGNIZED":
        default:
            return ProposalStatus.UNRECOGNIZED;
    }
}
exports.proposalStatusFromJSON = proposalStatusFromJSON;
function proposalStatusToJSON(object) {
    switch (object) {
        case ProposalStatus.PROPOSAL_STATUS_UNSPECIFIED:
            return "PROPOSAL_STATUS_UNSPECIFIED";
        case ProposalStatus.PROPOSAL_STATUS_DEPOSIT_PERIOD:
            return "PROPOSAL_STATUS_DEPOSIT_PERIOD";
        case ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD:
            return "PROPOSAL_STATUS_VOTING_PERIOD";
        case ProposalStatus.PROPOSAL_STATUS_PASSED:
            return "PROPOSAL_STATUS_PASSED";
        case ProposalStatus.PROPOSAL_STATUS_REJECTED:
            return "PROPOSAL_STATUS_REJECTED";
        case ProposalStatus.PROPOSAL_STATUS_FAILED:
            return "PROPOSAL_STATUS_FAILED";
        default:
            return "UNKNOWN";
    }
}
exports.proposalStatusToJSON = proposalStatusToJSON;
var baseWeightedVoteOption = { vote: 0, weight: "" };
exports.WeightedVoteOption = {
    encode: function (message, writer) {
        if (writer === void 0) { writer = minimal_1["default"].Writer.create(); }
        if (message.vote !== 0) {
            writer.uint32(8).int32(message.vote);
        }
        if (message.weight !== "") {
            writer.uint32(18).string(message.weight);
        }
        return writer;
    },
    decode: function (input, length) {
        var reader = input instanceof minimal_1["default"].Reader ? input : new minimal_1["default"].Reader(input);
        var end = length === undefined ? reader.len : reader.pos + length;
        var message = __assign({}, baseWeightedVoteOption);
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.vote = reader.int32();
                    break;
                case 2:
                    message.weight = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON: function (object) {
        var message = __assign({}, baseWeightedVoteOption);
        if (object.vote !== undefined && object.vote !== null) {
            message.vote = voteOptionFromJSON(object.vote);
        }
        else {
            message.vote = 0;
        }
        if (object.weight !== undefined && object.weight !== null) {
            message.weight = String(object.weight);
        }
        else {
            message.weight = "";
        }
        return message;
    },
    toJSON: function (message) {
        var obj = {};
        message.vote !== undefined &&
            (obj.vote = voteOptionToJSON(message.vote));
        message.weight !== undefined && (obj.weight = message.weight);
        return obj;
    },
    fromPartial: function (object) {
        var message = __assign({}, baseWeightedVoteOption);
        if (object.vote !== undefined && object.vote !== null) {
            message.vote = object.vote;
        }
        else {
            message.vote = 0;
        }
        if (object.weight !== undefined && object.weight !== null) {
            message.weight = object.weight;
        }
        else {
            message.weight = "";
        }
        return message;
    }
};
var baseTextProposal = { title: "", description: "" };
exports.TextProposal = {
    encode: function (message, writer) {
        if (writer === void 0) { writer = minimal_1["default"].Writer.create(); }
        if (message.title !== "") {
            writer.uint32(10).string(message.title);
        }
        if (message.description !== "") {
            writer.uint32(18).string(message.description);
        }
        return writer;
    },
    decode: function (input, length) {
        var reader = input instanceof minimal_1["default"].Reader ? input : new minimal_1["default"].Reader(input);
        var end = length === undefined ? reader.len : reader.pos + length;
        var message = __assign({}, baseTextProposal);
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.title = reader.string();
                    break;
                case 2:
                    message.description = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON: function (object) {
        var message = __assign({}, baseTextProposal);
        if (object.title !== undefined && object.title !== null) {
            message.title = String(object.title);
        }
        else {
            message.title = "";
        }
        if (object.description !== undefined && object.description !== null) {
            message.description = String(object.description);
        }
        else {
            message.description = "";
        }
        return message;
    },
    toJSON: function (message) {
        var obj = {};
        message.title !== undefined && (obj.title = message.title);
        message.description !== undefined &&
            (obj.description = message.description);
        return obj;
    },
    fromPartial: function (object) {
        var message = __assign({}, baseTextProposal);
        if (object.title !== undefined && object.title !== null) {
            message.title = object.title;
        }
        else {
            message.title = "";
        }
        if (object.description !== undefined && object.description !== null) {
            message.description = object.description;
        }
        else {
            message.description = "";
        }
        return message;
    }
};
var baseDeposit = { proposalId: long_1["default"].UZERO, depositor: "" };
exports.Deposit = {
    encode: function (message, writer) {
        if (writer === void 0) { writer = minimal_1["default"].Writer.create(); }
        console.log(message.proposalId);
        if (!message.proposalId.isZero()) {
            writer.uint32(8).uint64(message.proposalId);
        }
        if (message.depositor !== "") {
            writer.uint32(18).string(message.depositor);
        }
        for (var _i = 0, _a = message.amount; _i < _a.length; _i++) {
            var v = _a[_i];
            coin_1.Coin.encode(v, writer.uint32(26).fork()).ldelim();
        }
        return writer;
    },
    decode: function (input, length) {
        var reader = input instanceof minimal_1["default"].Reader ? input : new minimal_1["default"].Reader(input);
        var end = length === undefined ? reader.len : reader.pos + length;
        var message = __assign({}, baseDeposit);
        message.amount = [];
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.proposalId = reader.uint64();
                    break;
                case 2:
                    message.depositor = reader.string();
                    break;
                case 3:
                    message.amount.push(coin_1.Coin.decode(reader, reader.uint32()));
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON: function (object) {
        var message = __assign({}, baseDeposit);
        message.amount = [];
        if (object.proposalId !== undefined && object.proposalId !== null) {
            message.proposalId = long_1["default"].fromString(object.proposalId);
        }
        else {
            message.proposalId = long_1["default"].UZERO;
        }
        if (object.depositor !== undefined && object.depositor !== null) {
            message.depositor = String(object.depositor);
        }
        else {
            message.depositor = "";
        }
        if (object.amount !== undefined && object.amount !== null) {
            for (var _i = 0, _a = object.amount; _i < _a.length; _i++) {
                var e = _a[_i];
                message.amount.push(coin_1.Coin.fromJSON(e));
            }
        }
        return message;
    },
    toJSON: function (message) {
        var obj = {};
        message.proposalId !== undefined &&
            (obj.proposalId = (message.proposalId || long_1["default"].UZERO).toString());
        message.depositor !== undefined && (obj.depositor = message.depositor);
        if (message.amount) {
            obj.amount = message.amount.map(function (e) { return (e ? coin_1.Coin.toJSON(e) : undefined); });
        }
        else {
            obj.amount = [];
        }
        return obj;
    },
    fromPartial: function (object) {
        var message = __assign({}, baseDeposit);
        message.amount = [];
        if (object.proposalId !== undefined && object.proposalId !== null) {
            message.proposalId = object.proposalId;
        }
        else {
            message.proposalId = long_1["default"].UZERO;
        }
        if (object.depositor !== undefined && object.depositor !== null) {
            message.depositor = object.depositor;
        }
        else {
            message.depositor = "";
        }
        if (object.amount !== undefined && object.amount !== null) {
            for (var _i = 0, _a = object.amount; _i < _a.length; _i++) {
                var e = _a[_i];
                message.amount.push(coin_1.Coin.fromPartial(e));
            }
        }
        return message;
    }
};
var baseProposal = { proposalId: long_1["default"].UZERO, status: 0 };
exports.Proposal = {
    encode: function (message, writer) {
        if (writer === void 0) { writer = minimal_1["default"].Writer.create(); }
        if (!message.proposalId.isZero()) {
            writer.uint32(8).uint64(message.proposalId);
        }
        if (message.content !== undefined) {
            any_1.Any.encode(message.content, writer.uint32(18).fork()).ldelim();
        }
        if (message.status !== 0) {
            writer.uint32(24).int32(message.status);
        }
        if (message.finalTallyResult !== undefined) {
            exports.TallyResult.encode(message.finalTallyResult, writer.uint32(34).fork()).ldelim();
        }
        if (message.submitTime !== undefined) {
            timestamp_1.Timestamp.encode(toTimestamp(message.submitTime), writer.uint32(42).fork()).ldelim();
        }
        if (message.depositEndTime !== undefined) {
            timestamp_1.Timestamp.encode(toTimestamp(message.depositEndTime), writer.uint32(50).fork()).ldelim();
        }
        for (var _i = 0, _a = message.totalDeposit; _i < _a.length; _i++) {
            var v = _a[_i];
            coin_1.Coin.encode(v, writer.uint32(58).fork()).ldelim();
        }
        if (message.votingStartTime !== undefined) {
            timestamp_1.Timestamp.encode(toTimestamp(message.votingStartTime), writer.uint32(66).fork()).ldelim();
        }
        if (message.votingEndTime !== undefined) {
            timestamp_1.Timestamp.encode(toTimestamp(message.votingEndTime), writer.uint32(74).fork()).ldelim();
        }
        return writer;
    },
    decode: function (input, length) {
        var reader = input instanceof minimal_1["default"].Reader ? input : new minimal_1["default"].Reader(input);
        var end = length === undefined ? reader.len : reader.pos + length;
        var message = __assign({}, baseProposal);
        message.totalDeposit = [];
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.proposalId = reader.uint64();
                    break;
                case 2:
                    message.content = any_1.Any.decode(reader, reader.uint32());
                    break;
                case 3:
                    message.status = reader.int32();
                    break;
                case 4:
                    message.finalTallyResult = exports.TallyResult.decode(reader, reader.uint32());
                    break;
                case 5:
                    message.submitTime = fromTimestamp(timestamp_1.Timestamp.decode(reader, reader.uint32()));
                    break;
                case 6:
                    message.depositEndTime = fromTimestamp(timestamp_1.Timestamp.decode(reader, reader.uint32()));
                    break;
                case 7:
                    message.totalDeposit.push(coin_1.Coin.decode(reader, reader.uint32()));
                    break;
                case 8:
                    message.votingStartTime = fromTimestamp(timestamp_1.Timestamp.decode(reader, reader.uint32()));
                    break;
                case 9:
                    message.votingEndTime = fromTimestamp(timestamp_1.Timestamp.decode(reader, reader.uint32()));
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON: function (object) {
        var message = __assign({}, baseProposal);
        message.totalDeposit = [];
        if (object.proposalId !== undefined && object.proposalId !== null) {
            message.proposalId = long_1["default"].fromString(object.proposalId);
        }
        else {
            message.proposalId = long_1["default"].UZERO;
        }
        if (object.content !== undefined && object.content !== null) {
            message.content = any_1.Any.fromJSON(object.content);
        }
        else {
            message.content = undefined;
        }
        if (object.status !== undefined && object.status !== null) {
            message.status = proposalStatusFromJSON(object.status);
        }
        else {
            message.status = 0;
        }
        if (object.finalTallyResult !== undefined &&
            object.finalTallyResult !== null) {
            message.finalTallyResult = exports.TallyResult.fromJSON(object.finalTallyResult);
        }
        else {
            message.finalTallyResult = undefined;
        }
        if (object.submitTime !== undefined && object.submitTime !== null) {
            message.submitTime = fromJsonTimestamp(object.submitTime);
        }
        else {
            message.submitTime = undefined;
        }
        if (object.depositEndTime !== undefined && object.depositEndTime !== null) {
            message.depositEndTime = fromJsonTimestamp(object.depositEndTime);
        }
        else {
            message.depositEndTime = undefined;
        }
        if (object.totalDeposit !== undefined && object.totalDeposit !== null) {
            for (var _i = 0, _a = object.totalDeposit; _i < _a.length; _i++) {
                var e = _a[_i];
                message.totalDeposit.push(coin_1.Coin.fromJSON(e));
            }
        }
        if (object.votingStartTime !== undefined &&
            object.votingStartTime !== null) {
            message.votingStartTime = fromJsonTimestamp(object.votingStartTime);
        }
        else {
            message.votingStartTime = undefined;
        }
        if (object.votingEndTime !== undefined && object.votingEndTime !== null) {
            message.votingEndTime = fromJsonTimestamp(object.votingEndTime);
        }
        else {
            message.votingEndTime = undefined;
        }
        return message;
    },
    toJSON: function (message) {
        var obj = {};
        message.proposalId !== undefined &&
            (obj.proposalId = (message.proposalId || long_1["default"].UZERO).toString());
        message.content !== undefined &&
            (obj.content = message.content ? any_1.Any.toJSON(message.content) : undefined);
        message.status !== undefined &&
            (obj.status = proposalStatusToJSON(message.status));
        message.finalTallyResult !== undefined &&
            (obj.finalTallyResult = message.finalTallyResult
                ? exports.TallyResult.toJSON(message.finalTallyResult)
                : undefined);
        message.submitTime !== undefined &&
            (obj.submitTime = message.submitTime.toISOString());
        message.depositEndTime !== undefined &&
            (obj.depositEndTime = message.depositEndTime.toISOString());
        if (message.totalDeposit) {
            obj.totalDeposit = message.totalDeposit.map(function (e) {
                return e ? coin_1.Coin.toJSON(e) : undefined;
            });
        }
        else {
            obj.totalDeposit = [];
        }
        message.votingStartTime !== undefined &&
            (obj.votingStartTime = message.votingStartTime.toISOString());
        message.votingEndTime !== undefined &&
            (obj.votingEndTime = message.votingEndTime.toISOString());
        return obj;
    },
    fromPartial: function (object) {
        var message = __assign({}, baseProposal);
        message.totalDeposit = [];
        if (object.proposalId !== undefined && object.proposalId !== null) {
            message.proposalId = object.proposalId;
        }
        else {
            message.proposalId = long_1["default"].UZERO;
        }
        if (object.content !== undefined && object.content !== null) {
            message.content = any_1.Any.fromPartial(object.content);
        }
        else {
            message.content = undefined;
        }
        if (object.status !== undefined && object.status !== null) {
            message.status = object.status;
        }
        else {
            message.status = 0;
        }
        if (object.finalTallyResult !== undefined &&
            object.finalTallyResult !== null) {
            message.finalTallyResult = exports.TallyResult.fromPartial(object.finalTallyResult);
        }
        else {
            message.finalTallyResult = undefined;
        }
        if (object.submitTime !== undefined && object.submitTime !== null) {
            message.submitTime = object.submitTime;
        }
        else {
            message.submitTime = undefined;
        }
        if (object.depositEndTime !== undefined && object.depositEndTime !== null) {
            message.depositEndTime = object.depositEndTime;
        }
        else {
            message.depositEndTime = undefined;
        }
        if (object.totalDeposit !== undefined && object.totalDeposit !== null) {
            for (var _i = 0, _a = object.totalDeposit; _i < _a.length; _i++) {
                var e = _a[_i];
                message.totalDeposit.push(coin_1.Coin.fromPartial(e));
            }
        }
        if (object.votingStartTime !== undefined &&
            object.votingStartTime !== null) {
            message.votingStartTime = object.votingStartTime;
        }
        else {
            message.votingStartTime = undefined;
        }
        if (object.votingEndTime !== undefined && object.votingEndTime !== null) {
            message.votingEndTime = object.votingEndTime;
        }
        else {
            message.votingEndTime = undefined;
        }
        return message;
    }
};
var baseTallyResult = {
    yes: "",
    abstain: "",
    no: "",
    noWithVeto: ""
};
exports.TallyResult = {
    encode: function (message, writer) {
        if (writer === void 0) { writer = minimal_1["default"].Writer.create(); }
        if (message.yes !== "") {
            writer.uint32(10).string(message.yes);
        }
        if (message.abstain !== "") {
            writer.uint32(18).string(message.abstain);
        }
        if (message.no !== "") {
            writer.uint32(26).string(message.no);
        }
        if (message.noWithVeto !== "") {
            writer.uint32(34).string(message.noWithVeto);
        }
        return writer;
    },
    decode: function (input, length) {
        var reader = input instanceof minimal_1["default"].Reader ? input : new minimal_1["default"].Reader(input);
        var end = length === undefined ? reader.len : reader.pos + length;
        var message = __assign({}, baseTallyResult);
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.yes = reader.string();
                    break;
                case 2:
                    message.abstain = reader.string();
                    break;
                case 3:
                    message.no = reader.string();
                    break;
                case 4:
                    message.noWithVeto = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON: function (object) {
        var message = __assign({}, baseTallyResult);
        if (object.yes !== undefined && object.yes !== null) {
            message.yes = String(object.yes);
        }
        else {
            message.yes = "";
        }
        if (object.abstain !== undefined && object.abstain !== null) {
            message.abstain = String(object.abstain);
        }
        else {
            message.abstain = "";
        }
        if (object.no !== undefined && object.no !== null) {
            message.no = String(object.no);
        }
        else {
            message.no = "";
        }
        if (object.noWithVeto !== undefined && object.noWithVeto !== null) {
            message.noWithVeto = String(object.noWithVeto);
        }
        else {
            message.noWithVeto = "";
        }
        return message;
    },
    toJSON: function (message) {
        var obj = {};
        message.yes !== undefined && (obj.yes = message.yes);
        message.abstain !== undefined && (obj.abstain = message.abstain);
        message.no !== undefined && (obj.no = message.no);
        message.noWithVeto !== undefined && (obj.noWithVeto = message.noWithVeto);
        return obj;
    },
    fromPartial: function (object) {
        var message = __assign({}, baseTallyResult);
        if (object.yes !== undefined && object.yes !== null) {
            message.yes = object.yes;
        }
        else {
            message.yes = "";
        }
        if (object.abstain !== undefined && object.abstain !== null) {
            message.abstain = object.abstain;
        }
        else {
            message.abstain = "";
        }
        if (object.no !== undefined && object.no !== null) {
            message.no = object.no;
        }
        else {
            message.no = "";
        }
        if (object.noWithVeto !== undefined && object.noWithVeto !== null) {
            message.noWithVeto = object.noWithVeto;
        }
        else {
            message.noWithVeto = "";
        }
        return message;
    }
};
var baseVote = { proposalId: long_1["default"].UZERO, voter: "" };
exports.Vote = {
    encode: function (message, writer) {
        if (writer === void 0) { writer = minimal_1["default"].Writer.create(); }
        if (!message.proposalId.isZero()) {
            writer.uint32(8).uint64(message.proposalId);
        }
        if (message.voter !== "") {
            writer.uint32(18).string(message.voter);
        }
        for (var _i = 0, _a = message.votes; _i < _a.length; _i++) {
            var v = _a[_i];
            exports.WeightedVoteOption.encode(v, writer.uint32(34).fork()).ldelim();
        }
        return writer;
    },
    decode: function (input, length) {
        var reader = input instanceof minimal_1["default"].Reader ? input : new minimal_1["default"].Reader(input);
        var end = length === undefined ? reader.len : reader.pos + length;
        var message = __assign({}, baseVote);
        message.votes = [];
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.proposalId = reader.uint64();
                    break;
                case 2:
                    message.voter = reader.string();
                    break;
                case 4:
                    message.votes.push(exports.WeightedVoteOption.decode(reader, reader.uint32()));
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON: function (object) {
        var message = __assign({}, baseVote);
        message.votes = [];
        if (object.proposalId !== undefined && object.proposalId !== null) {
            message.proposalId = long_1["default"].fromString(object.proposalId);
        }
        else {
            message.proposalId = long_1["default"].UZERO;
        }
        if (object.voter !== undefined && object.voter !== null) {
            message.voter = String(object.voter);
        }
        else {
            message.voter = "";
        }
        if (object.votes !== undefined && object.votes !== null) {
            for (var _i = 0, _a = object.votes; _i < _a.length; _i++) {
                var e = _a[_i];
                message.votes.push(exports.WeightedVoteOption.fromJSON(e));
            }
        }
        return message;
    },
    toJSON: function (message) {
        var obj = {};
        message.proposalId !== undefined &&
            (obj.proposalId = (message.proposalId || long_1["default"].UZERO).toString());
        message.voter !== undefined && (obj.voter = message.voter);
        if (message.votes) {
            obj.votes = message.votes.map(function (e) {
                return e ? exports.WeightedVoteOption.toJSON(e) : undefined;
            });
        }
        else {
            obj.votes = [];
        }
        return obj;
    },
    fromPartial: function (object) {
        var message = __assign({}, baseVote);
        message.votes = [];
        if (object.proposalId !== undefined && object.proposalId !== null) {
            message.proposalId = object.proposalId;
        }
        else {
            message.proposalId = long_1["default"].UZERO;
        }
        if (object.voter !== undefined && object.voter !== null) {
            message.voter = object.voter;
        }
        else {
            message.voter = "";
        }
        if (object.votes !== undefined && object.votes !== null) {
            for (var _i = 0, _a = object.votes; _i < _a.length; _i++) {
                var e = _a[_i];
                message.votes.push(exports.WeightedVoteOption.fromPartial(e));
            }
        }
        return message;
    }
};
var baseDepositParams = {};
exports.DepositParams = {
    encode: function (message, writer) {
        if (writer === void 0) { writer = minimal_1["default"].Writer.create(); }
        for (var _i = 0, _a = message.minDeposit; _i < _a.length; _i++) {
            var v = _a[_i];
            coin_1.Coin.encode(v, writer.uint32(10).fork()).ldelim();
        }
        if (message.maxDepositPeriod !== undefined) {
            duration_1.Duration.encode(message.maxDepositPeriod, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode: function (input, length) {
        var reader = input instanceof minimal_1["default"].Reader ? input : new minimal_1["default"].Reader(input);
        var end = length === undefined ? reader.len : reader.pos + length;
        var message = __assign({}, baseDepositParams);
        message.minDeposit = [];
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.minDeposit.push(coin_1.Coin.decode(reader, reader.uint32()));
                    break;
                case 2:
                    message.maxDepositPeriod = duration_1.Duration.decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON: function (object) {
        var message = __assign({}, baseDepositParams);
        message.minDeposit = [];
        if (object.minDeposit !== undefined && object.minDeposit !== null) {
            for (var _i = 0, _a = object.minDeposit; _i < _a.length; _i++) {
                var e = _a[_i];
                message.minDeposit.push(coin_1.Coin.fromJSON(e));
            }
        }
        if (object.maxDepositPeriod !== undefined &&
            object.maxDepositPeriod !== null) {
            message.maxDepositPeriod = duration_1.Duration.fromJSON(object.maxDepositPeriod);
        }
        else {
            message.maxDepositPeriod = undefined;
        }
        return message;
    },
    toJSON: function (message) {
        var obj = {};
        if (message.minDeposit) {
            obj.minDeposit = message.minDeposit.map(function (e) {
                return e ? coin_1.Coin.toJSON(e) : undefined;
            });
        }
        else {
            obj.minDeposit = [];
        }
        message.maxDepositPeriod !== undefined &&
            (obj.maxDepositPeriod = message.maxDepositPeriod
                ? duration_1.Duration.toJSON(message.maxDepositPeriod)
                : undefined);
        return obj;
    },
    fromPartial: function (object) {
        var message = __assign({}, baseDepositParams);
        message.minDeposit = [];
        if (object.minDeposit !== undefined && object.minDeposit !== null) {
            for (var _i = 0, _a = object.minDeposit; _i < _a.length; _i++) {
                var e = _a[_i];
                message.minDeposit.push(coin_1.Coin.fromPartial(e));
            }
        }
        if (object.maxDepositPeriod !== undefined &&
            object.maxDepositPeriod !== null) {
            message.maxDepositPeriod = duration_1.Duration.fromPartial(object.maxDepositPeriod);
        }
        else {
            message.maxDepositPeriod = undefined;
        }
        return message;
    }
};
var baseVotingParams = {};
exports.VotingParams = {
    encode: function (message, writer) {
        if (writer === void 0) { writer = minimal_1["default"].Writer.create(); }
        if (message.votingPeriod !== undefined) {
            duration_1.Duration.encode(message.votingPeriod, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode: function (input, length) {
        var reader = input instanceof minimal_1["default"].Reader ? input : new minimal_1["default"].Reader(input);
        var end = length === undefined ? reader.len : reader.pos + length;
        var message = __assign({}, baseVotingParams);
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.votingPeriod = duration_1.Duration.decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON: function (object) {
        var message = __assign({}, baseVotingParams);
        if (object.votingPeriod !== undefined && object.votingPeriod !== null) {
            message.votingPeriod = duration_1.Duration.fromJSON(object.votingPeriod);
        }
        else {
            message.votingPeriod = undefined;
        }
        return message;
    },
    toJSON: function (message) {
        var obj = {};
        message.votingPeriod !== undefined &&
            (obj.votingPeriod = message.votingPeriod
                ? duration_1.Duration.toJSON(message.votingPeriod)
                : undefined);
        return obj;
    },
    fromPartial: function (object) {
        var message = __assign({}, baseVotingParams);
        if (object.votingPeriod !== undefined && object.votingPeriod !== null) {
            message.votingPeriod = duration_1.Duration.fromPartial(object.votingPeriod);
        }
        else {
            message.votingPeriod = undefined;
        }
        return message;
    }
};
var baseTallyParams = {};
exports.TallyParams = {
    encode: function (message, writer) {
        if (writer === void 0) { writer = minimal_1["default"].Writer.create(); }
        if (message.quorum.length !== 0) {
            writer.uint32(10).bytes(message.quorum);
        }
        if (message.threshold.length !== 0) {
            writer.uint32(18).bytes(message.threshold);
        }
        if (message.vetoThreshold.length !== 0) {
            writer.uint32(26).bytes(message.vetoThreshold);
        }
        return writer;
    },
    decode: function (input, length) {
        var reader = input instanceof minimal_1["default"].Reader ? input : new minimal_1["default"].Reader(input);
        var end = length === undefined ? reader.len : reader.pos + length;
        var message = __assign({}, baseTallyParams);
        message.quorum = new Uint8Array();
        message.threshold = new Uint8Array();
        message.vetoThreshold = new Uint8Array();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.quorum = reader.bytes();
                    break;
                case 2:
                    message.threshold = reader.bytes();
                    break;
                case 3:
                    message.vetoThreshold = reader.bytes();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON: function (object) {
        var message = __assign({}, baseTallyParams);
        message.quorum = new Uint8Array();
        message.threshold = new Uint8Array();
        message.vetoThreshold = new Uint8Array();
        if (object.quorum !== undefined && object.quorum !== null) {
            message.quorum = bytesFromBase64(object.quorum);
        }
        if (object.threshold !== undefined && object.threshold !== null) {
            message.threshold = bytesFromBase64(object.threshold);
        }
        if (object.vetoThreshold !== undefined && object.vetoThreshold !== null) {
            message.vetoThreshold = bytesFromBase64(object.vetoThreshold);
        }
        return message;
    },
    toJSON: function (message) {
        var obj = {};
        message.quorum !== undefined &&
            (obj.quorum = base64FromBytes(message.quorum !== undefined ? message.quorum : new Uint8Array()));
        message.threshold !== undefined &&
            (obj.threshold = base64FromBytes(message.threshold !== undefined ? message.threshold : new Uint8Array()));
        message.vetoThreshold !== undefined &&
            (obj.vetoThreshold = base64FromBytes(message.vetoThreshold !== undefined
                ? message.vetoThreshold
                : new Uint8Array()));
        return obj;
    },
    fromPartial: function (object) {
        var message = __assign({}, baseTallyParams);
        if (object.quorum !== undefined && object.quorum !== null) {
            message.quorum = object.quorum;
        }
        else {
            message.quorum = new Uint8Array();
        }
        if (object.threshold !== undefined && object.threshold !== null) {
            message.threshold = object.threshold;
        }
        else {
            message.threshold = new Uint8Array();
        }
        if (object.vetoThreshold !== undefined && object.vetoThreshold !== null) {
            message.vetoThreshold = object.vetoThreshold;
        }
        else {
            message.vetoThreshold = new Uint8Array();
        }
        return message;
    }
};
var globalThis = (function () {
    if (typeof globalThis !== "undefined")
        return globalThis;
    if (typeof self !== "undefined")
        return self;
    if (typeof window !== "undefined")
        return window;
    if (typeof global !== "undefined")
        return global;
    throw "Unable to locate global object";
})();
var atob = globalThis.atob ||
    (function (b64) { return globalThis.Buffer.from(b64, "base64").toString("binary"); });
function bytesFromBase64(b64) {
    var bin = atob(b64);
    var arr = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; ++i) {
        arr[i] = bin.charCodeAt(i);
    }
    return arr;
}
var btoa = globalThis.btoa ||
    (function (bin) { return globalThis.Buffer.from(bin, "binary").toString("base64"); });
function base64FromBytes(arr) {
    var bin = [];
    for (var i = 0; i < arr.byteLength; ++i) {
        bin.push(String.fromCharCode(arr[i]));
    }
    return btoa(bin.join(""));
}
function toTimestamp(date) {
    var seconds = numberToLong(date.getTime() / 1000);
    var nanos = (date.getTime() % 1000) * 1000000;
    return { seconds: seconds, nanos: nanos };
}
function fromTimestamp(t) {
    var millis = t.seconds.toNumber() * 1000;
    millis += t.nanos / 1000000;
    return new Date(millis);
}
function fromJsonTimestamp(o) {
    if (o instanceof Date) {
        return o;
    }
    else if (typeof o === "string") {
        return new Date(o);
    }
    else {
        return fromTimestamp(timestamp_1.Timestamp.fromJSON(o));
    }
}
function numberToLong(number) {
    return long_1["default"].fromNumber(number);
}
if (minimal_1["default"].util.Long !== long_1["default"]) {
    minimal_1["default"].util.Long = long_1["default"];
    minimal_1["default"].configure();
}
