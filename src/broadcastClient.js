
var dgram = require('dgram'); 
var client = dgram.createSocket("udp4"); 
var os = require('os');
var ip = os.networkInterfaces()//.address.split('.');

var mac="te:st:te:st:te:st";
var ipABC="192.168.0";
var CN = "mobile";

//DEFAULT SETTING
try {
for(var i in ip){
    var mac = ip[i][0].mac;
    var ipABC = ip[i][0].address.split('.');
    ipABC = ipABC[0] + "." + ipABC[1] + "." + ipABC[2];
}
} catch (e){
    console.log(e);
}

console.log(ip);

var PORT = 6024;

client.bind(function() {
    client.setBroadcast(true);
    setInterval(broadcastNew, 3000);
});

function broadcastNew() {
    var message = new Buffer(JSON.stringify({CN:CN, mac:mac}));
    client.send(message, 0, message.length, PORT, ipABC+".255", function() {
        console.log("Sent CN '" + message + "' to "+ipABC+".255");
    });
}
