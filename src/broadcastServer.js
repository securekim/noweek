

var PORT = 6024;
var dgram = require('dgram');
var server = dgram.createSocket('udp4');
var utils = require('./utils');
var mac = "tt:tt:te:st:tt:tt";

server.on('listening', function () {
    var address = server.address();
    console.log('UDP server listening on ' + address.address + ":" + address.port);
    server.setBroadcast(true);
});

server.on('message', function (message, rinfo) {
    try { 
        console.log(mac);
        message = JSON.parse(message);
        mac = message.mac;
        dateTime = utils.getDateTime();
        console.log('UDP : ' + rinfo.address + ':' + rinfo.port +' - ' + message.CN + ":"+message.mac +" at "+dateTime);
    } catch (e){
        console.log(e);
    }
});

server.bind(PORT);