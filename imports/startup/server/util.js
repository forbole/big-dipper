import bech32 from 'bech32'

// Load future from fibers
var Future = Npm.require("fibers/future");
// Load exec
var exec = Npm.require("child_process").exec;

function toHexString(byteArray) {
    return byteArray.map(function(byte) {
        return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('')
}

Meteor.methods({
    runCode: function (command) {
        // This method call won't return immediately, it will wait for the
        // asynchronous code to finish, so we call unblock to allow this client
        // to queue other method calls (see Meteor docs)
        this.unblock();
        var future=new Future();
        exec(command,function(error,stdout,stderr){
        if(error){
            console.log(error);
            throw new Meteor.Error(500,command+" failed");
        }
        future.return(stdout.toString());
        });
        return future.wait();
    },
    getDelegator: function(operatorAddr){
        let address = bech32.decode(operatorAddr);
        // let hex = toHexString(bech32.fromWords(address.words)).toUpperCase();
        // // console.log(address);

        // let words = bech32.toWords(Buffer.from('foobar', 'utf8'))
        return bech32.encode(Meteor.settings.public.bech32PrefixAccAddr, address.words);
    }
})
