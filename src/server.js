var fs = require('fs'); 
var https = require('https'); 
const crypto = require('crypto');

var CN = "fridge"

var options = { 
    key: fs.readFileSync('certs/'+CN+'.key'), 
    cert: fs.readFileSync('certs/'+CN+'.pem'), 
    //ca: fs.readFileSync('ca-crt.pem'), 
    requestCert: true, 
    rejectUnauthorized: false 
}; 

https.createServer(options, function (req, res) { 
    console.log(new Date()+' '+ 
        req.connection.remoteAddress+' '+ 
        req.socket.getPeerCertificate().subject.CN+' '+ 
        req.method+' '+req.url); 

    console.log(req.socket.getPeerCertificate());
    res.writeHead(200); 
    res.end("Mutual SSL, OK. \n"); 
}).listen(4433);