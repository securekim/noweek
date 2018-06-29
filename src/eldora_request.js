const request = require('request'),
    fs = require('fs');

const __LOCAL_ADDRESS_BASE__ = '192.168.0.';

const publicKeyPath = "/home/rudder/noweek/pubkey.pem";
const readFile = (pubkeyPath) => fs.readFileSync(pubkeyPath).toString();
const PEM = readFile(publicKeyPath);

/**
 * @name broadcast_addBlock
 * @param publicKey
 */
function broadcast_addBlock(publicKey){
    var options = {
        url: 'http://localhost:3000/makeBlock',
        method: 'POST',
        json: {'publicKey': publicKey}
    };

    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            BASE_URL = 'http://[IP_ADDRESS]:3000/addBlock';
            options = {
                method: 'POST',
                json: {'block': body}
            };

            for (var i = 1; i < 255; i++){
                ip_addr = __LOCAL_ADDRESS_BASE__ + i;

                options.url = BASE_URL.replace('[IP_ADDRESS]', ip_addr);
                request(options, function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        console.log(body);
                    }
                });
            }
        }
    });
}

function broadcast_getBlockchain(){
    var options = {
        url: 'http://[IP_ADDRESS]:3000/getBlockchain',
        method: 'POST'
    };
    BASE_URL = options.url;

    for (var i = 1; i < 255; i++){
        ip_addr = __LOCAL_ADDRESS_BASE__ + i;

        options.url = BASE_URL.replace('[IP_ADDRESS]', ip_addr);
        request(options, function (error, response, blockchain) {
            if (!error && response.statusCode == 200) {
                // get blockchain
                var options = {
                    url: 'http://localhost:3000/replaceBlockchain',
                    method: 'POST',
                    json: {'blockchain': blockchain}
                };

                request(options, function (error, response, result) {
                    if (!error && response.statusCode == 200) {
                        // Print out the response body
                        if(result){
                            console.log("replace blockchain...");
                            console.log(JSON.parse(blockchain));
                        }
                        else{
                            console.log("failed replace blockchain...");
                            console.log(JSON.parse(blockchain));
                        }
                    }
                });
            }
        });
    }
}

/*
name: request_initBlockchain
arg1: publicKey
arg2: callback({result:true, data: null})
*/
function request_initBlockchain(publicKey, callback){
    var options = {
        url: 'http://localhost:3000/initBlockchain',
        method: 'POST',
        json: {'publicKey': publicKey}
    };

    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200)
            callback({result:true, data: null});
        else
            callback({result:false, data: null});
    });
}

/* NOT USE
name: request_addBlock
arg1: publicKey
arg2: callback({result:true, data: null})
*/
function request_addBlock(publicKey, callback){
    var options = {
        url: 'http://localhost:3000/addBlock',
        method: 'POST',
        json: {'block': createBlock(publicKey)}
    };

    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200)
            callback({result:true, data: null});
        else
            callback({result:false, data: null});
    });
}

/*
name: request_getBlockchain
arg1: callback({result:true, data: blockchain})
*/
function request_getBlockchain(callback){
    var options = {
        url: 'http://localhost:3000/getBlockchain',
        method: 'POST'
    };

    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200)
            callback({result:true, data: body});
        else
            callback({result:false, data: null});
    });
}

function callback_func(result){
    console.log(result);
}

request_initBlockchain(PEM, callback_func);
// broadcast_addBlock(PEM);

module.exports = {
    request_initBlockchain,
    broadcast_addBlock,
    broadcast_getBlockchain,
};