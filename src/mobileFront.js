
const express = require("express"),
bodyParser = require ("body-parser"),
morgan = require ("morgan");
client = require("./client");
var exec = require( "child_process" ).exec;
const PORT = 3082; // if doesn't find in environment

const app = express();
app.use(bodyParser.json());
app.use(morgan("combined"));

app.get("/broadcast", (req,res)=>{
    //to do : request just for on targets.
    //        attacker or not, we don't care.
    try{
    client.broadcast((result)=>{
        console.log("broadcast END !");
        //console.log(result);
        res.send(result);
    });
    }catch(e){
        console.log(e);
    }
});


app.get("/reset", (req,res)=>{
    //to do : request just for on targets.
    //        attacker or not, we don't care.
    try{
        child = exec("./reset.sh", function(error, stdout, stderr) {
            if(error !== null){
                console.log("[ERROR] " + error);
            }
        });
    }catch(e){
        console.log(e);
    }
});


app.get("/start", (req,res)=>{
    //to do : request just for on targets.
    //        attacker or not, we don't care.
    try{
    client.broadcast((result)=>{
        console.log("broadcast END !");
        //console.log(result);
        res.send(result);
    });
    }catch(e){
        console.log(e);
    }
});

try{

app.post("/replaceBlockchain", (req,res)=>{
    //to do : request just for on targets.
    //        attacker or not, we don't care.
    try{
        console.log("");
        console.log("");
        console.log("");
        console.log("");
        console.log("************************************************************");
        console.log("*(_)                               ( )_               ( )_ *");
        console.log("*| |  ___ ___   _ _      _    _ __ | ,_)   _ _   ___  | ,_)*");
        console.log("*| |/' _ ` _ `\\( '_`\\  /'_`\\ ( '__)| |   /'_` )/' _ `\\| |  *");
        console.log("*| || ( ) ( ) || (_) )( (_) )| |   | |_ ( (_| || ( ) || |_ *");
        console.log("*(_)(_) (_) (_)| ,__/'`\\___/'(_)   `\\__)`\\__,_)(_) (_)`\\__)*");
        console.log("*              | |                                         *");
        console.log("*              (_)                                         *");
        console.log("************************************************************");
        console.log("*        Error ! key is different. Verify Fail !           *");
        console.log("************************************************************");
        console.log("");
        console.log("");
        console.log("");    
        console.log("");
    }catch(e){
        console.log(e);
    }
    res.end("You do not have a permission. please setup again.")
});

}catch(e){
    console.log(e);
}
app.get("/nfcCheck", (req,res)=>{
    //to do : request just for on targets.
    //        attacker or not, we don't care.

    var result = client.nfcCheck();
    res.send(String(result));
});


app.get("/nfcTag", (req,res)=>{
    //to do : request just for on targets.
    //        attacker or not, we don't care.

    result = client.nfcTag();
    res.send(String(result));
});

app.get("/nfcClear", (req,res)=>{
    //to do : request just for on targets.
    //        attacker or not, we don't care.
    result = client.nfcClear();
    res.send(String(result));
});

app.get("/addBlockChain",(req,res)=>{
    //to do : we will add the CA certificate to chain.
    //           AFTER NUMERIC COMPARISON ONLY
    
});

app.get("/clearBlockChain",(req,res)=>{
    //to do : get blockchain list.
    client.clearBlockChain((json)=>{
        res.send(json);
    });
});

app.get("/getBlockChain",(req,res)=>{
    //to do : get blockchain list.
    client.getBlockChain((json)=>{
        res.send(json);
    });
});

app.post("/initChain", (req,res)=>{
    //to do : remove All chains.
    //        create genesis - mobile.
    //        create CA and ,,
    const {body: {CN}} = req;
    console.log("Generate CN : "+CN);
    client.initChain(CN,(result)=>{
        res.send(result);
    });
});

app.get("/pincode/:ip", (req,res)=>{
    //generate pin code
    //Mobile is client.
    //please request with Target IP.
    console.log("IP IS : "+req.params.ip);
    client.generatePin(req.params.ip,(dh)=>{
        console.log(dh);
        res.send(dh);
        //dh => {pin, secret, ip}
    });
})

app.post("/confirmPin",(req,res)=>{
    const {body} = req;
    console.log("Confirm pincode with :"+body.ip);
    //dh => {pin, secret, ip, CN}
    client.confirmPin(body,(result)=>{
        res.send(result);
    });
});

app.post("/control", (req,res)=>{
    //control to other device
    const {body: {data}} = req;
    const {body: {ip}} = req;
    console.log(ip+" -> "+data);
    client.sendWithMutual(ip,data,(chunk)=>{
        console.log("chunk:"+chunk)
        res.send(chunk);
    })
})

/*
******************************************
*/

app.get('/', function(req, res) {
    res.sendFile('viewer/main.html', {root: __dirname })
});

app.get('/*', function(req, res) {
    res.sendFile(__dirname + '/viewer' + req.url, function(err){
        console.log(err);
        if(err) res.send(403, 'Error : '+__dirname + '/viewer' + req.url);
    });
});

/*
******************************************
*/


process.on("uncaughtException",(e)=>{
    //console.log("uncaughtException");
    console.log(e);
})

const server = app.listen(PORT, () => console.log(`noweek Server running on ${PORT}`));
