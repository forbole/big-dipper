import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';

Meteor.methods({
    'messages.get':function(id){
        let url = LCD + '/posts/'+id;
        console.log(url)
        let response = HTTP.get(url);
        let message = JSON.parse(response.content);
        console.log(message.result);
        return message.result;
    }
})