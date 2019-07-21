import { Meteor } from 'meteor/meteor';
import { Posts, Likes } from '../magpies.js';

publishComposite('magpie.list', function(address){
    return {
        find(){
            return Posts.find({"external_owner":address})
        },
        children: [
            {
                find(post){
                    return Likes.find(
                        {"post_id":post.id}
                    )
                }
            }
        ]
    }
});