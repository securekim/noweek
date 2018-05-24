var fs = require('fs'); 
var https = require('https'); 
var utils = require('./utils');
//const {sha256} = utils;
var CN = "washer";

var options = { 
    hostname: 'localhost', 
    port: 4433, 
    path: '/', 
    method: 'GET',
    rejectUnauthorized: false, 
    key: fs.readFileSync('certs/attacker.key'), 
    cert: fs.readFileSync('certs/'+CN+'.pem'), 
    // checkServerIdentity: function(host, cert) {
    //  const pubkeysInBlock = ['pL1+qb9HTMRZJmuC/bB/ZI9d302BYrrqiVuRyW+DGrU='];
    //  console.log("SHA256 : CERT PUBLIC KEY:");
    //  console.log(sha256(cert.pubkey));
    //  for( var i in pubkeysInBlock){
    //     if (sha256(cert.pubkey) === pubkeysInBlock[i]) {
    //         break;
    //     } else if (i===pubkeysInBlock.length){
    //         const msg = 'Certificate verification error: ' +
    //           `The public key of '${cert.subject.CN}' ` +
    //           'does not match our pinned fingerprint';
    //         return new Error(msg);
    //     }
    //  }
    // }
}; 

options.agent = new https.Agent(options);
var req = https.request(options, function(res) {
    
    //We will verify server's modulus
    
    console.log(new Date()+' [CLIENT] Server Is :'+res.socket.getPeerCertificate().subject.CN+'');
    //console.log(res.socket.getPeerCertificate().modulus);
    console.log("VERIFY RESULT : "+utils.verifyKey(utils.getModHash(res)));
    

    res.on('data', function(data) {
        process.stdout.write(data); 
    }); 
    
}); 

req.end(); 

req.on('error', function(e) { 
    console.error(e); 
});
