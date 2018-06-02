/*
1. [root@localhost~]# connmanctl 
2. connmanctl> enable wifi 
3. connmanctl> scan wifi 
4. connmanctl> services
5. connmanctl> agent on
6. connmanctl> connect <ssid service>
7. Passphrase? (비밀번호 입력 후 enter, 연결결과 출력)
8. connmanctl> quit (종료)
9. [root@localhost~]# ifconfig (연결상태 및 ip 확인가능)
*/  

var fs = require('fs'); 
var http = require('http');
var https = require('https'); 
const utils = require('./utils');
const querystring = require('querystring');  
const el_request = require('./el_request');

const PORT_MUTUAL = 4433
const PORT_DH = 4444;
var lastSecret = "";

try{
    var CN = fs.readFileSync("myProfile.txt",'utf8');
}catch(e){
    console.log(e);
    var CN = "fridge";
}
if(typeof CN ==="string") CN = CN.replace(/(\r\n\t|\n|\r\t)/gm,"");
    
//var pubkeys=utils.loadPubkeys();

console.log("Open for mutual SSL : "+PORT_MUTUAL);
var mutualServer = mutalServerCreate();

function setLastSecret(data){
    lastSecret = data;
}

function mutalServerCreate(){

    var options_mutual = { 
        key: fs.readFileSync('certs/'+CN+'.key'), 
        cert: fs.readFileSync('certs/'+CN+'.pem'), 
        ca: fs.readFileSync('certs/bundle.pem'), 
        requestCert: true, 
        rejectUnauthorized: true
    }; 
    
return https.createServer(options_mutual, function (req, res) { 

    var body = '';
    req.on('data', function (data) {
        body += data;
    });

    console.log(new Date()+' [SERVER] Client Is :'+ 
    //req.connection.remoteAddress+' '+ 
    req.socket.getPeerCertificate().subject.CN+' ' 
    +req.method+' '+req.url
    );

    req.on('end', function () {
        //const {body: {data}} = req;
        data = querystring.parse(body);
        console.log("THE DATA");
        console.log(body);
        res.end(data.command);
        if(data.command === "serverOff"){
            mutualServer.close(()=>{
                console.log("Server Closed in 10 sec");
            });
            mutualServer=null
            setTimeout(()=>{
                mutualServer=mutalServerCreate();
                console.log("10 seconds already done !");
            },10*1000);
        }
    });
    //if(req.url.split('/')[0])
    //We will verify client's modulus
    //console.log(utils.getModHash(req));
    //console.log("VERIFY RESULT : "+utils.verifyKey(utils.getModHash(req)));
    res.writeHead(200); 
     
}).listen(PORT_MUTUAL);

}

/////////////////////////////////////////////////////

var options_dh = { 
    key: fs.readFileSync('certs/'+CN+'.key'), 
    cert: fs.readFileSync('certs/'+CN+'.pem'), 
    ca: fs.readFileSync('certs/'+CN+'-CA.pem','utf8')  
}; 


console.log("Open for DH Key exchange :"+PORT_DH);
var server = https.createServer(options_dh, function (req, res) { 
    //this is for DH.
    //We dont need a client certificate. 
    console.log("Hello, DH");
    var body = '';
    req.on('data', function (data) {
        body += data;
    });

    req.on('end', function () {
        console.log(new Date()+' '+ 
        +req.method+' '+req.url
        );
            if(req.url==="/confirmPin"){
                try{
                console.log("/confirmPin in Server");
                console.log(body);
                const decipher = crypto.createDecipher('aes-256-cbc', 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
                let decryptedCA = decipher.update(JSON.stringify(body), 'base64', 'utf8'); // 암호화할문 (base64, utf8이 위의 cipher과 반대 순서입니다.)
                decryptedCA += decipher.final('utf8'); // 암호화할문장 (여기도 base64대신 utf8)
                console.log(decryptedCA);

                el_request.artik_button_read((json)=>{
                    //{result:true, data: body}); //pushed 0
                    if(json.result && json.data == 0 ){

                        el_request.request_initBlockchain(decryptedCA,(data)=>{
                            //{result:true, data: null}
                            const myCA = utils.getCA(CN);
                            const cipher = crypto.createCipher('aes-256-cbc', 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
                            let encryptedCA = cipher.update(myCA, 'utf8', 'base64'); // 'HbMtmFdroLU0arLpMflQ'
                            encryptedCA += cipher.final('base64'); // 'HbMtmFdroLU0arLpMflQYtt8xEf4lrPn5tX5k+a8Nzw='

                            res.end({result:true,data:encryptedCA});
                        });
                    } else {
                        res.end({result:false,data:"Please Click The Button !"});
                    }
                });
            }catch(e){
                console.log("Error in Server. In confirmPin")
                res.end({result:false,data:e});
            }
        }else{
        try{
            //console.log(querystring.parse(body));
            if(body === '' || body ===null) throw new Error("No body No body but you");
            dh = querystring.parse(body);
            const prime = dh.prime;
            const pubkey = dh.pubkey;
            const secret = utils.DH_generate(prime, pubkey); 
            setLastSecret(secret);
            const server_pubkey = utils.DH_getMyPubKey(prime);
            //console.log("[SERVER] prime: " + prime);
            //console.log("[SERVER] client pubkey: " + pubkey);
            //console.log("[SERVER] server pubkey:" + server_pubkey);
            //console.log("[SERVER] Server Secret : "+secret);
            const pin = utils.generatePin(secret);
            console.log("[SERVER] Pin code : "+pin);
            utils.DH_clean();
            res.end(JSON.stringify({pubkey:server_pubkey,CA:options_dh.ca}));
        }catch(e){
            res.end();
        }
    }
    }); 
    res.writeHead(200); 
}).listen(PORT_DH);

process.on("uncaughtException",(err)=>{
    console.log("Uncaught Exception !! ");
    console.log(err);
})