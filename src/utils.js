var exec = require( "child_process" ).exec;
var crypto = require('crypto');
var fs = require ('fs');
var pubkeys = loadPubkeys();

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

//   createCert("washer",(result)=>{
//       console.log(result);
//       createCert("attacker",(result)=>{
//         console.log(result);
//         createCert("fridge",(result)=>{
//             console.log(result);
//         });
//     });
//   });
  
function generatePin(data){
    
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


/*
function createCert(CN,callback){
    result = {fail:1,result:"none"};
    exec('openssl genrsa -out certs/'+CN+'.key 4096', function(error, stdout, stderr) {
        if(error !== null) {
            console.log("Create Cert Key : " + error);
            result.result=error;
            callback(result);
        } else {
            exec('openssl req -new -key certs/'+CN+'.key -nodes -subj "/C=KR/O=noweek, Inc./OU=www.securekim.com/OU=(c) 2018 noweek, Inc./CN='+CN+'" -out certs/'+CN+'.csr', function(error, stdout, stderr) {
                if(error !== null) {
                    console.log("Create Certificate : " + error);
                    result.result=error;
                    callback(result);
                } else {
                    exec('openssl x509 -req -days 3650 -in certs/'+CN+'.csr -signkey certs/'+CN+'.key -out certs/'+CN+'.pem', function(error, stdout, stderr) {
                        if(error !== null) {
                            console.log("Create Signed Certificate : " + error);
                            result.result = error;
                            callback(result);
                        } else {
                            //console.log('openssl x509 -noout -modulus -in certs/'+CN+'.pem | cut -f 2 -d = | openssl sha256 > certs/'+CN+'.m');
                            exec('openssl x509 -noout -modulus -in certs/'+CN+'.pem', function(error, stdout, stderr) {
                                if(error !== null) {
                                    console.log("Create Modulus in Certificate : " + error);
                                    result.result = error;
                                    callback(result);
                                } else {
                                    console.log(stdout.split('=')[1]);
                                    var mod = sha256(stdout.split('=')[1]);
                                    console.log("modulus : "+mod);
                                    fs.writeFile('certs/'+CN+'.m',mod,'utf8',function(error){
                                        if(error !== null){
                                            console.log("Calculate sha256 : " + error);
                                            result.result = error;
                                            callback(result);
                                        } else {
                                            result.result="CN :"+CN;
                                            result.fail=0;
                                            callback(result);
                                        }
                                    })
                                }
                            });
                        }
                    });     
                }
            });  
        }
    });
}
*/
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

function callbacktest(callback){
    return callback(1); //if no return, below code will be executed.
    console.log("dont"); 
}

if(process.argv.length >2){
    //node utils.js washer --> args[2]
    //make washerCA key, csr, selfsigned cert
    //make washer key, csr, signed by washerCA
    console.log(process.argv[2]);
    CERT_createCA(process.argv[2]+"-CA",(result)=>{
        if(result){
            CERT_createCERT(process.argv[2]+"-CA",process.argv[2],(result)=>{
                console.log("MAKE CERTIFICATE SIGNED BY CA :"+result);
            });
        }
    });

}


module.exports = {createCert,sha256,loadPubkeys,getModHash,verifyKey};