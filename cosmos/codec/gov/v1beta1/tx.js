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
exports.MsgClientImpl = exports.MsgDepositResponse = exports.MsgDeposit = exports.MsgVoteWeightedResponse = exports.MsgVoteWeighted = exports.MsgVoteResponse = exports.MsgVote = exports.MsgSubmitProposalResponse = exports.MsgSubmitProposal = exports.protobufPackage = void 0;
/* eslint-disable */
var long_1 = __importDefault(require("long"));
var minimal_1 = __importDefault(require("protobufjs/minimal"));
var any_1 = require("@cosmjs/stargate/build/codec/google/protobuf/any");
var gov_1 = require("./gov");
var coin_1 = require("@cosmjs/stargate/build/codec/cosmos/base/v1beta1/coin");
exports.protobufPackage = "cosmos.gov.v1beta1";
var baseMsgSubmitProposal = { proposer: "" };
exports.MsgSubmitProposal = {
    encode: function (message, writer) {
        if (writer === void 0) { writer = minimal_1["default"].Writer.create(); }
        if (message.content !== undefined) {
            any_1.Any.encode(message.content, writer.uint32(10).fork()).ldelim();
        }
        for (var _i = 0, _a = message.initialDeposit; _i < _a.length; _i++) {
            var v = _a[_i];
            coin_1.Coin.encode(v, writer.uint32(18).fork()).ldelim();
        }
        if (message.proposer !== "") {
            writer.uint32(26).string(message.proposer);
        }
        return writer;
    },
    decode: function (input, length) {
        var reader = input instanceof minimal_1["default"].Reader ? input : new minimal_1["default"].Reader(input);
        var end = length === undefined ? reader.len : reader.pos + length;
        var message = __assign({}, baseMsgSubmitProposal);
        message.initialDeposit = [];
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.content = any_1.Any.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.initialDeposit.push(coin_1.Coin.decode(reader, reader.uint32()));
                    break;
                case 3:
                    message.proposer = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON: function (object) {
        var message = __assign({}, baseMsgSubmitProposal);
        message.initialDeposit = [];
        if (object.content !== undefined && object.content !== null) {
            message.content = any_1.Any.fromJSON(object.content);
        }
        else {
            message.content = undefined;
        }
        if (object.initialDeposit !== undefined && object.initialDeposit !== null) {
            for (var _i = 0, _a = object.initialDeposit; _i < _a.length; _i++) {
                var e = _a[_i];
                message.initialDeposit.push(coin_1.Coin.fromJSON(e));
            }
        }
        if (object.proposer !== undefined && object.proposer !== null) {
            message.proposer = String(object.proposer);
        }
        else {
            message.proposer = "";
        }
        return message;
    },
    toJSON: function (message) {
        var obj = {};
        message.content !== undefined &&
            (obj.content = message.content ? any_1.Any.toJSON(message.content) : undefined);
        if (message.initialDeposit) {
            obj.initialDeposit = message.initialDeposit.map(function (e) {
                return e ? coin_1.Coin.toJSON(e) : undefined;
            });
        }
        else {
            obj.initialDeposit = [];
        }
        message.proposer !== undefined && (obj.proposer = message.proposer);
        return obj;
    },
    fromPartial: function (object) {
        var message = __assign({}, baseMsgSubmitProposal);
        message.initialDeposit = [];
        if (object.content !== undefined && object.content !== null) {
            message.content = any_1.Any.fromPartial(object.content);
        }
        else {
            message.content = undefined;
        }
        if (object.initialDeposit !== undefined && object.initialDeposit !== null) {
            for (var _i = 0, _a = object.initialDeposit; _i < _a.length; _i++) {
                var e = _a[_i];
                message.initialDeposit.push(coin_1.Coin.fromPartial(e));
            }
        }
        if (object.proposer !== undefined && object.proposer !== null) {
            message.proposer = object.proposer;
        }
        else {
            message.proposer = "";
        }
        return message;
    }
};
var baseMsgSubmitProposalResponse = { proposalId: long_1["default"].UZERO };
exports.MsgSubmitProposalResponse = {
    encode: function (message, writer) {
        if (writer === void 0) { writer = minimal_1["default"].Writer.create(); }
        if (!message.proposalId.isZero()) {
            writer.uint32(8).uint64(message.proposalId);
        }
        return writer;
    },
    decode: function (input, length) {
        var reader = input instanceof minimal_1["default"].Reader ? input : new minimal_1["default"].Reader(input);
        var end = length === undefined ? reader.len : reader.pos + length;
        var message = __assign({}, baseMsgSubmitProposalResponse);
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.proposalId = reader.uint64();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON: function (object) {
        var message = __assign({}, baseMsgSubmitProposalResponse);
        if (object.proposalId !== undefined && object.proposalId !== null) {
            message.proposalId = long_1["default"].fromString(object.proposalId);
        }
        else {
            message.proposalId = long_1["default"].UZERO;
        }
        return message;
    },
    toJSON: function (message) {
        var obj = {};
        message.proposalId !== undefined &&
            (obj.proposalId = (message.proposalId || long_1["default"].UZERO).toString());
        return obj;
    },
    fromPartial: function (object) {
        var message = __assign({}, baseMsgSubmitProposalResponse);
        if (object.proposalId !== undefined && object.proposalId !== null) {
            message.proposalId = object.proposalId;
        }
        else {
            message.proposalId = long_1["default"].UZERO;
        }
        return message;
    }
};
var baseMsgVote = { proposalId: long_1["default"].UZERO, voter: "", option: 0 };
exports.MsgVote = {
    encode: function (message, writer) {
        if (writer === void 0) { writer = minimal_1["default"].Writer.create(); }
        if (!message.proposalId.isZero()) {
            writer.uint32(8).uint64(message.proposalId);
        }
        if (message.voter !== "") {
            writer.uint32(18).string(message.voter);
        }
        if (message.option !== 0) {
            writer.uint32(24).int32(message.option);
        }

        return writer;
    },
    decode: function (input, length) {
        var reader = input instanceof minimal_1["default"].Reader ? input : new minimal_1["default"].Reader(input);
        var end = length === undefined ? reader.len : reader.pos + length;
        var message = __assign({}, baseMsgVote);
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.proposalId = reader.uint64();
                    break;
                case 2:
                    message.voter = reader.string();
                    break;
                case 3:
                    message.option = reader.int32();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON: function (object) {
        var message = __assign({}, baseMsgVote);
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
        if (object.option !== undefined && object.option !== null) {
            message.option = gov_1.voteOptionFromJSON(object.option);
        }
        else {
            message.option = 0;
        }
        return message;
    },
    toJSON: function (message) {
        var obj = {};
        message.proposalId !== undefined &&
            (obj.proposalId = (message.proposalId || long_1["default"].UZERO).toString());
        message.voter !== undefined && (obj.voter = message.voter);
        message.option !== undefined &&
            (obj.option = gov_1.voteOptionToJSON(message.option));
        return obj;
    },
    fromPartial: function (object) {
        var message = __assign({}, baseMsgVote);
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
        if (object.option !== undefined && object.option !== null) {
            message.option = object.option;
        }
        else {
            message.option = 0;
        }
        return message;
    }
};
var baseMsgVoteResponse = {};
exports.MsgVoteResponse = {
    encode: function (_, writer) {
        if (writer === void 0) { writer = minimal_1["default"].Writer.create(); }
        return writer;
    },
    decode: function (input, length) {
        var reader = input instanceof minimal_1["default"].Reader ? input : new minimal_1["default"].Reader(input);
        var end = length === undefined ? reader.len : reader.pos + length;
        var message = __assign({}, baseMsgVoteResponse);
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON: function (_) {
        var message = __assign({}, baseMsgVoteResponse);
        return message;
    },
    toJSON: function (_) {
        var obj = {};
        return obj;
    },
    fromPartial: function (_) {
        var message = __assign({}, baseMsgVoteResponse);
        return message;
    }
};
var baseMsgVoteWeighted = { proposalId: long_1["default"].UZERO, voter: "" };
exports.MsgVoteWeighted = {
    encode: function (message, writer) {
        if (writer === void 0) { writer = minimal_1["default"].Writer.create(); }
        if (!message.proposalId.isZero()) {
            writer.uint32(8).uint64(message.proposalId);
        }
        if (message.voter !== "") {
            writer.uint32(18).string(message.voter);
        }
        for (var _i = 0, _a = message.options; _i < _a.length; _i++) {
            var v = _a[_i];
            gov_1.WeightedVoteOption.encode(v, writer.uint32(26).fork()).ldelim();
        }
        return writer;
    },
    decode: function (input, length) {
        var reader = input instanceof minimal_1["default"].Reader ? input : new minimal_1["default"].Reader(input);
        var end = length === undefined ? reader.len : reader.pos + length;
        var message = __assign({}, baseMsgVoteWeighted);
        message.options = [];
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.proposalId = reader.uint64();
                    break;
                case 2:
                    message.voter = reader.string();
                    break;
                case 3:
                    message.options.push(gov_1.WeightedVoteOption.decode(reader, reader.uint32()));
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON: function (object) {
        var message = __assign({}, baseMsgVoteWeighted);
        message.options = [];
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
        if (object.options !== undefined && object.options !== null) {
            for (var _i = 0, _a = object.options; _i < _a.length; _i++) {
                var e = _a[_i];
                message.options.push(gov_1.WeightedVoteOption.fromJSON(e));
            }
        }
        return message;
    },
    toJSON: function (message) {
        var obj = {};
        message.proposalId !== undefined &&
            (obj.proposalId = (message.proposalId || long_1["default"].UZERO).toString());
        message.voter !== undefined && (obj.voter = message.voter);
        if (message.options) {
            obj.options = message.options.map(function (e) {
                return e ? gov_1.WeightedVoteOption.toJSON(e) : undefined;
            });
        }
        else {
            obj.options = [];
        }
        return obj;
    },
    fromPartial: function (object) {
        var message = __assign({}, baseMsgVoteWeighted);
        message.options = [];
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
        if (object.options !== undefined && object.options !== null) {
            for (var _i = 0, _a = object.options; _i < _a.length; _i++) {
                var e = _a[_i];
                message.options.push(gov_1.WeightedVoteOption.fromPartial(e));
            }
        }
        return message;
    }
};
var baseMsgVoteWeightedResponse = {};
exports.MsgVoteWeightedResponse = {
    encode: function (_, writer) {
        if (writer === void 0) { writer = minimal_1["default"].Writer.create(); }
        return writer;
    },
    decode: function (input, length) {
        var reader = input instanceof minimal_1["default"].Reader ? input : new minimal_1["default"].Reader(input);
        var end = length === undefined ? reader.len : reader.pos + length;
        var message = __assign({}, baseMsgVoteWeightedResponse);
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON: function (_) {
        var message = __assign({}, baseMsgVoteWeightedResponse);
        return message;
    },
    toJSON: function (_) {
        var obj = {};
        return obj;
    },
    fromPartial: function (_) {
        var message = __assign({}, baseMsgVoteWeightedResponse);
        return message;
    }
};
var baseMsgDeposit = { proposalId: long_1["default"].UZERO, depositor: "" };
exports.MsgDeposit = {
    encode: function (message, writer) {
        if (writer === void 0) { writer = minimal_1["default"].Writer.create(); }
        if (!message.proposalId.isZero()) {
            writer.uint32(8).int64(message.proposalId);
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
        var message = __assign({}, baseMsgDeposit);
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
        var message = __assign({}, baseMsgDeposit);
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
        var message = __assign({}, baseMsgDeposit);
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
var baseMsgDepositResponse = {};
exports.MsgDepositResponse = {
    encode: function (_, writer) {
        if (writer === void 0) { writer = minimal_1["default"].Writer.create(); }
        return writer;
    },
    decode: function (input, length) {
        var reader = input instanceof minimal_1["default"].Reader ? input : new minimal_1["default"].Reader(input);
        var end = length === undefined ? reader.len : reader.pos + length;
        var message = __assign({}, baseMsgDepositResponse);
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON: function (_) {
        var message = __assign({}, baseMsgDepositResponse);
        return message;
    },
    toJSON: function (_) {
        var obj = {};
        return obj;
    },
    fromPartial: function (_) {
        var message = __assign({}, baseMsgDepositResponse);
        return message;
    }
};
var MsgClientImpl = /** @class */ (function () {
    function MsgClientImpl(rpc) {
        this.rpc = rpc;
        this.SubmitProposal = this.SubmitProposal.bind(this);
        this.Vote = this.Vote.bind(this);
        this.VoteWeighted = this.VoteWeighted.bind(this);
        this.Deposit = this.Deposit.bind(this);
    }
    MsgClientImpl.prototype.SubmitProposal = function (request) {
        var data = exports.MsgSubmitProposal.encode(request).finish();
        var promise = this.rpc.request("cosmos.gov.v1beta1.Msg", "SubmitProposal", data);
        return promise.then(function (data) {
            return exports.MsgSubmitProposalResponse.decode(new minimal_1["default"].Reader(data));
        });
    };
    MsgClientImpl.prototype.Vote = function (request) {
        var data = exports.MsgVote.encode(request).finish();
        var promise = this.rpc.request("cosmos.gov.v1beta1.Msg", "Vote", data);
        return promise.then(function (data) { return exports.MsgVoteResponse.decode(new minimal_1["default"].Reader(data)); });
    };
    MsgClientImpl.prototype.VoteWeighted = function (request) {
        var data = exports.MsgVoteWeighted.encode(request).finish();
        var promise = this.rpc.request("cosmos.gov.v1beta1.Msg", "VoteWeighted", data);
        return promise.then(function (data) {
            return exports.MsgVoteWeightedResponse.decode(new minimal_1["default"].Reader(data));
        });
    };
    MsgClientImpl.prototype.Deposit = function (request) {
        var data = exports.MsgDeposit.encode(request).finish();
        var promise = this.rpc.request("cosmos.gov.v1beta1.Msg", "Deposit", data);
        return promise.then(function (data) {
            return exports.MsgDepositResponse.decode(new minimal_1["default"].Reader(data));
        });
    };
    return MsgClientImpl;
}());
exports.MsgClientImpl = MsgClientImpl;
if (minimal_1["default"].util.Long !== long_1["default"]) {
    minimal_1["default"].util.Long = long_1["default"];
    minimal_1["default"].configure();
}
