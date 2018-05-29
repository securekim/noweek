
const express = require("express"),
bodyParser = require ("body-parser"),
morgan = require ("morgan");
client = require("./client");
const PORT = 3082; // if doesn't find in environment

const app = express();
app.use(bodyParser.json());
app.use(morgan("combined"));

app.get("/broadcast", (req,res)=>{
    //to do : request just for on targets.
    //        attacker or not, we don't care.

});

app.get("/addBlockChain",(req,res)=>{
    //to do : we will add the CA certificate to chain.
    //           AFTER NUMERIC COMPARISON ONLY
});

app.get("/initChain", (req,res)=>{
    //to do : remove All chains.
    //        create genesis - mobile.
});

app.get("/pincode/:ip", (req,res)=>{
    //generate pin code
    //Mobile is client.
    //please request with Target IP.
    console.log("IP IS : "+req.params.ip);
    client.generatePin(req.params.ip,(secret)=>{
        res.send(secret);
    });
})

app.post("/blocks", (req,res)=>{
    const {body: {data}} = req;
    const newBlock = createNewBlock(data);
    res.send(newBlock);
});

app.post("/peers", (req,res)=> {
    const { body : { peer }} = req;
    connectToPeers(peer);
    res.send();
});


process.on("uncaughtException",(e)=>{
    console.log(e);
})

const server = app.listen(PORT, () => console.log(`noweek Server running on ${PORT}`));
