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
const PORT_MUTUAL = 4433
const PORT_DH = 4444;

var CN = "fridge"
//var pubkeys=utils.loadPubkeys();

var options_mutual = { 
    key: fs.readFileSync('certs/'+CN+'.key'), 
    cert: fs.readFileSync('certs/'+CN+'.pem'), 
    ca: fs.readFileSync('certs/'+CN+'-CA.pem'), 
    requestCert: true, 
    rejectUnauthorized: false 
}; 

console.log("Open for mutual SSL : "+PORT_MUTUAL);
https.createServer(options_mutual, function (req, res) { 
    console.log(new Date()+' [SERVER] Client Is :'+ 
        //req.connection.remoteAddress+' '+ 
        req.socket.getPeerCertificate().subject.CN+' ' 
        +req.method+' '+req.url
    ); 
    //if(req.url.split('/')[0])
    //We will verify client's modulus
    //console.log(utils.getModHash(req));
    //console.log("VERIFY RESULT : "+utils.verifyKey(utils.getModHash(req)));
    res.writeHead(200); 
    res.end("Mutual SSL, OK. \n"); 
}).listen(PORT_MUTUAL);


/////////////////////////////////////////////////////

var options_dh = { 
    key: fs.readFileSync('certs/'+CN+'.key'), 
    cert: fs.readFileSync('certs/'+CN+'.pem'), 
    ca: fs.readFileSync('certs/'+CN+'-CA.pem')  
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
        try{
            //console.log(querystring.parse(body));
            
            dh = querystring.parse(body);
            const prime = dh.prime;
            const pubkey = dh.pubkey;
            const secret = utils.DH_generate(prime, pubkey); 
            const server_pubkey = utils.DH_getMyPubKey(prime);
            console.log("[SERVER] prime: " + prime);
            console.log("[SERVER] client pubkey: " + pubkey);
            console.log("[SERVER] server pubkey:" + server_pubkey);
            console.log("[SERVER] Server Secret : "+secret);
            utils.DH_clean();
            res.end(server_pubkey);
        }catch(e){
            console.log(e);
        }
    }); 
    res.writeHead(200); 
}).listen(PORT_DH);