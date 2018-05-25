var fs = require('fs'); 
var http = require('http');
var https = require('https'); 
const utils = require('./utils');

var CN = "attacker"
var pubkeys=utils.loadPubkeys();

var options_mutual = { 
    key: fs.readFileSync('certs/'+CN+'.key'), 
    cert: fs.readFileSync('certs/'+CN+'.pem'), 
    //ca: fs.readFileSync('ca-crt.pem'), 
    requestCert: true, 
    rejectUnauthorized: false 
}; 

https.createServer(options_mutual, function (req, res) { 
    console.log(new Date()+' [SERVER] Client Is :'+ 
        //req.connection.remoteAddress+' '+ 
        req.socket.getPeerCertificate().subject.CN+' ' 
        +req.method+' '+req.url
    ); 
    //if(req.url.split('/')[0])
    //We will verify client's modulus
    //console.log(utils.getModHash(req));
    //console.log("VERIFY RESULT : "+utils.verifyKey(utils.getModHash(req)));
    res.writeHead(200); 
    res.end("Mutual SSL, OK. \n"); 
}).listen(4433);


var options_dh = { 
    key: fs.readFileSync('certs/'+CN+'.key'), 
    cert: fs.readFileSync('certs/'+CN+'.pem'), 
    ca: fs.readFileSync('certs/'+CN+'-CA.pem'), 
    requestCert: true,  
}; 

https.createServer(options_dh, function (req, res) { 
    //this is for DH.
    //We dont need a client certificate. 
    console.log(new Date()+' '+ 
        +req.method+' '+req.url
    ); 
    res.writeHead(200); 
    res.end(utils.serverPrime); 
}).listen(4444);