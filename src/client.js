
var fs = require('fs'); 
var tls = require('tls');
var https = require('https'); 
var utils = require('./utils');
var el_request = require('./el_request'); 
const querystring = require('querystring');
var el_server = require('./el_server');  //이거 삭제했다가 서버 안켜져서 곤욕을 치룸
var forge = require('node-forge');
var latestSecret;
const TIMEOUT = 10; //second. if TIMEOUT LATER, 연결이 끊긴 것으로 알거야.

//const {sha256} = utils;
try{
    var CN = fs.readFileSync("myProfile.txt",'utf8');
}catch(e){
    console.log(e);
    var CN = "fridge";
}
if(typeof CN ==="string") CN = CN.replace(/(\r\n\t|\n|\r\t)/gm,"");
    
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
        try{
            console.log(new Date()+' [CLIENT] Server Is :'+res.socket.getPeerCertificate().subject.CN+'');
        }catch(e){
            console.log(e);
        }
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

function broadcast(callback){
    callback(broadcastList);
}

function fillNull(i) {
    broadcastList[i].CN = "null";
    broadcastList[i].mac = "null";
    broadcastList[i].dateTime = "null";
}

setInterval(broadcast_garbageCollector, 5000);

function broadcast_garbageCollector(){
    for (var i in broadcastList) {
        if(typeof broadcastList[i].dateTime != "undefined") {
            if(utils.isTimeover(TIMEOUT, broadcastList[i].dateTime)){
                fillNull(i);
            }
        } else {
            fillNull(i);
        }
    }
}

function generatePin(ip,callback){
    try{
        var data = {prime:utils.clientPrime,pubkey:utils.DH_getMyPubKey(utils.clientPrime)};
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
                var CN = chunk.CN;
                const secret = utils.DH_generate(utils.clientPrime,chunk.pubkey);
                latestSecret = secret;
                const pin = utils.generatePin(secret);
                
                console.log("PIN : "+pin);
                //el_request.broadcast_addBlock(chunk.CA);
                callback({pin:pin,secret:secret,ip:options_dh.hostname,CN:CN});
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
        console.log("ConfirmPin");
        const myCA = utils.getCA(CN);
        
        // const cipher = crypto.createCipher('aes-256-cbc', jsonData.secret);
        // let encryptedCA = cipher.update(myCA, 'utf8', 'base64'); // 'HbMtmFdroLU0arLpMflQ'
        // encryptedCA += cipher.final('base64'); // 'HbMtmFdroLU0arLpMflQYtt8xEf4lrPn5tX5k+a8Nzw='

        encryptedCA = utils.DH_encrypt(jsonData.secret,myCA);

        console.log("encryptedCA : "+encryptedCA);
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
                chunk = JSON.parse(chunk);
                if(chunk.result){
                    var decryptedCA = utils.DH_decrypt(latestSecret,chunk.data);
                    chunk.data = decryptedCA;
                    //TODO : delete stringify
                    console.log("DECRYPTED CA : "+decryptedCA);
                    el_request.broadcast_addBlock(JSON.stringify({"CA":decryptedCA,"CN":chunk.CN,"PUBKEY":chunk.PUBKEY}));
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


function nfcTag(){
    return utils.nfcTag();
}

function nfcClear(){
    return utils.nfcClear();
}

function nfcCheck(){
    return utils.nfcCheck();
}

function initChain(CN,callback){
    utils.CERT_initCERT(CN,(DATA)=>{
        console.log("A");
        el_request.request_initBlockchain(JSON.stringify({"CA":DATA.CA,"CN":CN,"PUBKEY":DATA.PUBKEY}),(result)=>{

            callback(result);
            el_request.request_getBlockchain((result)=>{
                console.log(result);
                try{
                var data = result.data;
                var CERTDT=""; 
                for(var i in data){
                    CERTDT+=data[i].pubkey;
                }
                utils.makeBundle(CERTDT,(result)=>{
                    console.log(result);
                    utils.restartServer((result)=>{
                        console.log(result);
                    });
                });
                }catch(e){
                    console.log(e);
                }
            });
        });
        fs.writeFile('myProfile.txt',CN);
    });
}


///////////////////////////////////////// BROADCAST CLIENT//////////////

var dgram = require('dgram'); 
var client = dgram.createSocket("udp4"); 
var os = require('os');
var ip = os.networkInterfaces()//.address.split('.');

var mac="te:st:te:st:te:st";

//DEFAULT SETTING
try {
for(var i in ip){
    mac = ip[i][0].mac;
    var ipABC = ip[i][0].address.split('.');
    ipABC = ipABC[0] + "." + ipABC[1] + "." + ipABC[2];
}
} catch (e){
    console.log(e);
}

var PORT = 6024;

client.bind(function() {
    client.setBroadcast(true);
    setInterval(broadcastNew, 3*1000);
});

function broadcastNew() {
    var message = new Buffer(JSON.stringify({CN:CN, mac:mac}));
    client.send(message, 0, message.length, PORT, ipABC+".255", function() {
    });
}

///////////////////////////////////////// BROADCAST SERVER//////////////

var server = dgram.createSocket('udp4');

for (var i=1; i<255; i++) {
    broadcastList["IP_"+ipABC+"."+i] = {CN:"null", mac:"null", dateTime:"null"};
}

server.on('listening', function () {
    var address = server.address();
    console.log('UDP server listening on ' + address.address + ":" + address.port);
    server.setBroadcast(true);
});

server.on('message', function (message, rinfo) {
    try { 
        message = JSON.parse(message);
        dateTime = utils.getDateTime();
        broadcastList["IP_"+rinfo.address] = {CN:message.CN, mac:message.mac, dateTime:dateTime};
    } catch (e){
        console.log(e);
    }
});

server.bind(PORT);


////////////////////////////////////////////////////////////////////////
module.exports = {nfcCheck,nfcClear,nfcTag, confirmPin,clearBlockChain,getBlockChain,broadcast,generatePin,sendWithMutual,initChain};