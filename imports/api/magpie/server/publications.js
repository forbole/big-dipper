import { Meteor } from 'meteor/meteor';
import { Posts, Likes } from '../magpies.js';

publishComposite('magpie.list', function(address){
    return {
        find(){
            return Posts.find({"external_owner":address}, {sort:{created:-1}})
        },
        children: [
            {
                find(post){
                    return Likes.find(
                        {"post_id":post.id}
                    )
                }
            },
            {
                find(post){
                    return Posts.find(
                        {"parent_id": post.id}
                    )
                }
            }
        ]
    }
});