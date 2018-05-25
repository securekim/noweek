var fs = require('fs'); 
var https = require('https'); 
var utils = require('./utils');
//const {sha256} = utils;
var CN = "washer";

var options_mutual = { 
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

options_mutual.agent = new https.Agent(options_mutual);
var req_mutual = https.request(options_mutual, function(res) {
    
    //We will verify server's modulus
    
    console.log(new Date()+' [CLIENT] Server Is :'+res.socket.getPeerCertificate().subject.CN+'');
    //console.log(res.socket.getPeerCertificate().modulus);
    console.log("VERIFY RESULT : "+utils.verifyKey(utils.getModHash(res)));
    

    res.on('data', function(data) {
        process.stdout.write(data); 
    }); 
    
}); 

req_mutual.end(); 

req_mutual.on('error', function(e) { 
    console.error(e); 
});





options_mutual.agent = new https.Agent(options_mutual);
var req_mutual = https.request(options_mutual, function(res) {
    
    //We will verify server's modulus
    
    console.log(new Date()+' [CLIENT] Server Is :'+res.socket.getPeerCertificate().subject.CN+'');
    //console.log(res.socket.getPeerCertificate().modulus);
    console.log("VERIFY RESULT : "+utils.verifyKey(utils.getModHash(res)));
    

    res.on('data', function(data) {
        process.stdout.write(data); 
    }); 
    
}); 

req_mutual.end(); 

req_mutual.on('error', function(e) { 
    console.error(e); 
});

function generate_PIN(){
    PostCode(JSON.stringify({prime:utils.clientPrime,pubkey:utils.DH_getMyPubKey(utils.clientPrime)}));
}


function PostCode(post_data) {
    
    var options_dh = { 
        hostname: 'localhost', 
        port: 4444, 
        path: '/', 
        method: 'POST',
        rejectUnauthorized: false,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(post_data)
        } 
    }
    
    var post_req = http.request(post_options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            console.log('Response: ' + chunk);
        });
    });
  
    post_req.write(post_data);
    post_req.end();
  }