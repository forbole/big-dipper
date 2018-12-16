import { Mongo } from 'meteor/mongo';

export const ValidatorRecords = new Mongo.Collection('validator_records');
export const Analytics = new Mongo.Collection('analytics');
export const MissedBlocksStats = new Mongo.Collection('missed_blocks_stats');
