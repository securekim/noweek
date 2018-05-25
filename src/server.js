var fs = require('fs'); 
var http = require('http');
var https = require('https'); 
const utils = require('./utils');
const MUTUAL_PORT = 4433
const DH_PORT = 4444;

var CN = "attacker"
//var pubkeys=utils.loadPubkeys();

var options_mutual = { 
    key: fs.readFileSync('certs/'+CN+'.key'), 
    cert: fs.readFileSync('certs/'+CN+'.pem'), 
    //ca: fs.readFileSync('ca-crt.pem'), 
    requestCert: true, 
    rejectUnauthorized: false 
}; 

console.log("Open for mutual SSL : "+MUTUAL_PORT);
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
}).listen(MUTUAL_PORT);


/////////////////////////////////////////////////////

var options_dh = { 
    key: fs.readFileSync('certs/'+CN+'.key'), 
    cert: fs.readFileSync('certs/'+CN+'.pem'), 
    ca: fs.readFileSync('certs/'+CN+'-CA.pem'), 
    requestCert: true,  
}; 


console.log("Open for DH Key exchange :"+DH_PORT);
https.createServer(options_dh, function (req, res) { 
    //this is for DH.
    //We dont need a client certificate. 
    var body = '';
    req.on('data', function (data) {
        body += data;
    });

    req.on('end', function () {
        console.log(new Date()+' '+ 
        +req.method+' '+req.url
        );
        try{
            dh = JSON.parse(body);
            console.log("prime: " + dh.prime);
            console.log("client pubkey: " + dh.pubkey);
            
            res.end(utils.DH_getMyPubKey(dh.prime));
            utils.DH_generate(dh.prime, dh.pubkey); 
        }catch(e){
            console.log(e);
        }
    }); 
    res.writeHead(200); 
}).listen(DH_PORT);
