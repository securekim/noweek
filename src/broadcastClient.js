
var dgram = require('dgram'); 
var client = dgram.createSocket("udp4"); 

var PORT = 6024;
var ipABC = "192.168.0";
var CN = "mobile";

client.bind(function() {
    client.setBroadcast(true);
    setInterval(broadcastNew, 3000);
});

function broadcastNew() {
    var message = new Buffer(CN);
    client.send(message, 0, message.length, PORT, ipABC+".255", function() {
        console.log("Sent CN '" + message + "' to "+ipABC+".255");
    });
}
