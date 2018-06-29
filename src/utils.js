var exec = require( "child_process" ).exec;
var crypto = require('crypto');
var fs = require ('fs');
var os = require ('os');
const request = require('request');
var clientPrime = "" // for speed. 2048... it's long time 
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
    if(CN == "robot" || CN == "light" || CN == "mobile") return callback ("You don't need generate the newone");
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
    DH_localTest();
    CERT_initCERT(process.argv[2],(result)=>{
        //console.log(result);
    });
}


 var dummy_chain ={
    "result": true,
    "data": "[{\"index\":0,\"timestamp\":1527964954509,\"previousHash\":\"\",\"pubkey\":\"\\\"-----BEGIN CERTIFICATE-----\\\\nMIIFZDCCA0wCCQCWmE2GRj4v0jANBgkqhkiG9w0BAQsFADBzMQswCQYDVQQGEwJL\\\\nUjEVMBMGA1UECgwMbm93ZWVrLCBJbmMuMRowGAYDVQQLDBF3d3cuc2VjdXJla2lt\\\\nLmNvbTEeMBwGA1UECwwVKGMpIDIwMTggbm93ZWVrLCBJbmMuMREwDwYDVQQDDAhs\\\\naWdodC1DQTAgFw0xODA2MDIxNTE5MDRaGA8yMTE4MDUwOTE1MTkwNFowczELMAkG\\\\nA1UEBhMCS1IxFTATBgNVBAoMDG5vd2VlaywgSW5jLjEaMBgGA1UECwwRd3d3LnNl\\\\nY3VyZWtpbS5jb20xHjAcBgNVBAsMFShjKSAyMDE4IG5vd2VlaywgSW5jLjERMA8G\\\\nA1UEAwwIbGlnaHQtQ0EwggIiMA0GCSqGSIb3DQEBAQUAA4ICDwAwggIKAoICAQCy\\\\nMzAQJWj9hI5lgNOIdtntzLx326maF/Ty7BdUSpbGfIiuInfMQkKmOGBotMCoWSYv\\\\neXHW3fUWpjasvMpzzbEoA/6ZkYYsUOn0iIBKCqoH1PqNegM5pSlrnwLbNYNZhulC\\\\nX6CDaKVM0KdmXFoAcnuaLWZiFnBEPytcNV5X0Q2tBV5F6jzAOeeyFlSeo5DycVVc\\\\nD2z+cpJhRRQVVcDFg+6EkO9nO9uZ5iOlQYfEkp+9Mq2sNVvWpEoIeO/A/0cusHXY\\\\n4HHJ0UJEvJBtLtBf7eEzm8+z84ZPeKJkzjBPnzIMoAuKvhMRFJ4wbhOoo7TtOJUr\\\\n/XETC3HHKboQ/UnAyQt19ThDSwZrFdD6tLwM0o7UXSGvcB+T5VzHVxGpPb35IQ1o\\\\nJEeP5cYhEnJNibDUdEhpUAYdptG/7AUZISFfbHtLH09GpanEvvrLtJXf8K2eIzVT\\\\nvWdpQ9iqXn3WKmurpGbUFKY762wV/+VS0PROWBq0HjjZP0EEcvbP2rdv63utdvtO\\\\n7z1vPinUn7ShHfiVfioP/DX8/eiwmc/yh89dSZ4nRPfRISHtRU4o3Gq6aaTDYx8q\\\\nM3zT5uETncr8J1vZkCtZt4QQD7VNHh/GcBDip0bQJkdBDBJojxoUoszsErRzd1Mg\\\\nPeLkYGp4M7/CAmh4kqL1A/RxfKcQ724bgT/dpu9dzwIDAQABMA0GCSqGSIb3DQEB\\\\nCwUAA4ICAQBONnLayYNOF8EAIh/4bQ1962WMNk5tJEjAL4JPZQ/JnfwlaNqWw+yV\\\\ncfyeVPmciPm88VuQ5vEGsMyviLIUowHLG5sQzS57TBLR5gJoYrR1s7taK6LJLzGm\\\\n+bd11aq8rERsFXLA9RsO5248qoa0McP2KUmC26zMxjYGCAYpMZeLXkBIP8lRCOb7\\\\nCMEF91I7I/WwRTAFk1HOeSjHps+dNyLvEgeuCGJqnIFGoCbYt3jSZ5odZjmaiglz\\\\n720QZ4WtbDidofbxSL1LOg2gsuBWiMwbOuKY5ihemefFVdi4/fsKq+o1Izpye0Ko\\\\nblN9sCZWIQwIfk8rEgAbkv79LAKuGVTrLiskqaHB95YWRQYwK/ZLRKsju7UDj21H\\\\n8/dT3y0oOICVhY9T9so+UB3OLe8yHlHea5egVJn09AEKBURft4GfTytQORvYojqX\\\\n9Fojfg/Z2Yp3tMfvqtkh3/BFn+cV/+15ceSOX0LNpbwSy5yIYXkoahxdSbN6ocoZ\\\\nrKasWyrbFz4AUNrTa1YDW+jZf8tDu6v/BGYQ9NB4prnxl/QCF38cQVHtlzW2kPUv\\\\n+Q7dRgeJoQPHNWE1hor4L6hGPzm48qBLXPNOv6zNjrAYE/3owR1O0UX4L7kMK8mJ\\\\nr6MaW2uEBT4L8UhjLi22UXDzYTUwcMrmPrAjUjxH/tIXwiv0YD+MAA==\\\\n-----END CERTIFICATE-----\\\\n\\\"###mobile###\",\"hash\":\"d42f1f359a859ece3aef811627d45f5dcbeef984aee4de76fc13bec78e562943\",\"signature\":\"GSEJsGcreUEKJaFavCI2ePNbI8VRrTNnKpHk4d/3MJxlzTAf9AUpScTufwiuHEWGU32lPM8poruqoBLz40i8fARNKg0XfT29nW8iQX2hHDW4i+UxQSIyR5ENsr3gb/lYSSHrMkS16lX7MvuC1mF68KBu7yGulMlEUx54eULnsrXjpaLcrLHq9/rbYk/3awrYR85wYPXDkkdOUihPgWrOAh2k9vb0JJAyu6GKmwHrrpiJJa8rLhH0c8EdXLFw4D37WDeNoxbvfc0MiWUSu8oSiqz1uAHEI9rg3Ri4yhkD80IbCVCICyZN5YDxLQNdsYRspMMf4d6uB52qkX2/nwosug==\"},{\"index\":1,\"timestamp\":1527964954855,\"previousHash\":\"d42f1f359a859ece3aef811627d45f5dcbeef984aee4de76fc13bec78e562943\",\"pubkey\":\"\\\"-----BEGIN CERTIFICATE-----\\\\nMIIFZDCCA0wCCQCWmE2GRj4v0jANBgkqhkiG9w0BAQsFADBzMQswCQYDVQQGEwJL\\\\nUjEVMBMGA1UECgwMbm93ZWVrLCBJbmMuMRowGAYDVQQLDBF3d3cuc2VjdXJla2lt\\\\nLmNvbTEeMBwGA1UECwwVKGMpIDIwMTggbm93ZWVrLCBJbmMuMREwDwYDVQQDDAhs\\\\naWdodC1DQTAgFw0xODA2MDIxNTE5MDRaGA8yMTE4MDUwOTE1MTkwNFowczELMAkG\\\\nA1UEBhMCS1IxFTATBgNVBAoMDG5vd2VlaywgSW5jLjEaMBgGA1UECwwRd3d3LnNl\\\\nY3VyZWtpbS5jb20xHjAcBgNVBAsMFShjKSAyMDE4IG5vd2VlaywgSW5jLjERMA8G\\\\nA1UEAwwIbGlnaHQtQ0EwggIiMA0GCSqGSIb3DQEBAQUAA4ICDwAwggIKAoICAQCy\\\\nMzAQJWj9hI5lgNOIdtntzLx326maF/Ty7BdUSpbGfIiuInfMQkKmOGBotMCoWSYv\\\\neXHW3fUWpjasvMpzzbEoA/6ZkYYsUOn0iIBKCqoH1PqNegM5pSlrnwLbNYNZhulC\\\\nX6CDaKVM0KdmXFoAcnuaLWZiFnBEPytcNV5X0Q2tBV5F6jzAOeeyFlSeo5DycVVc\\\\nD2z+cpJhRRQVVcDFg+6EkO9nO9uZ5iOlQYfEkp+9Mq2sNVvWpEoIeO/A/0cusHXY\\\\n4HHJ0UJEvJBtLtBf7eEzm8+z84ZPeKJkzjBPnzIMoAuKvhMRFJ4wbhOoo7TtOJUr\\\\n/XETC3HHKboQ/UnAyQt19ThDSwZrFdD6tLwM0o7UXSGvcB+T5VzHVxGpPb35IQ1o\\\\nJEeP5cYhEnJNibDUdEhpUAYdptG/7AUZISFfbHtLH09GpanEvvrLtJXf8K2eIzVT\\\\nvWdpQ9iqXn3WKmurpGbUFKY762wV/+VS0PROWBq0HjjZP0EEcvbP2rdv63utdvtO\\\\n7z1vPinUn7ShHfiVfioP/DX8/eiwmc/yh89dSZ4nRPfRISHtRU4o3Gq6aaTDYx8q\\\\nM3zT5uETncr8J1vZkCtZt4QQD7VNHh/GcBDip0bQJkdBDBJojxoUoszsErRzd1Mg\\\\nPeLkYGp4M7/CAmh4kqL1A/RxfKcQ724bgT/dpu9dzwIDAQABMA0GCSqGSIb3DQEB\\\\nCwUAA4ICAQBONnLayYNOF8EAIh/4bQ1962WMNk5tJEjAL4JPZQ/JnfwlaNqWw+yV\\\\ncfyeVPmciPm88VuQ5vEGsMyviLIUowHLG5sQzS57TBLR5gJoYrR1s7taK6LJLzGm\\\\n+bd11aq8rERsFXLA9RsO5248qoa0McP2KUmC26zMxjYGCAYpMZeLXkBIP8lRCOb7\\\\nCMEF91I7I/WwRTAFk1HOeSjHps+dNyLvEgeuCGJqnIFGoCbYt3jSZ5odZjmaiglz\\\\n720QZ4WtbDidofbxSL1LOg2gsuBWiMwbOuKY5ihemefFVdi4/fsKq+o1Izpye0Ko\\\\nblN9sCZWIQwIfk8rEgAbkv79LAKuGVTrLiskqaHB95YWRQYwK/ZLRKsju7UDj21H\\\\n8/dT3y0oOICVhY9T9so+UB3OLe8yHlHea5egVJn09AEKBURft4GfTytQORvYojqX\\\\n9Fojfg/Z2Yp3tMfvqtkh3/BFn+cV/+15ceSOX0LNpbwSy5yIYXkoahxdSbN6ocoZ\\\\nrKasWyrbFz4AUNrTa1YDW+jZf8tDu6v/BGYQ9NB4prnxl/QCF38cQVHtlzW2kPUv\\\\n+Q7dRgeJoQPHNWE1hor4L6hGPzm48qBLXPNOv6zNjrAYE/3owR1O0UX4L7kMK8mJ\\\\nr6MaW2uEBT4L8UhjLi22UXDzYTUwcMrmPrAjUjxH/tIXwiv0YD+MAA==\\\\n-----END CERTIFICATE-----\\\\n\\\"###light###\",\"hash\":\"09cfb017dd0dc8274ee99d338b8b200d20f0687e8adb75c7fce8c40650baecdb\",\"signature\":\"KlkCwkwuVi8X6r81BM5LjAcyWV5Nu+m3HNhoCuj2tTV8jxu7CTFDQTBK6PqqeXeluCYwwxogaziYLYxAIkW6aid6o26Rvkr4NHlx8NYNDgoTaQo5AEsDYFBtqJYgwc+QMEURP9UQjU9A9JRq6+9crtIE3mHsNQyThqNdsECVt6pOb/qFK6IYhlwS3pmoLL10PnJ3Hs3d2n0aFvA67Zk/VuiWAnJl3rcRNmb0BJxK8J4x5MTeL5SbJTERE5HiF7RsOcqX6t9LuTymDJVcsk+0W7ORrYtivNnlJ722L4BGZ/ZB+MqAuwLnyc7Tweftk/ZFs76bAbhUI4BDzE4NYFHO5A==\"},{\"index\":2,\"timestamp\":1527966179960,\"previousHash\":\"09cfb017dd0dc8274ee99d338b8b200d20f0687e8adb75c7fce8c40650baecdb\",\"pubkey\":\"\\\"-----BEGIN CERTIFICATE-----\\\\nMIIFZDCCA0wCCQCWmE2GRj4v0jANBgkqhkiG9w0BAQsFADBzMQswCQYDVQQGEwJL\\\\nUjEVMBMGA1UECgwMbm93ZWVrLCBJbmMuMRowGAYDVQQLDBF3d3cuc2VjdXJla2lt\\\\nLmNvbTEeMBwGA1UECwwVKGMpIDIwMTggbm93ZWVrLCBJbmMuMREwDwYDVQQDDAhs\\\\naWdodC1DQTAgFw0xODA2MDIxNTE5MDRaGA8yMTE4MDUwOTE1MTkwNFowczELMAkG\\\\nA1UEBhMCS1IxFTATBgNVBAoMDG5vd2VlaywgSW5jLjEaMBgGA1UECwwRd3d3LnNl\\\\nY3VyZWtpbS5jb20xHjAcBgNVBAsMFShjKSAyMDE4IG5vd2VlaywgSW5jLjERMA8G\\\\nA1UEAwwIbGlnaHQtQ0EwggIiMA0GCSqGSIb3DQEBAQUAA4ICDwAwggIKAoICAQCy\\\\nMzAQJWj9hI5lgNOIdtntzLx326maF/Ty7BdUSpbGfIiuInfMQkKmOGBotMCoWSYv\\\\neXHW3fUWpjasvMpzzbEoA/6ZkYYsUOn0iIBKCqoH1PqNegM5pSlrnwLbNYNZhulC\\\\nX6CDaKVM0KdmXFoAcnuaLWZiFnBEPytcNV5X0Q2tBV5F6jzAOeeyFlSeo5DycVVc\\\\nD2z+cpJhRRQVVcDFg+6EkO9nO9uZ5iOlQYfEkp+9Mq2sNVvWpEoIeO/A/0cusHXY\\\\n4HHJ0UJEvJBtLtBf7eEzm8+z84ZPeKJkzjBPnzIMoAuKvhMRFJ4wbhOoo7TtOJUr\\\\n/XETC3HHKboQ/UnAyQt19ThDSwZrFdD6tLwM0o7UXSGvcB+T5VzHVxGpPb35IQ1o\\\\nJEeP5cYhEnJNibDUdEhpUAYdptG/7AUZISFfbHtLH09GpanEvvrLtJXf8K2eIzVT\\\\nvWdpQ9iqXn3WKmurpGbUFKY762wV/+VS0PROWBq0HjjZP0EEcvbP2rdv63utdvtO\\\\n7z1vPinUn7ShHfiVfioP/DX8/eiwmc/yh89dSZ4nRPfRISHtRU4o3Gq6aaTDYx8q\\\\nM3zT5uETncr8J1vZkCtZt4QQD7VNHh/GcBDip0bQJkdBDBJojxoUoszsErRzd1Mg\\\\nPeLkYGp4M7/CAmh4kqL1A/RxfKcQ724bgT/dpu9dzwIDAQABMA0GCSqGSIb3DQEB\\\\nCwUAA4ICAQBONnLayYNOF8EAIh/4bQ1962WMNk5tJEjAL4JPZQ/JnfwlaNqWw+yV\\\\ncfyeVPmciPm88VuQ5vEGsMyviLIUowHLG5sQzS57TBLR5gJoYrR1s7taK6LJLzGm\\\\n+bd11aq8rERsFXLA9RsO5248qoa0McP2KUmC26zMxjYGCAYpMZeLXkBIP8lRCOb7\\\\nCMEF91I7I/WwRTAFk1HOeSjHps+dNyLvEgeuCGJqnIFGoCbYt3jSZ5odZjmaiglz\\\\n720QZ4WtbDidofbxSL1LOg2gsuBWiMwbOuKY5ihemefFVdi4/fsKq+o1Izpye0Ko\\\\nblN9sCZWIQwIfk8rEgAbkv79LAKuGVTrLiskqaHB95YWRQYwK/ZLRKsju7UDj21H\\\\n8/dT3y0oOICVhY9T9so+UB3OLe8yHlHea5egVJn09AEKBURft4GfTytQORvYojqX\\\\n9Fojfg/Z2Yp3tMfvqtkh3/BFn+cV/+15ceSOX0LNpbwSy5yIYXkoahxdSbN6ocoZ\\\\nrKasWyrbFz4AUNrTa1YDW+jZf8tDu6v/BGYQ9NB4prnxl/QCF38cQVHtlzW2kPUv\\\\n+Q7dRgeJoQPHNWE1hor4L6hGPzm48qBLXPNOv6zNjrAYE/3owR1O0UX4L7kMK8mJ\\\\nr6MaW2uEBT4L8UhjLi22UXDzYTUwcMrmPrAjUjxH/tIXwiv0YD+MAA==\\\\n-----END CERTIFICATE-----\\\\n\\\"###light###\",\"hash\":\"957baa347b17a2a42a891ad48be4d6e2af973316060c052a8ffc9bb855d68396\",\"signature\":\"BV7RPdrU5DCoWZ2weMVgxKYvPE/UUfbov/5sPTd7IGkocODQiCtce+wKChHjyPTRJ5PY0xKZSdhBqbZ3K1BtZDY59Ch+5McA8JNCKEqSTU/ADQ4x3VtiUaqWqtoJJhvBi0pkCgXHgnwk6nn4bcmDiFFVQZJd2bqITLW4oTb4NA9AD32/mfhn34ymVQzydBvfTG/evQAxkgr/zZ6KJ1hlDVknWQdlADWmKilR/yhwHAV9Pt+10TL0Qg2Nt0n/EIuVKZfO42/biGlUxFQER60AeanjrmrY6nEff4OfHp4PzjShlhuHG4B/2Qwgjxk5b5Tw+tnkVIDGjjtdVZABEq1AWQ==\"},{\"index\":3,\"timestamp\":1527972733770,\"previousHash\":\"957baa347b17a2a42a891ad48be4d6e2af973316060c052a8ffc9bb855d68396\",\"pubkey\":\"\\\"-----BEGIN CERTIFICATE-----\\\\nMIIFZDCCA0wCCQCWmE2GRj4v0jANBgkqhkiG9w0BAQsFADBzMQswCQYDVQQGEwJL\\\\nUjEVMBMGA1UECgwMbm93ZWVrLCBJbmMuMRowGAYDVQQLDBF3d3cuc2VjdXJla2lt\\\\nLmNvbTEeMBwGA1UECwwVKGMpIDIwMTggbm93ZWVrLCBJbmMuMREwDwYDVQQDDAhs\\\\naWdodC1DQTAgFw0xODA2MDIxNTE5MDRaGA8yMTE4MDUwOTE1MTkwNFowczELMAkG\\\\nA1UEBhMCS1IxFTATBgNVBAoMDG5vd2VlaywgSW5jLjEaMBgGA1UECwwRd3d3LnNl\\\\nY3VyZWtpbS5jb20xHjAcBgNVBAsMFShjKSAyMDE4IG5vd2VlaywgSW5jLjERMA8G\\\\nA1UEAwwIbGlnaHQtQ0EwggIiMA0GCSqGSIb3DQEBAQUAA4ICDwAwggIKAoICAQCy\\\\nMzAQJWj9hI5lgNOIdtntzLx326maF/Ty7BdUSpbGfIiuInfMQkKmOGBotMCoWSYv\\\\neXHW3fUWpjasvMpzzbEoA/6ZkYYsUOn0iIBKCqoH1PqNegM5pSlrnwLbNYNZhulC\\\\nX6CDaKVM0KdmXFoAcnuaLWZiFnBEPytcNV5X0Q2tBV5F6jzAOeeyFlSeo5DycVVc\\\\nD2z+cpJhRRQVVcDFg+6EkO9nO9uZ5iOlQYfEkp+9Mq2sNVvWpEoIeO/A/0cusHXY\\\\n4HHJ0UJEvJBtLtBf7eEzm8+z84ZPeKJkzjBPnzIMoAuKvhMRFJ4wbhOoo7TtOJUr\\\\n/XETC3HHKboQ/UnAyQt19ThDSwZrFdD6tLwM0o7UXSGvcB+T5VzHVxGpPb35IQ1o\\\\nJEeP5cYhEnJNibDUdEhpUAYdptG/7AUZISFfbHtLH09GpanEvvrLtJXf8K2eIzVT\\\\nvWdpQ9iqXn3WKmurpGbUFKY762wV/+VS0PROWBq0HjjZP0EEcvbP2rdv63utdvtO\\\\n7z1vPinUn7ShHfiVfioP/DX8/eiwmc/yh89dSZ4nRPfRISHtRU4o3Gq6aaTDYx8q\\\\nM3zT5uETncr8J1vZkCtZt4QQD7VNHh/GcBDip0bQJkdBDBJojxoUoszsErRzd1Mg\\\\nPeLkYGp4M7/CAmh4kqL1A/RxfKcQ724bgT/dpu9dzwIDAQABMA0GCSqGSIb3DQEB\\\\nCwUAA4ICAQBONnLayYNOF8EAIh/4bQ1962WMNk5tJEjAL4JPZQ/JnfwlaNqWw+yV\\\\ncfyeVPmciPm88VuQ5vEGsMyviLIUowHLG5sQzS57TBLR5gJoYrR1s7taK6LJLzGm\\\\n+bd11aq8rERsFXLA9RsO5248qoa0McP2KUmC26zMxjYGCAYpMZeLXkBIP8lRCOb7\\\\nCMEF91I7I/WwRTAFk1HOeSjHps+dNyLvEgeuCGJqnIFGoCbYt3jSZ5odZjmaiglz\\\\n720QZ4WtbDidofbxSL1LOg2gsuBWiMwbOuKY5ihemefFVdi4/fsKq+o1Izpye0Ko\\\\nblN9sCZWIQwIfk8rEgAbkv79LAKuGVTrLiskqaHB95YWRQYwK/ZLRKsju7UDj21H\\\\n8/dT3y0oOICVhY9T9so+UB3OLe8yHlHea5egVJn09AEKBURft4GfTytQORvYojqX\\\\n9Fojfg/Z2Yp3tMfvqtkh3/BFn+cV/+15ceSOX0LNpbwSy5yIYXkoahxdSbN6ocoZ\\\\nrKasWyrbFz4AUNrTa1YDW+jZf8tDu6v/BGYQ9NB4prnxl/QCF38cQVHtlzW2kPUv\\\\n+Q7dRgeJoQPHNWE1hor4L6hGPzm48qBLXPNOv6zNjrAYE/3owR1O0UX4L7kMK8mJ\\\\nr6MaW2uEBT4L8UhjLi22UXDzYTUwcMrmPrAjUjxH/tIXwiv0YD+MAA==\\\\n-----END CERTIFICATE-----\\\\n\\\"###light###\",\"hash\":\"70c240b8ecee5b620680a8fa4c6375fd416c554cede4c0a0ddd4c02b1bace60e\",\"signature\":\"yPyRgRfSnBS25gsdQzZTFlbF3srgLzx651nt91n/x5IEG0rm/R+dONdC5wT58llNN9M/7Sg0uXNNm+w/+bHBh11IG334c31BNL5opdKtZRSmcaDu3uzqKacc+PqCFeNKc2y3tu1ThGitVmoQX62x70Xwre6T6aWrAFuKb4wYx1JGlSTtZpz36KgzsINw3SJaxkr+p/Udeyn5mnfJ8WRvdzR+DAMivnbuWZIpyLjWF+CDoURg/1778O0tTz1fMkoizuWa9dG2ud2YydgKTlxfe9ahkhptFoxx7A8M4loNgMH/YARbHVidkd/fQ3BzFRjigTA6tXYJi6hXigcvX4y//w==\"},{\"index\":4,\"timestamp\":1527974962506,\"previousHash\":\"70c240b8ecee5b620680a8fa4c6375fd416c554cede4c0a0ddd4c02b1bace60e\",\"pubkey\":\"\\\"-----BEGIN CERTIFICATE-----\\\\nMIIFZDCCA0wCCQCWmE2GRj4v0jANBgkqhkiG9w0BAQsFADBzMQswCQYDVQQGEwJL\\\\nUjEVMBMGA1UECgwMbm93ZWVrLCBJbmMuMRowGAYDVQQLDBF3d3cuc2VjdXJla2lt\\\\nLmNvbTEeMBwGA1UECwwVKGMpIDIwMTggbm93ZWVrLCBJbmMuMREwDwYDVQQDDAhs\\\\naWdodC1DQTAgFw0xODA2MDIxNTE5MDRaGA8yMTE4MDUwOTE1MTkwNFowczELMAkG\\\\nA1UEBhMCS1IxFTATBgNVBAoMDG5vd2VlaywgSW5jLjEaMBgGA1UECwwRd3d3LnNl\\\\nY3VyZWtpbS5jb20xHjAcBgNVBAsMFShjKSAyMDE4IG5vd2VlaywgSW5jLjERMA8G\\\\nA1UEAwwIbGlnaHQtQ0EwggIiMA0GCSqGSIb3DQEBAQUAA4ICDwAwggIKAoICAQCy\\\\nMzAQJWj9hI5lgNOIdtntzLx326maF/Ty7BdUSpbGfIiuInfMQkKmOGBotMCoWSYv\\\\neXHW3fUWpjasvMpzzbEoA/6ZkYYsUOn0iIBKCqoH1PqNegM5pSlrnwLbNYNZhulC\\\\nX6CDaKVM0KdmXFoAcnuaLWZiFnBEPytcNV5X0Q2tBV5F6jzAOeeyFlSeo5DycVVc\\\\nD2z+cpJhRRQVVcDFg+6EkO9nO9uZ5iOlQYfEkp+9Mq2sNVvWpEoIeO/A/0cusHXY\\\\n4HHJ0UJEvJBtLtBf7eEzm8+z84ZPeKJkzjBPnzIMoAuKvhMRFJ4wbhOoo7TtOJUr\\\\n/XETC3HHKboQ/UnAyQt19ThDSwZrFdD6tLwM0o7UXSGvcB+T5VzHVxGpPb35IQ1o\\\\nJEeP5cYhEnJNibDUdEhpUAYdptG/7AUZISFfbHtLH09GpanEvvrLtJXf8K2eIzVT\\\\nvWdpQ9iqXn3WKmurpGbUFKY762wV/+VS0PROWBq0HjjZP0EEcvbP2rdv63utdvtO\\\\n7z1vPinUn7ShHfiVfioP/DX8/eiwmc/yh89dSZ4nRPfRISHtRU4o3Gq6aaTDYx8q\\\\nM3zT5uETncr8J1vZkCtZt4QQD7VNHh/GcBDip0bQJkdBDBJojxoUoszsErRzd1Mg\\\\nPeLkYGp4M7/CAmh4kqL1A/RxfKcQ724bgT/dpu9dzwIDAQABMA0GCSqGSIb3DQEB\\\\nCwUAA4ICAQBONnLayYNOF8EAIh/4bQ1962WMNk5tJEjAL4JPZQ/JnfwlaNqWw+yV\\\\ncfyeVPmciPm88VuQ5vEGsMyviLIUowHLG5sQzS57TBLR5gJoYrR1s7taK6LJLzGm\\\\n+bd11aq8rERsFXLA9RsO5248qoa0McP2KUmC26zMxjYGCAYpMZeLXkBIP8lRCOb7\\\\nCMEF91I7I/WwRTAFk1HOeSjHps+dNyLvEgeuCGJqnIFGoCbYt3jSZ5odZjmaiglz\\\\n720QZ4WtbDidofbxSL1LOg2gsuBWiMwbOuKY5ihemefFVdi4/fsKq+o1Izpye0Ko\\\\nblN9sCZWIQwIfk8rEgAbkv79LAKuGVTrLiskqaHB95YWRQYwK/ZLRKsju7UDj21H\\\\n8/dT3y0oOICVhY9T9so+UB3OLe8yHlHea5egVJn09AEKBURft4GfTytQORvYojqX\\\\n9Fojfg/Z2Yp3tMfvqtkh3/BFn+cV/+15ceSOX0LNpbwSy5yIYXkoahxdSbN6ocoZ\\\\nrKasWyrbFz4AUNrTa1YDW+jZf8tDu6v/BGYQ9NB4prnxl/QCF38cQVHtlzW2kPUv\\\\n+Q7dRgeJoQPHNWE1hor4L6hGPzm48qBLXPNOv6zNjrAYE/3owR1O0UX4L7kMK8mJ\\\\nr6MaW2uEBT4L8UhjLi22UXDzYTUwcMrmPrAjUjxH/tIXwiv0YD+MAA==\\\\n-----END CERTIFICATE-----\\\\n\\\"###light###\",\"hash\":\"902e67ddb613f6819cb20585e89cb005d95cf598a2e1596aa6df1411fc1995e1\",\"signature\":\"tTphrYiIisbzHbkeTeCShk5IvYIdMq8hCyPIWYuXVxgtIdF081geTZsP+QyI+VhXqKUdKsIBTkld/ElifkMjhTBHkHijOOoQqDpKkjKWzJgXHDiDReTi+8QYpa2YcTiKBPbc8XDeqGb3Sydq86D6rw4Nl+JGOQS4J5ixdH2qmXS1oSSXm7iHtWcrQc2V+wepdhPHV/r08A9mbcvHPOYgLUelBQOp1DwJne694S3E/4nOiREjmkxTVWLDvAwKyy5msMCKxhppl1ESSGlyvU0s5Y+G8la+mXbt+j5pIHWcbnFfRgt8IGq0+UPZCtIN5ghqQpaUjC6RqnPDyaNrrFUnvQ==\"},{\"index\":5,\"timestamp\":1527975480782,\"previousHash\":\"902e67ddb613f6819cb20585e89cb005d95cf598a2e1596aa6df1411fc1995e1\",\"pubkey\":\"\\\"-----BEGIN CERTIFICATE-----\\\\nMIIFZDCCA0wCCQCWmE2GRj4v0jANBgkqhkiG9w0BAQsFADBzMQswCQYDVQQGEwJL\\\\nUjEVMBMGA1UECgwMbm93ZWVrLCBJbmMuMRowGAYDVQQLDBF3d3cuc2VjdXJla2lt\\\\nLmNvbTEeMBwGA1UECwwVKGMpIDIwMTggbm93ZWVrLCBJbmMuMREwDwYDVQQDDAhs\\\\naWdodC1DQTAgFw0xODA2MDIxNTE5MDRaGA8yMTE4MDUwOTE1MTkwNFowczELMAkG\\\\nA1UEBhMCS1IxFTATBgNVBAoMDG5vd2VlaywgSW5jLjEaMBgGA1UECwwRd3d3LnNl\\\\nY3VyZWtpbS5jb20xHjAcBgNVBAsMFShjKSAyMDE4IG5vd2VlaywgSW5jLjERMA8G\\\\nA1UEAwwIbGlnaHQtQ0EwggIiMA0GCSqGSIb3DQEBAQUAA4ICDwAwggIKAoICAQCy\\\\nMzAQJWj9hI5lgNOIdtntzLx326maF/Ty7BdUSpbGfIiuInfMQkKmOGBotMCoWSYv\\\\neXHW3fUWpjasvMpzzbEoA/6ZkYYsUOn0iIBKCqoH1PqNegM5pSlrnwLbNYNZhulC\\\\nX6CDaKVM0KdmXFoAcnuaLWZiFnBEPytcNV5X0Q2tBV5F6jzAOeeyFlSeo5DycVVc\\\\nD2z+cpJhRRQVVcDFg+6EkO9nO9uZ5iOlQYfEkp+9Mq2sNVvWpEoIeO/A/0cusHXY\\\\n4HHJ0UJEvJBtLtBf7eEzm8+z84ZPeKJkzjBPnzIMoAuKvhMRFJ4wbhOoo7TtOJUr\\\\n/XETC3HHKboQ/UnAyQt19ThDSwZrFdD6tLwM0o7UXSGvcB+T5VzHVxGpPb35IQ1o\\\\nJEeP5cYhEnJNibDUdEhpUAYdptG/7AUZISFfbHtLH09GpanEvvrLtJXf8K2eIzVT\\\\nvWdpQ9iqXn3WKmurpGbUFKY762wV/+VS0PROWBq0HjjZP0EEcvbP2rdv63utdvtO\\\\n7z1vPinUn7ShHfiVfioP/DX8/eiwmc/yh89dSZ4nRPfRISHtRU4o3Gq6aaTDYx8q\\\\nM3zT5uETncr8J1vZkCtZt4QQD7VNHh/GcBDip0bQJkdBDBJojxoUoszsErRzd1Mg\\\\nPeLkYGp4M7/CAmh4kqL1A/RxfKcQ724bgT/dpu9dzwIDAQABMA0GCSqGSIb3DQEB\\\\nCwUAA4ICAQBONnLayYNOF8EAIh/4bQ1962WMNk5tJEjAL4JPZQ/JnfwlaNqWw+yV\\\\ncfyeVPmciPm88VuQ5vEGsMyviLIUowHLG5sQzS57TBLR5gJoYrR1s7taK6LJLzGm\\\\n+bd11aq8rERsFXLA9RsO5248qoa0McP2KUmC26zMxjYGCAYpMZeLXkBIP8lRCOb7\\\\nCMEF91I7I/WwRTAFk1HOeSjHps+dNyLvEgeuCGJqnIFGoCbYt3jSZ5odZjmaiglz\\\\n720QZ4WtbDidofbxSL1LOg2gsuBWiMwbOuKY5ihemefFVdi4/fsKq+o1Izpye0Ko\\\\nblN9sCZWIQwIfk8rEgAbkv79LAKuGVTrLiskqaHB95YWRQYwK/ZLRKsju7UDj21H\\\\n8/dT3y0oOICVhY9T9so+UB3OLe8yHlHea5egVJn09AEKBURft4GfTytQORvYojqX\\\\n9Fojfg/Z2Yp3tMfvqtkh3/BFn+cV/+15ceSOX0LNpbwSy5yIYXkoahxdSbN6ocoZ\\\\nrKasWyrbFz4AUNrTa1YDW+jZf8tDu6v/BGYQ9NB4prnxl/QCF38cQVHtlzW2kPUv\\\\n+Q7dRgeJoQPHNWE1hor4L6hGPzm48qBLXPNOv6zNjrAYE/3owR1O0UX4L7kMK8mJ\\\\nr6MaW2uEBT4L8UhjLi22UXDzYTUwcMrmPrAjUjxH/tIXwiv0YD+MAA==\\\\n-----END CERTIFICATE-----\\\\n\\\"###light###\",\"hash\":\"136ec5d91d566760e1d2f8c2f3758bacf5eb348806c2b98616c86e330c48d8e2\",\"signature\":\"V2EG5IyQyRi9WhyKX3bvhzD6NDBJyddNaUNH4txbXIYDPc1IqZccSJUgyLKEccKqGM+4v5FU4iiwCqmmwIepJGTI82NHtQgAEBLxfxrRMu5J/AllE+HsLmDjNwibucWTRVPD47+0dYU/2/LgOKQKkUDuNCfMrJqgohKj4Du8eA7Ug14DQgzDFKx3beL3NvsKAjncnOFQz9+hu5loSQYa5DIIY1hQ7HpT2HjvLN/IRHGL2yUf4s/ebuMvY07UmceMRRJMfyNaHEfCwLXcoLUxC0IH2pwCJKMgU7rEEFQdkym7dWS4VwnwLH7SrXGLjrs4fXwLRYVbL+1bl6evBwcwLQ==\"},{\"index\":6,\"timestamp\":1527975887022,\"previousHash\":\"136ec5d91d566760e1d2f8c2f3758bacf5eb348806c2b98616c86e330c48d8e2\",\"pubkey\":\"\\\"-----BEGIN CERTIFICATE-----\\\\nMIIFZDCCA0wCCQCWmE2GRj4v0jANBgkqhkiG9w0BAQsFADBzMQswCQYDVQQGEwJL\\\\nUjEVMBMGA1UECgwMbm93ZWVrLCBJbmMuMRowGAYDVQQLDBF3d3cuc2VjdXJla2lt\\\\nLmNvbTEeMBwGA1UECwwVKGMpIDIwMTggbm93ZWVrLCBJbmMuMREwDwYDVQQDDAhs\\\\naWdodC1DQTAgFw0xODA2MDIxNTE5MDRaGA8yMTE4MDUwOTE1MTkwNFowczELMAkG\\\\nA1UEBhMCS1IxFTATBgNVBAoMDG5vd2VlaywgSW5jLjEaMBgGA1UECwwRd3d3LnNl\\\\nY3VyZWtpbS5jb20xHjAcBgNVBAsMFShjKSAyMDE4IG5vd2VlaywgSW5jLjERMA8G\\\\nA1UEAwwIbGlnaHQtQ0EwggIiMA0GCSqGSIb3DQEBAQUAA4ICDwAwggIKAoICAQCy\\\\nMzAQJWj9hI5lgNOIdtntzLx326maF/Ty7BdUSpbGfIiuInfMQkKmOGBotMCoWSYv\\\\neXHW3fUWpjasvMpzzbEoA/6ZkYYsUOn0iIBKCqoH1PqNegM5pSlrnwLbNYNZhulC\\\\nX6CDaKVM0KdmXFoAcnuaLWZiFnBEPytcNV5X0Q2tBV5F6jzAOeeyFlSeo5DycVVc\\\\nD2z+cpJhRRQVVcDFg+6EkO9nO9uZ5iOlQYfEkp+9Mq2sNVvWpEoIeO/A/0cusHXY\\\\n4HHJ0UJEvJBtLtBf7eEzm8+z84ZPeKJkzjBPnzIMoAuKvhMRFJ4wbhOoo7TtOJUr\\\\n/XETC3HHKboQ/UnAyQt19ThDSwZrFdD6tLwM0o7UXSGvcB+T5VzHVxGpPb35IQ1o\\\\nJEeP5cYhEnJNibDUdEhpUAYdptG/7AUZISFfbHtLH09GpanEvvrLtJXf8K2eIzVT\\\\nvWdpQ9iqXn3WKmurpGbUFKY762wV/+VS0PROWBq0HjjZP0EEcvbP2rdv63utdvtO\\\\n7z1vPinUn7ShHfiVfioP/DX8/eiwmc/yh89dSZ4nRPfRISHtRU4o3Gq6aaTDYx8q\\\\nM3zT5uETncr8J1vZkCtZt4QQD7VNHh/GcBDip0bQJkdBDBJojxoUoszsErRzd1Mg\\\\nPeLkYGp4M7/CAmh4kqL1A/RxfKcQ724bgT/dpu9dzwIDAQABMA0GCSqGSIb3DQEB\\\\nCwUAA4ICAQBONnLayYNOF8EAIh/4bQ1962WMNk5tJEjAL4JPZQ/JnfwlaNqWw+yV\\\\ncfyeVPmciPm88VuQ5vEGsMyviLIUowHLG5sQzS57TBLR5gJoYrR1s7taK6LJLzGm\\\\n+bd11aq8rERsFXLA9RsO5248qoa0McP2KUmC26zMxjYGCAYpMZeLXkBIP8lRCOb7\\\\nCMEF91I7I/WwRTAFk1HOeSjHps+dNyLvEgeuCGJqnIFGoCbYt3jSZ5odZjmaiglz\\\\n720QZ4WtbDidofbxSL1LOg2gsuBWiMwbOuKY5ihemefFVdi4/fsKq+o1Izpye0Ko\\\\nblN9sCZWIQwIfk8rEgAbkv79LAKuGVTrLiskqaHB95YWRQYwK/ZLRKsju7UDj21H\\\\n8/dT3y0oOICVhY9T9so+UB3OLe8yHlHea5egVJn09AEKBURft4GfTytQORvYojqX\\\\n9Fojfg/Z2Yp3tMfvqtkh3/BFn+cV/+15ceSOX0LNpbwSy5yIYXkoahxdSbN6ocoZ\\\\nrKasWyrbFz4AUNrTa1YDW+jZf8tDu6v/BGYQ9NB4prnxl/QCF38cQVHtlzW2kPUv\\\\n+Q7dRgeJoQPHNWE1hor4L6hGPzm48qBLXPNOv6zNjrAYE/3owR1O0UX4L7kMK8mJ\\\\nr6MaW2uEBT4L8UhjLi22UXDzYTUwcMrmPrAjUjxH/tIXwiv0YD+MAA==\\\\n-----END CERTIFICATE-----\\\\n\\\"###light###\",\"hash\":\"3868bcf68044d2a602b5b8bd4816f50d0da7f88731fdeea5023068de1ea1129b\",\"signature\":\"SIiFczitEtl8Uz+g9IZT45I4fq/2PQGC/vcAmVPWUieL/neOjLt/t0cQB9hIKDFA7SXk5OAA3Ua6xLs5lUkbTtrq19+6DMK3RhBiT7yCZ9wd2U3nFm8ouWP+VRpp/hpNec3LtFvcj2HJX5VdsIqmk2svyHJCbwJ6fHTeTJE1OYMcKpVpg9gjSmLitZURHdIt6aMLaAjprc36Gped/f95t4Htd+62Xztw2AgUEB23uGYIGsf6PF1eKZZk3Tgls5r7T6yTxXPkeNA4IyCu8Nr5rNnooyJIqw1j32vHvC1u2X7DU5RYluk/QZCUhxjVGaXW3bL/A2RelbKZj0shoo5YfA==\"}]"
  }

//   makeBundle(dummy_chain,(result)=>{
//       console.log(result);
//   });
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

module.exports = {getCA, DH_encrypt, DH_decrypt, getIPABC,startServer,restartServer,CERT_initCERT,makeBundle,DH_clean,clientPrime,DH_getMyPubKey,generatePin,DH_generate,sha256,loadPubkeys,getModHash,verifyKey};