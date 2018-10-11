

var PORT = 6024;
var dgram = require('dgram');
var server = dgram.createSocket('udp4');

server.on('listening', function () {
    var address = server.address();
    console.log('UDP server listening on ' + address.address + ":" + address.port);
    server.setBroadcast(true);
});

server.on('message', function (message, rinfo) {
    console.log('Message from: ' + rinfo.address + ':' + rinfo.port +' - ' + message);
});

server.bind(PORT);