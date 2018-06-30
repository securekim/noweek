const cryptoJS = require("crypto-js"),
    crypto = require("crypto"),
    path = require("path"),
    fs = require("fs"),
    fsAccess = require('fs-access'),
    shell = require('shelljs');

const Request = require('./el_request');
const {
    request_initBlockchain,
    broadcast_addBlock,
    broadcast_getBlockchain,
} = Request;

const PUBKEY = `
-----BEGIN PUBLIC KEY-----
MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAwDWG0OJRcAtdxtW6GcUE
eJEW7I+DuJiU9zE71PirFauIK7K+e//is7kfK+abGj8tQDqvPNr75owx0ZtEgvug
0nh4OiNOaWAjw1yajayWrc1e5mzXjHAm3WEA7MDO5oaGYmNZ/PmDVNIqowKAt+xM
rfkV5Ydm+L3+KbBTl0/dIQDeWwrJCWVPwjjmJVOn4+4TzdBq3zxy2gyyTwdzlK+Y
ndFy9/pkqPxC6p5sJErJUpQPnTunEz3R9RCI0P90eNoOMBcj7izg+TBpgLR44t4B
FO84SETfO1zcjs62pRQFnFFmGYVwsxxoJ+dCey7P/CkWEfKi2okg98t+8F/7GWt2
yz3iBjWB0X4Idl7IXS3Tqt6wq7OpVWalHXuLpekPBmd4m3mmMnRldXI8t+/HuWy/
8XdxdxlS4HfjF2wxz/kR7nfEWqgcyn5H26dG703R8NyrMOPKFbnd1WCK9DYHoKis
PtviiU1pEfHy4ouQJh4odYRMaGv1cMffrFkzLugqKjAmqv9p76l/aw5OPOQSXC3p
kSY6LNTJ4apZ0PYbquc0i1fiKxL3aMA/fKI1ZbVvKsAXPcC8UjkxsnG/DXed1wCU
/wfGFznvZCNxCylyiBveXoUO/xw+vxuMW/jI5N9YC7nVAazVh3amx7aSzdw0A+d+
eEA89wPAAZbbJehEeN8KdusCAwEAAQ==
-----END PUBLIC KEY-----
`;

const __MAGIC_NUMBE__ = "###";

var __PRIVATE_KEY__ = "certs/mobile-CA.key";
const __BLOCKCHAIN_DIR__ = 'blocks';
const __BLOCKCHAIN_POSTFIX__ = '.blk';
var BLOCKCHAIN = [];

var encryptStringWithRsaPrivateKey = function(toEncrypt, relativeOrAbsolutePathToPrivateKey) {
    var absolutePath = path.resolve(relativeOrAbsolutePathToPrivateKey);
    console.log("[BRO] absolutePath : "+absolutePath);
    try{
    var privateKey = fs.readFileSync(absolutePath);
    }catch(e){
        console.log(e);
    }
    console.log("[BRO] private key : "+privateKey);
    console.log("[BRO] toEncrypt : "+toEncrypt);
    var buffer = new Buffer(toEncrypt);
    var encrypted = crypto.privateEncrypt(privateKey, buffer);
    return encrypted.toString("base64");
};

var decryptStringWithRsaPublicKey = function(toDecrypt, publicKey) {
    // publicKey = publicKey.split(__MAGIC_NUMBE__)[0];        // MAGIC Handler
    console.log("[BRO] PUBKEY IS !!! : "+publicKey);
    console.log("[BRO] CA IS !!! : "+JSON.parse(publicKey).CA);
    console.log("[BRO] CN IS !!! : "+JSON.parse(publicKey).CN);
    var buffer = new Buffer(toDecrypt, "base64");
    var decrypted = crypto.publicDecrypt(JSON.parse(publicKey).CA, buffer);
    return decrypted.toString("utf8");
};

var decryptStringWithRsaPublicKeyPath = function(toDecrypt, relativeOrAbsolutePathToPublicKey) {
    var absolutePath = path.resolve(relativeOrAbsolutePathToPublicKey);
    var publicKey = fs.readFileSync(absolutePath, "utf8");
    var buffer = new Buffer(toDecrypt, "base64");
    var decrypted = crypto.publicDecrypt(publicKey, buffer);
    return decrypted.toString("utf8");
};

