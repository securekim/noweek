
var fs = require('fs'); 
var tls = require('tls');
var https = require('https'); 
var utils = require('./utils');
const querystring = require('querystring');  
//const {sha256} = utils;
var CN = "washer";
const PORT_MUTUAL = 4433
const PORT_DH = 4444;

function sendWithMutual(ip,data,callback){

    var postData = querystring.stringify({command:data});
    
    var options_mutual = { 
        hostname: ip, 
        port: PORT_MUTUAL, 
        path: '/', 
        method: 'GET',
        rejectUnauthorized: true, // should be true 
        key: fs.readFileSync('certs/'+CN+'.key'), 
        cert: fs.readFileSync('certs/'+CN+'.pem'),
        ca: fs.readFileSync('certs/bundle.pem'),
        checkServerIdentity: function(host, cert) {
            // Make sure the certificate is issued to the host we are connected to
            console.log("Hello");
            const err = tls.checkServerIdentity(host, cert);
            if (err) {
              console.log(err.cert.subject.CN);
              console.log(err.cert.issuer.CN);
              //return err;
            }
        
            // Pin the public key, similar to HPKP pin-sha25 pinning
            // const pubkey256 = 'pL1+qb9HTMRZJmuC/bB/ZI9d302BYrrqiVuRyW+DGrU=';
            // if (sha256(cert.pubkey) !== pubkey256) {
            //   const msg = 'Certificate verification error: ' +
            //     `The public key of '${cert.subject.CN}' ` +
            //     'does not match our pinned fingerprint';
            //   return new Error(msg);
            // }
        
            // Pin the exact certificate, rather then the pub key
            // const cert256 = '25:FE:39:32:D9:63:8C:8A:FC:A1:9A:29:87:' +
            //   'D8:3E:4C:1D:98:DB:71:E4:1A:48:03:98:EA:22:6A:BD:8B:93:16';
            // if (cert.fingerprint256 !== cert256) {
            //   const msg = 'Certificate verification error: ' +
            //     `The certificate of '${cert.subject.CN}' ` +
            //     'does not match our pinned fingerprint';
            //   return new Error(msg);
            // }
        
            // This loop is informational only.
            // Print the certificate and public key fingerprints of all certs in the
            // chain. Its common to pin the public key of the issuer on the public
            // internet, while pinning the public key of the service in sensitive
            // environments.
            // do {
            //   console.log('Subject Common Name:', cert.subject.CN);
            //   console.log('  Certificate SHA256 fingerprint:', cert.fingerprint256);
        
            //   hash = crypto.createHash('sha256');
            //   console.log('  Public key ping-sha256:', sha256(cert.pubkey));
        
            //   lastprint256 = cert.fingerprint256;
            //   cert = cert.issuerCertificate;
            // } while (cert.fingerprint256 !== lastprint256);
        
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': postData.length
        } 
    }; 
    


    options_mutual.agent = new https.Agent(options_mutual);

    var req_mutual = https.request(options_mutual,function(res) {
        
        //We will verify server's modulus
        
        console.log(new Date()+' [CLIENT] Server Is :'+res.socket.getPeerCertificate().subject.CN+'');
        //console.log(res.socket.getPeerCertificate().modulus);
        //console.log("VERIFY RESULT : "+utils.verifyKey(utils.getModHash(res)));
        

        res.on('data', function(chunk) {
            //process.stdout.write(data); 
            callback(chunk);
        }); 
        
    }); 

    
    req_mutual.write(postData);
    req_mutual.end(); 
    req_mutual.on('error', function(e) { 
        console.error(e); 
    });
}

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

module.exports = {generatePin,sendWithMutual};