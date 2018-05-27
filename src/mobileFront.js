
const express = require("express"),
bodyParser = require ("body-parser"),
morgan = require ("morgan");
client = require("./client");
const PORT = 3082; // if doesn't find in environment

const app = express();
app.use(bodyParser.json());
app.use(morgan("combined"));

app.get("/pincode/:ip", (req,res)=>{
    //generate pin code
    //Mobile is client.
    //please request with IP.
    console.log(req.params.ip);
    client.generate_PIN(req.params.ip,(secret)=>{
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


const server = app.listen(PORT, () => console.log(`secureCoin Server running on ${PORT}`));
