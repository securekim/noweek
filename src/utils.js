var exec = require( "child_process" ).exec;
var crypto = require('crypto');
var fs = require ('fs');
var os = require ('os');
const request = require('request');
var clientPrime = "" // for speed. 2048... it's long time 
var dh = null;
var secret;
var NFC_FLAG=0; // 0 or 1.  


function nfcCheck(){
    return fs.readFileSync("nfcFlag");
}

function nfcTag(){
    try{
        fs.writeFileSync("nfcFlag",1);
        return 1;
    } catch (e){
        return 0;
    }
}

function nfcClear(){
    try{
        fs.writeFileSync("nfcFlag",1);
        return 1;
    } catch (e){
        return 0;
    }
}


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
    console.log(L_server_secret.length)
    var data = 'PLAINTEXT';
    
    const cipher = crypto.createCipher('aes-256-cbc', '열쇠');
    let result = cipher.update('encrypteTest', 'utf8', 'base64'); // 'HbMtmFdroLU0arLpMflQ'
    result += cipher.final('base64'); // 'HbMtmFdroLU0arLpMflQYtt8xEf4lrPn5tX5k+a8Nzw='
    
    const decipher = crypto.createDecipher('aes-256-cbc', '열쇠');
    let result2 = decipher.update(result, 'base64', 'utf8'); // 암호화할문 (base64, utf8이 위의 cipher과 반대 순서입니다.)
    result2 += decipher.final('utf8'); // 암호화할문장 (여기도 base64대신 utf8)

    console.log(result);
    console.log(result2);

    var encrypted = DH_encrypt(L_client_secret,data);
    var plain = DH_decrypt(L_server_secret,encrypted);

    console.log(encrypted);
    console.log(plain);

    } catch(err){
        console.log(err);
    }
}
    
function DH_encrypt(key,data){
    const cipher = crypto.createCipher('aes-256-cbc', key);
    data = new String(data);
    str = JSON.stringify(data);
    console.log("encrypt : "+typeof str);
    var result = cipher.update(str, 'utf8', 'base64');
    result += cipher.final('base64'); 
    return result;
}

function DH_decrypt(key,data){
    const decipher = crypto.createDecipher('aes-256-cbc', key);
    str = JSON.stringify(data);
    console.log("decrypt : "+typeof str);
    var result2 = decipher.update(str, 'base64', 'utf8'); 
    result2 += decipher.final('utf8'); 
    return result2;
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

function parseCert(cert){
    //return cert.getPeerCertificate();
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
        
        command = "bin/ss_write " + 'certs/'+CN+'.key';
        console.log("Execute command: " + command);
        child = exec(command, function(error, stdout, stderr) {
            if(error !== null){
                console.log("[ERROR] " + error);
            }
        });
        console.log("#######################");
        console.log("######### ARTIK #######");
        console.log("######### SAVE  #######");
        console.log("######### KEY   #######");
        console.log("######### TO    #######");
        console.log("######### SEE   #######");
        console.log("#######################");

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
    var pubkey=fs.readFileSync("certs/"+CN+"-CA.pub",'utf8');
    if(CN == "robot" || CN == "light" || CN == "mobile") {
        //return callback ("You don't need generate the newone");
        //This is for mobile certificate
        fs.readFile("certs/"+CN+"-CA.pem",'utf8',(err,CN_CA)=>{
            if(err) console.log(err);
            //FINALLY,,, We didn't parse the certificate...
            return callback({"CA":CN_CA,"PUBKEY":pubkey});
        })
    } else {
        console.log("[BRO] CREATE NEW CERTIFICATE !!! "+CN);
        CERT_createCA(CN+"-CA",(result)=>{
            if(result){
                CERT_createCERT(CN+"-CA",CN,(result)=>{
                    console.log("MAKE CERTIFICATE SIGNED BY CA :"+result);
                    if(result){
                        fs.readFile("certs/"+CN+"-CA.pem",'utf8',(err,CN_CA)=>{
                            if(err) console.log(err);
                            callback({"CA":CN_CA,"PUBKEY":pubkey});
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
    DH_localTest();
    CERT_initCERT(process.argv[2],(result)=>{
        //console.log(result);
    });
}

function makeBundle(chain,callback){
    //todo : make bundle with cadatas
    //      if bundle is updated, restart the server.

    // blocks = JSON.parse(chain.data);
    // var CADATA=[];
    // for(var i in blocks){
    //     CADATA.push(blocks[i].pubkey.split("#")[0].replace("\\n",""));
    // }
    // for(var i in CADATA){
    //     console.log(CADATA[i]);
    //     //fs.appendFileSync("certs/bundle.pem",CADATA[i]);
    // }
    // fs.writeFile("certs/bundle.pem",CADATA,(err)=>{
    //     if(err) console.log(err);
    //     callback(err);
    // });
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

function getIPABC(){
    try{
        var ip = os.networkInterfaces().wlan0[0].address.split('.');
        return ip[0]+"."+ip[1]+"."+ip[2];
    }catch(e){
        console.log("Can't get network. default : 192.168.0");
        return "192.168.0";
    }
}

function getCA(CN){
    return fs.readFileSync('certs/'+CN+'-CA.pem','utf8');
}

module.exports = {nfcCheck, nfcClear, nfcTag, getCA, DH_encrypt, DH_decrypt, getIPABC,startServer,restartServer,CERT_initCERT,makeBundle,DH_clean,clientPrime,DH_getMyPubKey,generatePin,DH_generate,sha256,loadPubkeys,getModHash,verifyKey};