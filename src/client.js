var fs = require('fs'); 
var https = require('https'); 
var utils = require('./utils');

var CN = "washer";

var options = { 
    hostname: 'localhost', 
    port: 4433, 
    path: '/', 
    method: 'GET',
    rejectUnauthorized: false, 
    key: fs.readFileSync('certs/'+CN+'.key'), 
    cert: fs.readFileSync('certs/'+CN+'.pem'), 
    //ca: fs.readFileSync('ca-crt.pem') 
    checkServerIdentity: function(host, cert) {
        console.log("HI");
    //SERVER's key will be in CHAIN
     const pubkeysInBlock = ['pL1+qb9HTMRZJmuC/bB/ZI9d302BYrrqiVuRyW+DGrU='];
     console.log("SHA256 : CERT PUBLIC KEY:");
     console.log(sha256(cert.pubkey));
     for( var i in pubkeysInBlock){
        if (sha256(cert.pubkey) === pubkeysInBlock[i]) {
            break;
        } else if (i===pubkeysInBlock.length){
            const msg = 'Certificate verification error: ' +
              `The public key of '${cert.subject.CN}' ` +
              'does not match our pinned fingerprint';
            return new Error(msg);
        }
     }
    }
}; 

options.agent = new https.Agent(options);
var req = https.request(options, function(res) {
    
    //We will verify server's modulus
    
    console.log(utils.sha256(res.socket.getPeerCertificate().modulus));

    res.on('data', function(data) {
        process.stdout.write(data); 
    }); 
    
}); 

req.end(); 

req.on('error', function(e) { 
    console.error(e); 
});
