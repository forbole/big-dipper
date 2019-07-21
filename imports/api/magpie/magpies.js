import { Mongo } from 'meteor/mongo';

export const PostSessions = new Mongo.Collection('magpie_post_sessions');
export const Posts = new Mongo.Collection('magpie_posts');
export const Likes = new Mongo.Collection('magpie_likes');

Posts.helpers({
    likes(){
        return Likes.find({post_id:this.id}).fetch();
    },
    replies(){
        return Posts.find({parent_id:this.id}).fetch();
    }
})
