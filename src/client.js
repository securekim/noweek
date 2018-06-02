
var fs = require('fs'); 
var tls = require('tls');
var https = require('https'); 
var utils = require('./utils');
var async = require('async');
var el_request = require('./el_request'); 
var el_server = require('./el_server'); 
const querystring = require('querystring');
var crypto = require('crypto');  
var forge = require('node-forge');
var pki = forge.pki;
//const {sha256} = utils;
var CN = "washer";
const PORT_MUTUAL = 4433
const PORT_DH = 4444;

console.log("[CLIENT] I Will Start the server");
utils.startServer((result)=>{
    console.log("[CLIENT] Start Server Automatically");  // if server is started already, error will be occured.
    console.log("[CLIENT] FAIL ? :"+result.fail);
});

function getBlockChain(callback){
    el_request.request_getBlockchain((json)=>{
        try{
        /*
        for(var i in json.data){
            console.log(i);
            var pem = JSON.parse(json.data)[i].pubkey
            console.log(pem);
            
            var cert = pki.certificateFromPem(pem);
            if(typeof cert ==="string") cert = cert.replace(/(\r\n\t|\n|\r\t)/gm,"");
            var asn1Cert = pki.certificateToAsn1(cert);
            var publicKey = pki.publicKeyFromPem(cert);
            console.log("Certificate !!!");
            console.log(publicKey);
        }*/
        callback(json);
    } catch(e){
        console.log(e);
    }
    });
}


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

var broadcastList = {};
var ipabc;

function broadcast(callback){
    ipabc = utils.getIPABC();
    callback(broadcastList);
}

ipabc = utils.getIPABC();
broadcast_loop();

setInterval(function(){
    broadcast_loop();
},100*255);

function broadcast_loop(){
    var options_broad = {
        hostname: "", 
        port: PORT_DH, 
        path: '/', 
        method: 'GET',
        rejectUnauthorized: false,
        timeout: 500
    }

    function requestTo(ip){
        options_broad.hostname = ipabc+"."+ip
        
        var post_req = https.request(options_broad, function(res) {
            res.setEncoding('utf8');
            var CN = res.socket.getPeerCertificate().subject.CN;
            console.log(CN);
            //console.log(res.socket);
            broadcastList["IP_"+res.connection.remoteAddress] = CN;
            //console.log(arr);
            res.setTimeout(500);
            res.on('timeout',()=>{
                broadcastList["IP_"+res.connection.remoteAddress] = 'null';
            });
        })
    
        post_req.on('socket',function(socket){
            socket.setTimeout(100);
            socket.on('timeout',()=>{
                var ip = socket._pendingData.split(":")[1].split(" ")[1];
                broadcastList["IP_"+ip] = 'null';
                post_req.abort();
            });
        })

        post_req.on('error',(e)=>{
            broadcastList["IP_"+post_req.socket.connection.remoteAddress] = 'null';
            post_req.abort();
        });
        // post_req.on('error',()=>{
        //     console.log("error");
        //     startIP++;
        //     return next();
        // });
        post_req.write("");
        post_req.end();
    }

    for(var i =1; i<255; i++){
        requestTo(i);
    }
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
                chunk = JSON.parse(chunk);
                const secret = utils.DH_generate(utils.clientPrime,chunk.pubkey);
                //console.log('[CLIENT] Server pubkey: ' + chunk);
                //console.log("[CLIENT] client secret : "+ secret);
                const pin = utils.generatePin(secret);
                
                console.log("PIN : "+pin);
                //el_request.broadcast_addBlock(chunk.CA);
                callback({pin:pin,secret:secret,ip:options_dh.hostname,CN:res.socket.getPeerCertificate().subject.CN});
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


function confirmPin(jsonData,callback){
    try{
        console.log(jsonData.CN);
        console.log(typeof jsonData.CN);
        const myCA = utils.getCA(jsonData.CN);
        
        const cipher = crypto.createCipher('aes-256-cbc', jsonData.secret);
        let encryptedCA = cipher.update(myCA, 'utf8', 'base64'); // 'HbMtmFdroLU0arLpMflQ'
        encryptedCA += cipher.final('base64'); // 'HbMtmFdroLU0arLpMflQYtt8xEf4lrPn5tX5k+a8Nzw='

        //encryptedCA = utils.DH_encrypt(myCA);
        //pin, secret, ip, CN
        //el_request.broadcast_addBlock(chunk.CA);
        var options_dh = { 
            hostname: jsonData.ip, 
            port: PORT_DH, 
            path: '/confirmPin', 
            method: 'POST',
            rejectUnauthorized: false,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': encryptedCA.length
            } 
        }
        
        try{
        var post_req = https.request(options_dh, function(res) {
            res.setEncoding('utf8');
            res.on('data', function (chunk) { // OTher's CA cert
                //chunk = JSON.parse(chunk);
                console.log("Client Get chunk in ")
                if(chunk.result){
                    //{result:true,data:encryptedCA}
                    const decipher = crypto.createDecipher('aes-256-cbc', 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
                    let decryptedCA = decipher.update(chunk.data, 'base64', 'utf8'); // 암호화할문 (base64, utf8이 위의 cipher과 반대 순서입니다.)
                    decryptedCA += decipher.final('utf8'); // 암호화할문장 (여기도 base64대신 utf8)
                    chunk.data = decryptedCA;
                } 
                callback(chunk);
            });
        });
        post_req.write(encryptedCA); 
        post_req.end();
        }catch(e){
            console.log(e);
        }
    }catch(e){
        console.log(e);
    }
}

function clearBlockChain(callback){
    el_request.request_clearBlockchain((result)=>{
      callback(result);  
    });
}

function initChain(CN,callback){
    utils.CERT_initCERT(CN,(CA)=>{
        ///callback(result);
        el_request.request_initBlockchain(CA+"###"+CN+"###",(result)=>{
            callback(result);
        });
        utils.restartServer((result)=>{
            console.log(result)
        });
    });
}

module.exports = {confirmPin,clearBlockChain,getBlockChain,broadcast,generatePin,sendWithMutual,initChain};