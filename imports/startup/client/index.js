// Import client startup through a single index entry point

// import './routes.js';


document.addEventListener('DOMContentLoaded', function () {
    if (!Notification) {
      alert('Desktop notifications not available in your browser. Try Chromium.'); 
      return;
    }
  
    if (Notification.permission !== 'granted')
      Notification.requestPermission();
  });

let ws = new WebSocket(Meteor.settings.public.desmosWS);

ws.onopen = function(){
    ws.send(JSON.stringify({
        "jsonrpc": "2.0",
        "method": "subscribe",
        "id": "0",
        "params": {
            "query": "message.action='create_post' AND create_post.external_owner='cosmos14kn0kk33szpwus9nh8n87fjel8djx0y0mmswhp'"
        }
    }))
}

ws.onmessage = function(msg){
    if (Notification.permission !== 'granted')
        Notification.requestPermission();
    else {
        let notification = new Notification('New Post', {
            body: msg,
        });
    }
}