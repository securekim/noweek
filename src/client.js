
var fs = require('fs'); 
var https = require('https'); 
var utils = require('./utils');
const querystring = require('querystring');  
//const {sha256} = utils;
var CN = "washer";
const PORT_MUTUAL = 4433
const PORT_DH = 4444;


var options_mutual = { 
    hostname: 'localhost', 
    port: PORT_MUTUAL, 
    path: '/', 
    method: 'GET',
    rejectUnauthorized: false, 
    key: fs.readFileSync('certs/'+CN+'.key'), 
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
    //console.log("VERIFY RESULT : "+utils.verifyKey(utils.getModHash(res)));
    

    res.on('data', function(data) {
        process.stdout.write(data); 
    }); 
    
}); 

req_mutual.end(); 

req_mutual.on('error', function(e) { 
    console.error(e); 
});


function generatePin(ip,callback){
    try{
        var data = {prime:utils.clientPrime,pubkey:utils.DH_getMyPubKey(utils.clientPrime)};
        //console.log("[CLIENT] client prime : "+ data.prime);
        //console.log("[CLIENT] client pubkey : "+ data.pubkey);
        //callback(PostCode(data,ip));
        
        var postData = querystring.stringify(data);
        
        var options_dh = { 
            hostname: ip, 
            port: PORT_DH, 
            path: '/', 
            method: 'POST',
            rejectUnauthorized: false,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': postData.length
            } 
        }
        try{
        var post_req = https.request(options_dh, function(res) {
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                const secret = utils.DH_generate(utils.clientPrime,chunk);
                //console.log('[CLIENT] Server pubkey: ' + chunk);
                //console.log("[CLIENT] client secret : "+ secret);
                const pin = utils.generatePin(secret);
                console.log("PIN : "+pin);
                callback(pin);
                utils.DH_clean();
            });
        });
        post_req.write(postData);
        post_req.end();
        }catch(e){
            console.log(e);
        }


    }catch(e){
        console.log(e);
    }
}


function PostCode(post_data,ip) {

}

module.exports = {generatePin};