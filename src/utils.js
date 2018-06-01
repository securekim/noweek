var exec = require( "child_process" ).exec;
var crypto = require('crypto');
var fs = require ('fs');
var os = require ('os');
var clientPrime = "" // for speed. 2048... it's long time ...
var dh = null;
var secret;

try {
    console.log("read DiffieHellman Prime");
    clientPrime = fs.readFileSync("certs/DH_1024.prime",'base64');
} catch(e){
    console.log("Generate DiffieHellman Prime");
    client = crypto.createDiffieHellman(1024,'base64');
    clientPrime = client.getPrime('base64');
    fs.writeFileSync("certs/DH_1024.prime",clientPrime);
}
if(typeof clientPrime ==="string") clientPrime = clientPrime.replace(/(\r\n\t|\n|\r\t)/gm,"");
    

/*
// Generate Alice's keys...
const alice = crypto.createDiffieHellman(2048);
const aliceKey = alice.generateKeys();

// Generate Bob's keys...
const bob = crypto.createDiffieHellman(alice.getPrime(), alice.getGenerator());
const bobKey = bob.generateKeys();

// Exchange and generate the secret...
const aliceSecret = alice.computeSecret(bobKey);
const bobSecret = bob.computeSecret(aliceKey);
*/

//DH_localTest();
function DH_localTest(){
    try{
    //client = crypto.createDiffieHellman(1024,'base64');
    //clientPrime = client.getPrime('base64');
    L_clientPrime = clientPrime;
    //client will send the prime to server
    //client will send the client public key to server
    const client_dh = crypto.createDiffieHellman(L_clientPrime,'base64');
    L_client_pubkey = client_dh.generateKeys('base64');
    //server will generate public key with clientPrime
    const server_dh = crypto.createDiffieHellman(L_clientPrime,'base64');
    L_server_pubkey = server_dh.generateKeys('base64');
    
    //server will generate secret with client public key
    L_server_secret = server_dh.computeSecret(L_client_pubkey,'base64','base64');
    //server will send the server public key to client
    //client will generate secret with server public key
    L_client_secret = client_dh.computeSecret(L_server_pubkey,'base64','base64');
    console.log(L_server_secret);
    console.log(L_client_secret);
    console.log(L_server_secret === L_client_secret);
    } catch(err){
        console.log(err);
    }
}
    
function DH_encrypt(data){
    
}

function DH_generate(prime,pubkey){
    try{
    //dh = crypto.createDiffieHellman(prime,'base64');
    console.log("[UTILS] PRIME : "+prime);
    console.log("[UTILS] PUB KEY : "+pubkey);
    const pub = pubkey;
    if(dh===null){
        console.log("[UTILS] DH_generate : DH IS NULL");
        dh = crypto.createDiffieHellman(prime,'base64')
        dh.generateKeys();
    }
    //myPubkey = dh.generateKeys();
    secret = dh.computeSecret(pub,'base64','base64');
    console.log(secret);
    return secret;
    }catch(e){
        console.log(e);
        return e;
    }
}
function DH_clean(){
    dh=null;
}
function DH_getMyPubKey(prime){
    try{
        if(dh===null){
            console.log("[UTILS] DH_getMyPubKey : DH IS NULL");
            dh = crypto.createDiffieHellman(prime,'base64')
            dh.generateKeys('base64');
        }
        return dh.getPublicKey('base64'); 
    } catch(e){
        console.log(e);
        return e;
    }
}

//var pubkeys = loadPubkeys();

//if you want to create certificate, 
//just command to this.
//node utils.js <CommonName>

function verifyKey(pubkey){
    for (var i in pubkeys){
        if(pubkeys[i]===pubkey){
            return true;
        }
    }
    console.log("HACKER DETECTED !!!");
    return false;
}

function sha256(content){
    //remove all line break; 
    if(typeof content ==="string") content = content.replace(/(\r\n\t|\n|\r\t)/gm,"");
    return crypto.createHash('sha256').update(content).digest('hex');
}

function getModHash(REQ_RES){
    return sha256(REQ_RES.socket.getPeerCertificate().modulus);
}

function loadPubkeys(){
    //this will replaced.
    var arr=[];
    arr.push(fs.readFileSync('certs/washer.m','utf8'));
    arr.push(fs.readFileSync('certs/fridge.m','utf8'));
    return arr;
}

function generatePin(data){
    try{
        var hash = sha256(data).substring(0,6);
        return hash;
    }catch(e){
        console.log(e);
        return "a3082b";
    }
}

