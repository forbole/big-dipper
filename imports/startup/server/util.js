import bech32 from 'bech32'
import { HTTP } from 'meteor/http';
import * as cheerio from 'cheerio';
import { tmhash } from 'tendermint/lib/hash'
import { util } from 'chai';

// Load future from fibers
var Future = Npm.require("fibers/future");
// Load exec
var exec = Npm.require("child_process").exec;

function toHexString(byteArray) {
    return byteArray.map(function (byte) {
        return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('')
}

Meteor.methods({
    pubkeyToBech32: function (pubkey, prefix) {
        // '1624DE6420' is ed25519 pubkey prefix
        let pubkeyAminoPrefix = Buffer.from('1624DE6420', 'hex')
        let buffer = Buffer.alloc(37)
        pubkeyAminoPrefix.copy(buffer, 0)
        Buffer.from(pubkey?.value ?? pubkey, 'base64').copy(buffer, pubkeyAminoPrefix.length)
        return bech32.encode(prefix, bech32.toWords(buffer))
    },
    bech32ToPubkey: function (pubkey) {
        // '1624DE6420' is ed25519 pubkey prefix
        let pubkeyAminoPrefix = Buffer.from('1624DE6420', 'hex')
        let buffer = Buffer.from(bech32.fromWords(bech32.decode(pubkey).words));
        return buffer.slice(pubkeyAminoPrefix.length).toString('base64');
    },
    getDelegator: function (operatorAddr) {
        let address = bech32.decode(operatorAddr);
        return bech32.encode(Meteor.settings.public.bech32PrefixAccAddr, address.words);
    },
    getKeybaseTeamPic: function (keybaseUrl) {
        let teamPage = HTTP.get(keybaseUrl);
        if (teamPage.statusCode == 200) {
            let page = cheerio.load(teamPage.content);
            return page(".kb-main-card img").attr('src');
        }
    },
    getAddressFromPubkey: function (pubkey) {
        var bytes = Buffer.from(pubkey?.key || pubkey, 'base64');
        return tmhash(bytes).slice(0, 20).toString('hex').toUpperCase();
    },
    getVersion: function () {
        const version = Assets.getText('version');
        return version ? version : 'beta'
    },
    hexToBech32: function (address, prefix) {
        let addressBuffer = Buffer.from(address, 'hex');
        // let buffer = Buffer.alloc(37)
        // addressBuffer.copy(buffer);
        return bech32.encode(prefix, bech32.toWords(addressBuffer));
    },
    pubkeyToBech32New: function (pubkey, prefix) {
        let buffer;

        try {
            if (pubkey.type.indexOf("Ed25519") > 0) {
                // '1624DE6420' is ed25519 pubkey prefix
                let pubkeyAminoPrefix = Buffer.from('1624DE6420', 'hex');
                buffer = Buffer.alloc(37);

                pubkeyAminoPrefix.copy(buffer, 0)
                Buffer.from(pubkey.value, 'base64').copy(buffer, pubkeyAminoPrefix.length)
            }
            else if (pubkey.type.indexOf("Secp256k1") > 0) {
                // 'EB5AE98721' is secp256k1 pubkey prefix
                let pubkeyAminoPrefix = Buffer.from('EB5AE98721', 'hex');
                buffer = Buffer.alloc(38);

                pubkeyAminoPrefix.copy(buffer, 0)
                Buffer.from(pubkey.value, 'base64').copy(buffer, pubkeyAminoPrefix.length)
            }
            else {
                console.log("Pubkey type not supported.");
                return false;
            }

            return bech32.encode(prefix, bech32.toWords(buffer))
        }
        catch (e) {
            console.log("Error converting from pubkey to bech32: %o\n %o", pubkey, e);
            return false
        }
    },
    
    
})
