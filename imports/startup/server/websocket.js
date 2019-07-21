import WebSocket from 'ws';
import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import { Posts, Likes, PostSessions } from '../../api/magpie/collections';

DESMOSRPC = Meteor.settings.remote.desmosRPC;
DESMOSLCD = Meteor.settings.remote.desmosLCD;
DESMOSWS = Meteor.settings.public.desmosWS;

let ws = new WebSocket(DESMOSWS);

// subscribe to magpie events 
ws.on('open', () => {
    console.log('connected');
    // ws.send('{"jsonrpc": "2.0","method": "subscribe","id":"0","params":{"query":"message.action=\'create_post\'"}}');
    ws.send(JSON.stringify({
        "jsonrpc": "2.0",
        "method": "subscribe",
        "id": "0",
        "params": {
            "query": "message.action='create_post'"
        }
    }))

    ws.send(JSON.stringify({
        "jsonrpc": "2.0",
        "method": "subscribe",
        "id": "0",
        "params": {
            "query": "message.action='edit_post'"
        }
    }))

    ws.send(JSON.stringify({
        "jsonrpc": "2.0",
        "method": "subscribe",
        "id": "0",
        "params": {
            "query": "message.action='like'"
        }
    }))

    ws.send(JSON.stringify({
        "jsonrpc": "2.0",
        "method": "subscribe",
        "id": "0",
        "params": {
            "query": "message.action='unlike'"
        }
    }))

    ws.send(JSON.stringify({
        "jsonrpc": "2.0",
        "method": "subscribe",
        "id": "0",
        "params": {
            "query": "message.action='create_session'"
        }
    }))
});

Meteor.methods({
    'Magpie.createPost': function(events){

    },
})

ws.on('message', Meteor.bindEnvironment((data) => {
    // console.log(data);
    txData = JSON.parse(data);
    // console.log(data);
    events = txData.result.events;
    if (events){
        console.log(events);
        switch (events['message.action'][0]){
            case 'create_post':
                createPost(events);
                break;
            case 'edit_post':
                editPost(events);
                break;
            case 'like':
                like(events);
                break;
            case 'unlike':
                unlike(events);
                break;
            case 'create_session':
                createSession(events);
                break;
            default:
                break;
                
        }
    }
}));

createPost = (events) => {
    let url = DESMOSLCD+"/magpie/posts/"+events['create_post.post_id'][0];

    try{
        let response = HTTP.get(url);
        if (response.statusCode == 200){
            try{
                Posts.insert(response.data)
            }
            catch(e){
                console.log(e)
            }
        }
    }
    catch (e){
        console.log(e);
    }
}

like = (events) => {
    let url = DESMOSLCD+"/magpie/like/"+events['like.like_id'][0];

    try{
        let response = HTTP.get(url);
        if (response.statusCode == 200){
            try{
                Likes.insert(response.data)

                url = DESMOSLCD+"/magpie/posts/"+events['like.post_id'][0];

                try {
                    response = HTTP.get(url);
                    if (response.statusCode == 200){
                        Posts.update({"id":response.data.id}, {$set:response.data});
                    }
                }
                catch (e){
                    console.log(e);
                }
            }
            catch (e){
                console.log(e)
            }
        }
    }
    catch (e){
        console.log(e);
    }
}

createSession = (events) => {
    let url = DESMOSLCD+"/magpie/session/"+events['create_session.session_id'][0];

    try{
        let response = HTTP.get(url);
        // data = JSON.parse(response.data);
        // console.log(response.data);
        if (response.statusCode == 200){
            try{
                PostSessions.insert(response.data)
            }
            catch(e){
                console.log(e)
            }
        }
    }
    catch (e){
        console.log(e);
    }
}