function CERT_createKey(CN,keylen,callback){
    exec('openssl genrsa -out certs/'+CN+'.key '+keylen, function(error, stdout, stderr) {
        if(error !== null) {
            console.log("Create Cert Key : " + error);
            callback({fail:true,error:error});
        } else {
            callback({fail:false,error:"none"});
        }
    });
}

function CERT_csr(CN,callback){
    exec('openssl req -new -key certs/'+CN+'.key -nodes -subj "/C=KR/O=noweek, Inc./OU=www.securekim.com/OU=(c) 2018 noweek, Inc./CN='+CN+'" -out certs/'+CN+'.csr', function(error, stdout, stderr) {
        if(error !== null) {
            console.log("Create CSR : " + error);
            callback({fail:true,error:error});
        } else {
            callback({fail:false,error:"none"});
        }
    });         
}

function CERT_sign(CSR,CA,days,callback){
    //openssl x509 -req -days 500 -in demo.csr -CA CA-CA.crt -CAkey root.key -CAcreateserial -out my.crt
    var execstr = 'openssl x509 -req -days '+days+' -in certs/'+CSR+'.csr -signkey certs/'+CA+'.key -out certs/'+CSR+'.pem';
    if(CSR !== CA) execstr = 'openssl x509 -req -days '+days+' -in certs/'+CSR+'.csr -CA certs/'+CA+'.pem -CAkey certs/'+CA+'.key -CAcreateserial -out certs/'+CSR+'.pem'; 
    exec(execstr, function(error, stdout, stderr) {
        if(error !== null) {
            console.log("Sign CSR : " + error);
            callback({fail:true,error:error});
        } else {
            callback({fail:false,error:"none"});
        }
    });  
}

///for command line

function CERT_createCA(CN,callback){
    CERT_createKey(CN,4096,(result)=>{
        if(result.fail) return callback(false);
        CERT_csr(CN,(result)=>{
            if(result.fail) return callback(false);
            CERT_sign(CN,CN,36500,(result)=>{
                if(result.fail) return callback(false);
                else return callback(true);
            })
        });
    });
}

function CERT_createCERT(CA,CN,callback){
    CERT_createKey(CN,2048,(result)=>{
      if(result.fail) return callback(false);
      CERT_csr(CN,(result)=>{
        if(result.fail) return callback(false);
        CERT_sign(CN,CA,14,(result)=>{
            if(result.fail) return callback(false);
            else return callback(true);
        });
      });
    });
}

function CERT_initCERT(CN,callback){
    CERT_createCA(CN+"-CA",(result)=>{
        if(result){
            CERT_createCERT(CN+"-CA",CN,(result)=>{
                console.log("MAKE CERTIFICATE SIGNED BY CA :"+result);
                if(result){
                    fs.readFile("certs/"+CN+"-CA.pem",'utf8',(err,CN_CA)=>{
                        if(err) console.log(err);
                        callback(CN_CA);
                    })
                } else {
                    callback("Fail to Generate Certificate"+CN);
                }
            });
        } else {
            callback("Fail to Generate CA Certificate");
        }
    });
}

function callbacktest(callback){
    return callback(1); //if no return, below code will be executed.
    console.log("dont"); 
}

if(process.argv.length >2){
    //node utils.js washer --> args[2]
    //make washerCA key, csr, selfsigned cert
    //make washer key, csr, signed by washerCA
    //console.log(process.argv[2]);
    CERT_initCERT(process.argv[2]);
}

function makeBundle(CADATA,callback){
    //todo : make bundle with cadatas
    //      if bundle is updated, restart the server.
    fs.writeFile("certs/bundle.pem",CADATA,(err)=>{
        if(err) console.log(err);
        callback(err);
    });
}

function startServer(callback){
    exec('node server.js', function(error, stdout, stderr) {
        if(error !== null) {
            console.log("start server.js : " + error);
            callback({fail:true,error:error});
        } else {
            callback({fail:false,error:"none"});
        }
    });
}

function restartServer(callback){
    exec("pkill -f 'node server.js'", function(error, stdout, stderr) {
        startServer((err)=>{
            callback(err);
        });
    });
}

function getCN(ip){

}

function getIPABC(){
    try{
        var ip = os.networkInterfaces().wlan0[0].address.split('.');
        return ip[0]+"."+ip[1]+"."+ip[2];
    }catch(e){
        console.log(e);
        return interfaces;
    }
}


module.exports = {getIPABC,startServer,restartServer,CERT_initCERT,makeBundle,DH_clean,clientPrime,DH_getMyPubKey,generatePin,DH_generate,sha256,loadPubkeys,getModHash,verifyKey};