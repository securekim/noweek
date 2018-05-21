var exec = require( "child_process" ).exec;

 createCert("washer",(result)=>{
     console.log(result);
 });

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
                            result.fail=0;
                            callback(result);
                        }
                    });     
                }
            });  
        }
    });
}
