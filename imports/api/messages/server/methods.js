import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';

Meteor.methods({
    'messages.get':function(id){
        let url = LCD + '/posts/'+id;
        let response = HTTP.get(url);
        let message = JSON.parse(response.content);
        return message.result;
    }
})