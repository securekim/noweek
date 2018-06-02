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
console.log("server CN : "+CN);
//var pubkeys=utils.loadPubkeys();

console.log("Open for mutual SSL : "+PORT_MUTUAL);
var mutualServer = mutualServerCreate();

function setLastSecret(data){
    lastSecret = data;
}

function mutualServerCreate(){

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
        console.log(data);
        try{
        if(data.command === "serverOff"){
            mutualServer.close(()=>{
                console.log("Server Closed in 10 sec");
            });
            mutualServer=null
            setTimeout(()=>{
                mutualServer=mutualServerCreate();
                console.log("10 seconds already done !");
            },10*1000);
            res.end(data.command);
        }else if (data.command.split(',')[0]=="artik_led_control"){
            el_request.artik_led_control(data.command.split(',')[1],data.command.split(',')[2],(result)=>{
                res.end(JSON.stringify(result));
            })
        }
        }catch(e){
            console.log(e);
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
    ca: fs.readFileSync('certs/'+CN+'-CA.pem','utf8'),
      
}; 


console.log("Open for DH Key exchange :"+PORT_DH);
var server = https.createServer(options_dh, function (req, res) { 
    //this is for DH.
    //We dont need a client certificate. 
    //console.log("Hello, DH");
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
                decryptedCA = utils.DH_decrypt(lastSecret, body);

                el_request.artik_button_read((json)=>{
                    //{result:true, data: body}); //pushed 0
                    console.log("Check button read");
                    console.log(json);
                    if(json.result && json.data == 0 ){
                        console.log("CLICKED or There is no Button !!!");
                        el_request.request_initBlockchain(decryptedCA+"###mobile###",(data)=>{
                            //{result:true, data: null}
                            const myCA = utils.getCA(CN);
                            encryptedCA = utils.DH_encrypt(lastSecret,myCA);
                            
                            res.end(JSON.stringify({result:true,data:encryptedCA,CN:CN}));
                        });
                    } else {
                        console.log("NOT CLICKED !!!");
                        res.end(JSON.stringify({result:false,data:"Please Click The Button !"}));
                    }
                });
            }catch(e){
                console.log("Error in Server. In confirmPin")
                console.log(e);
                res.end(JSON.stringify({result:false,data:e}));
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
            console.log("#################################");
            console.log("####### DiffieHellman PIN #######");
            console.log("###[SERVER] Pin code : "+pin+"###");
            console.log("#################################");
            utils.DH_clean();
            res.end(JSON.stringify({pubkey:server_pubkey,CA:options_dh.ca,CN:CN}));
        }catch(e){
            console.log("Server : someone search me.")
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