class Block{
    constructor(index, timestamp, previousHash, pubkey, hash, signature){
        this.index = index;
        this.timestamp = timestamp;
        this.previousHash = previousHash;
        this.pubkey = pubkey;
        this.hash = hash;
        this.signature = signature;
    }
}

const createHash = (index, timestamp, previousHash, pubkey) =>
  cryptoJS.SHA256(
    index + timestamp + previousHash + pubkey
).toString();

const getBlocksHash = block =>
  createHash(
    block.index,
    block.timestamp,
    block.previousHash,
    block.pubkey
);

const getSignature = hash => encryptStringWithRsaPrivateKey(hash, __PRIVATE_KEY__);

const getCurrentTimestamp = () => new Date().getTime();

const getBlockchain = () => BLOCKCHAIN;

const getGenesisIndex = () => 0;
const getGenesisBlock = () => BLOCKCHAIN[getGenesisIndex()];
const getGenesisBlockHash = () => BLOCKCHAIN[getGenesisIndex()].hash;
const getGenesisBlockPubKey = () => BLOCKCHAIN[getGenesisIndex()].pubkey;

const getLatestIndex = () => (BLOCKCHAIN.length - 1);
const getLatestBlock = () => BLOCKCHAIN[getLatestIndex()];
const getLatestBlockIndex = () => BLOCKCHAIN[getLatestIndex()].index;
const getLatestBlockHash = () => BLOCKCHAIN[getLatestIndex()].hash;

const setBlock = (index, timestamp, previousHash, pubkey) => new Block(
    index,
    timestamp,
    previousHash,
    pubkey,
    createHash(index, timestamp, previousHash, pubkey),
    getSignature(createHash(index, timestamp, previousHash, pubkey), __PRIVATE_KEY__)
);

const isBlockValid = (candidateBlock, latestBlock) => {
    if (!isBlockStructureValid(candidateBlock)) {
        console.log("The candidate block structure is not valid");
        return false;
    } else if (latestBlock.index + 1 !== candidateBlock.index) {
        console.log("The candidate block doesnt have a valid index");
        return false;
    } else if (latestBlock.hash !== candidateBlock.previousHash) {
        console.log("The previousHash of the candidate block is not the hash of the latest block");
        return false;
    } else if (getBlocksHash(candidateBlock) !== candidateBlock.hash) {
        console.log("The hash of this block is invalid");
        return false;
    } else if (!isTimeStampValid(candidateBlock, latestBlock)) {
        console.log("The timestamp of this block is dodgy");
        return false;
    }
    return true;
};

const isTimeStampValid = (newBlock, oldBlock) => {
    return (
        oldBlock.timestamp - 60 < newBlock.timestamp &&
        newBlock.timestamp - 60 < getCurrentTimestamp()
    );
};

const isBlockStructureValid = (block) => {
    return (
        typeof block.index === "number" &&
        typeof block.timestamp === "number" &&
        typeof block.previousHash === "string" &&
        typeof block.pubkey === "string"&&
        typeof block.hash === "string" &&
        typeof block.signature === "string"
    );
};

const createBlock = (pubkey) => setBlock(getLatestBlockIndex() + 1, getCurrentTimestamp(), getLatestBlockHash(), pubkey);
const createGenesisBlock = (pubkey) => setBlock(0, getCurrentTimestamp(), "", pubkey);

// check block directory
fsAccess(__BLOCKCHAIN_DIR__, function (err) {
    // if not exist file
    if (err) {
        console.error(__BLOCKCHAIN_DIR__ + "not exist");
        fs.mkdir(__BLOCKCHAIN_DIR__, 0775, function(err){
                if(err){
                        console.log("Create " + __BLOCKCHAIN_DIR__ + " directory fail");
                        return false;
                }
                console.log("Create " + __BLOCKCHAIN_DIR__ + " directory success");
        });
        return;
    }
});

function get_last_block_number() {
    var files = fs.readdirSync(__BLOCKCHAIN_DIR__);
    var blockList = [];
    if (files.length == 0)
        return 0;
    for (var i in files)
        blockList.push(Number(files[i].split(__BLOCKCHAIN_POSTFIX__)[0]))
    blockList.sort(function(a,b) {
        return a - b;
    })
    return blockList[blockList.length-1];
}

