var fs = require('fs'); 
var https = require('https'); 
const utils = require('./utils');

var CN = "attacker"
var pubkeys=utils.loadPubkeys();

var options = { 
    key: fs.readFileSync('certs/'+CN+'.key'), 
    cert: fs.readFileSync('certs/'+CN+'.pem'), 
    //ca: fs.readFileSync('ca-crt.pem'), 
    requestCert: true, 
    rejectUnauthorized: false 
}; 

https.createServer(options, function (req, res) { 
    console.log(new Date()+' [SERVER] Client Is :'+ 
        //req.connection.remoteAddress+' '+ 
        req.socket.getPeerCertificate().subject.CN+' ' 
    //    req.method+' '+req.url
    ); 
    
    //We will verify client's modulus

    //console.log(req.socket.getPeerCertificate().modulus);
    console.log(utils.getModHash(req));

    console.log("VERIFY RESULT : "+utils.verifyKey(utils.getModHash(req)));
    res.writeHead(200); 
    res.end("Mutual SSL, OK. \n"); 
}).listen(4433);