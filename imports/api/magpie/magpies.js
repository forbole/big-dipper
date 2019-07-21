import { Mongo } from 'meteor/mongo';

export const PostSessions = new Mongo.Collection('magpie_post_sessions');
export const Posts = new Mongo.Collection('magpie_posts');
export const Likes = new Mongo.Collection('magpie_likes');