function get_file_list() {
    var files = fs.readdirSync(__BLOCKCHAIN_DIR__);
    var blockList = [];
    if (files.length == 0)
        return 0;
    for (var i in files)
        blockList.push(Number(files[i].split(__BLOCKCHAIN_POSTFIX__)[0]))
    blockList.sort(function(a,b) {
        return a - b;
    })
    return blockList;
}

function block_file2mem(block_idx){
    file_name = __BLOCKCHAIN_DIR__ + '/' + block_idx + __BLOCKCHAIN_POSTFIX__;
    buffer = fs.readFileSync(file_name);

    block = JSON.parse(buffer);
    return Object.assign(new Block, block);
}

function block_mem2file(block_idx, block){
    file_name = __BLOCKCHAIN_DIR__ + '/' + block_idx + __BLOCKCHAIN_POSTFIX__;
    block_json = JSON.stringify(block, null, 4);

    fs.writeFileSync(file_name, block_json);
    return true;
}

const blockchain_clear = () => {
    BLOCKCHAIN = [];
    file_name = __BLOCKCHAIN_DIR__ + '/*';
    shell.rm('-rf', file_name);
}

const isChainValid = (candidateChain) => {
    // check longest
    if (BLOCKCHAIN.length >= candidateChain.length){
        console.log("ORG Blockchain length: " + BLOCKCHAIN.length);
        console.log("NEW Blockchain length: " + candidateChain.length);
        return false;
    }

    // check is valid
    genesis_hash = getGenesisBlockHash();
    genesis_pubkey = getGenesisBlockPubKey();
    for (var i = 0; i < candidateChain.length; i++){
        if (candidateChain[i].hash !== decryptStringWithRsaPublicKey(candidateChain[i].signature, genesis_pubkey)){
            console.log("decrypt: "+ decryptStringWithRsaPublicKey(candidateChain[i].signature, genesis_pubkey));
            console.log("hash: " + candidateChain[i].hash);
            return false;
        }
    }

    // valid candidate chain
    for (let i = 1; i < candidateChain.length; i++) {
        const currentBlock = candidateChain[i];
        if (!isBlockValid(currentBlock, candidateChain[i - 1]))
            return false;
    }

    return true;
};

const blockchain_replace = (blockchain) => {
    blockchain = JSON.parse(blockchain);

    if(!isChainValid(blockchain))
        return false;

    blockchain_clear();

    BLOCKCHAIN = blockchain;
    for(var i = 0; i < BLOCKCHAIN.length; i++)
        block_mem2file(i, BLOCKCHAIN[i]);

    return true;
};

const blockchain_init = (pubkey) => {
    blockchain_clear();

    newBlock = createGenesisBlock(pubkey);
    BLOCKCHAIN = [newBlock];
    block_mem2file(0, newBlock);

    //request: broadcast_getBlockchain
    broadcast_getBlockchain();
};

const blockchain_add = (newBlock) => {
    if(BLOCKCHAIN.length === 0)
        return false;

    if(!isBlockValid(newBlock, getLatestBlock())){
        //request: broadcast_getBlockchain
        broadcast_getBlockchain();
        return false;
    }

    BLOCKCHAIN.push(newBlock);
    block_mem2file(newBlock.index, newBlock);

    return true;
};

const blockchain_get = () => {
    blockchain = getBlockchain();
    return blockchain;
};

const blockchain_make = (pubkey) => {
    newBlock = createBlock(pubkey);
    return JSON.stringify(newBlock);
};

/*
    . 내 로컬에 있는 블록 정보 로딩, 동기화
    . broadcast
*/
const blockchain_run = () => {
    fileList = get_file_list();
    for(var idx in fileList){
        newBlock = block_file2mem(idx);
        BLOCKCHAIN.push(newBlock);
    }

    //request: broadcast_getBlockchain
    if(getLatestIndex >= 0)
        broadcast_getBlockchain();
}

module.exports = {
    blockchain_init,
    blockchain_make,
    blockchain_add,
    blockchain_get,
    blockchain_replace,
    blockchain_clear,
    blockchain_run
};
