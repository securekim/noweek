
var fs = require('fs'); 
var tls = require('tls');
var https = require('https'); 
var utils = require('./utils');
var async = require('async');
const querystring = require('querystring');  
//const {sha256} = utils;
var CN = "washer";
const PORT_MUTUAL = 4433
const PORT_DH = 4444;

console.log("[CLIENT] I Will Start the server");
utils.startServer((result)=>{
    console.log("[CLIENT] Start Server Automatically");  // if server is started already, error will be occured.
    console.log("[CLIENT] FAIL ? :"+result.fail);
});

function sendWithMutual(ip,data,callback){

    var postData = querystring.stringify({command:data});
    
    var options_mutual = { 
        hostname: ip, 
        port: PORT_MUTUAL, 
        path: '/', 
        method: 'POST',
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

function broadcast(callback){
    
    var options_broad = { 
        hostname: "", 
        port: PORT_DH, 
        path: '/', 
        method: 'GET',
        rejectUnauthorized: false,
    }

    var arr = [];
    var ipabc = utils.getIPABC();

    function httpsRequest(ip,doneCallback){
        //console.log("httpsRequest : "+ip);
        options_broad.hostname = ip;
        try{
            var post_req = https.request(options_broad, function(res) {
                var CN = res.socket.getPeerCertificate().subject.CN;
                //console.log(CN);
                arr.push({CN:CN, ip:ip});
                doneCallback(arr);
            });
            post_req.write("");
            post_req.end();
        }catch(e){
            //console.log(e);
            doneCallback(arr);
        }
    }

    iparr =[];
    for(var i=1; i<255; i++){
        iparr.push(ipabc+"."+i);
    }

    async.each(iparr, httpsRequest, function(arr){
        callback(arr);
    })
    
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

function initChain(CN,callback){
    utils.CERT_initCERT(CN,(result)=>{
        callback(result);
        utils.restartServer((resut)=>{
            console.log(result)
        });
    });
}

module.exports = {broadcast,generatePin,sendWithMutual,initChain};