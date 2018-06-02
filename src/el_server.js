const express = require("express"),
    bodyParser = require("body-parser"),
    cors = require("cors"),
    morgan = require("morgan");

const Blockchain = require('./el_blockchain');
const {
    blockchain_init,
    blockchain_make,
    blockchain_add,
    blockchain_get,
    blockchain_replace,
    blockchain_clear,
    blockchain_run
} = Blockchain;

const Artik = require('./el_artik');
const {
    artik_all_init,
    led_control,
    button_read
} = Artik;

const PORT = process.env.HTTP_PORT || 3000;

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(morgan("combined"));

// template
app.route("/blocks")
.get((req, res) => {})
.post((req, rest) => {});


app.post("/initBlockchain", (req, res) => {
    res_body = "initBlockchain complete...";
    publicKey = req.body.publicKey;

    blockchain_init(publicKey);

    res.send(res_body);
});

app.post("/makeBlock", (req,res) => {
    res_body = "makeBlock complete...";
    publicKey = req.body.publicKey;

    newBlock = blockchain_make(publicKey);

    res.send(newBlock);
});

app.post("/addBlock", (req, res) => {
    block = req.body.block;

    if(blockchain_add(block))
        res_body = "addBlock complete...";
    else
        res_body = "failed addBlock...";

    res.send(res_body);
});

app.post("/getBlockchain", (req, res) => {
    res_body = "getBlockchain complete...";
    blockchain = blockchain_get();

    res.send(blockchain);
});

app.post("/replaceBlockchain", (req, res) => {
    res_body = "blockchain_replace complete...";
    blockchain = req.body.blockchain;

    result = blockchain_replace(blockchain);

    res.send(result);
});

app.post("/clearBlockchain", (req, res) => {
    res_body = "clearBlockchain complete...";

    blockchain_clear();

    res.send(res_body);
});

app.post("/artik_led_control", (req, res) => {
    res_body = "artik_led_control complete...";

    color = req.body.color;
    isOn = req.body.isOn;
    led_control(color, isOn);

    res.send(res_body);
});

app.post("/artik_button_read", (req, res) => {
    res_body = "artik_button_read complete...";
    console.log("artik_button_read !!!!");
    BUTTON_SW403 = '30';
    button_read(BUTTON_SW403,(result)=>{
        res.send(result);
    });
});

const server = app.listen(PORT, () =>
  console.log(`IOTC HTTP Server running on port ${PORT} ✅`)
);

artik_all_init();
blockchain_run();
