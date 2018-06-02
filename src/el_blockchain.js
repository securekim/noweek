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

var __PRIVATE_KEY__ = "certs/mobile.key";
const __BLOCKCHAIN_DIR__ = 'blocks';
const __BLOCKCHAIN_POSTFIX__ = '.blk';
var BLOCKCHAIN = [];

var encryptStringWithRsaPrivateKey = function(toEncrypt, relativeOrAbsolutePathToPrivateKey) {
    var absolutePath = path.resolve(relativeOrAbsolutePathToPrivateKey);
    var privateKey = fs.readFileSync(absolutePath, "utf8");
    var buffer = new Buffer(toEncrypt);
    var encrypted = crypto.privateEncrypt(privateKey, buffer);
    return encrypted.toString("base64");
};

var decryptStringWithRsaPublicKey = function(toDecrypt, publicKey) {
    var buffer = new Buffer(toDecrypt, "base64");
    var decrypted = crypto.publicDecrypt(publicKey, buffer);
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

const getCurrentTimestamp = () => new Date().getTime().toString();

const getBlockchain = () => BLOCKCHAIN;

const getGenesisIndex = () => 0;
const getGenesisBlockHash = () => BLOCKCHAIN[getGenesisIndex()].hash;
const getGenesisBlockPubKey = () => BLOCKCHAIN[getGenesisIndex()].pubkey;

const getLatestIndex = () => (BLOCKCHAIN.length - 1);
const getLastBlockIndex = () => {
    return BLOCKCHAIN[getLatestIndex()].index;
}
const getLastBlockHash = () => BLOCKCHAIN[getLatestIndex()].hash;

const setBlock = (index, timestamp, previousHash, pubkey) => new Block(
    index,
    timestamp,
    previousHash,
    pubkey,
    createHash(index, timestamp, previousHash, pubkey),
    getSignature(createHash(index, timestamp, previousHash, pubkey), __PRIVATE_KEY__)
);

const createBlock = (pubkey) => setBlock(getLastBlockIndex() + 1, getCurrentTimestamp(), getLastBlockHash(), pubkey);
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

const blockchain_isValidkey = (publicKey) => {
    for (var i = 0; i < BLOCKCHAIN.length; i++)
        if(BLOCKCHAIN[i].pubkey === publicKey)
            return true;
    return false;
};

const blockchain_clear = () => {
    BLOCKCHAIN = [];
    file_name = __BLOCKCHAIN_DIR__ + '/*';
    shell.rm('-rf', file_name);
};

const blockchain_replaceCheck = (blockchain) => {
    // check longest
    if (BLOCKCHAIN.length >= blockchain.length){
        console.log("ORG Blockchain length: " + BLOCKCHAIN.length);
        console.log("NEW Blockchain length: " + blockchain.length);
        return false;
    }

    // check is valid
    genesis_hash = getGenesisBlockHash();
    genesis_pubkey = getGenesisBlockPubKey();
    for (var i = 0; i < blockchain.length; i++){
        if (blockchain[i].hash !== decryptStringWithRsaPublicKey(blockchain[i].signature, genesis_pubkey)){
            console.log("decrypt: "+ decryptStringWithRsaPublicKey(blockchain[i].signature, genesis_pubkey));
            console.log("hash: " + blockchain[i].hash);
            return false;
        }
    }

    return true;
};

const blockchain_replace = (blockchain) => {
    blockchain = JSON.parse(blockchain);

    if(!blockchain_replaceCheck(blockchain))
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

const blockchain_add = (block) => {
    if(BLOCKCHAIN.length === 0)
        return false;

    newBlock = block;
    BLOCKCHAIN.push(newBlock);
    block_mem2file(newBlock.index, newBlock);

    //request: broadcast_getBlockchain
    broadcast_getBlockchain();
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
    blockchain_run,
    blockchain_clear
};


/***
 * . Blockchain get 할 때, 어떤 방식으로 공유할지
 * . 적혀있는 블록+index 읽어서 메모리에 로드
 * . broadcast
 * . AWS 연동테스트
 */
