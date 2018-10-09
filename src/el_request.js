const request = require('request'),
    fs = require('fs');
const os = require('os');

function getIPABC(){
    try{
        var ip = os.networkInterfaces().wlan0[0].address.split('.');
        return ip[0]+"."+ip[1]+"."+ip[2]+".";
    }catch(e){
        console.log("Can't get network. default : 192.168.43");
        return "192.168.43.";
    }
}

var __LOCAL_ADDRESS_BASE__ = getIPABC();

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
    console.log("previous!!!!!!!!!!!!!!!!!!!");
    request(options, function (error, response, block) {
        if (!error && response.statusCode == 200) {
            BASE_URL = 'http://[IP_ADDRESS]:3000/addBlock';
            options = {
                method: 'POST',
                json: {'block': block}
            };
            console.log("GOGO !!!!!!!!!!!!!!!!!!!");

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
23                                                                                                                                      
    for (var i = 1; i < 255; i++){
        //if(i!=225 && i != 54 && i != 118) return;
        ip_addr = __LOCAL_ADDRESS_BASE__ + i
        //console.log("broadcast_getBlockchain : "+ip_addr);
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
                            console.log("[el_reqeust] replace blockchain !");
                            //console.log(JSON.parse(blockchain));
                        }
                        else{
                            console.log("[el_reqeust] failed replace blockchain...");
                            //console.log(JSON.parse(blockchain));
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
        url: 'http://localhost:3000/makeBlock',
        method: 'POST',
        json: {'publicKey': publicKey}
    };

    request(options, function (error, response, block) {
        options = {
            url: 'http://localhost:3000/addBlock',
            method: 'POST',
            json: {'block': block}
        };

        request(options, function (error, response, body) {
            if (!error && response.statusCode == 200)
                callback({result:true, data: null});
            else
                callback({result:false, data: null});
        });
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
        //url: 'http://localhost:3082/getBlockChain',
        //method: 'GET'
    };

    request(options, function (error, response, body) {
        try{
            console.log("[BRO][el_request][getBlockChain] chain length: "+JSON.parse(body).length);
        } catch(e) {
            //console.log("[BRO][el_request][getBlockChain] Can not get chain. ");
        }
        if (!error && response.statusCode == 200)
            callback({result:true, data: JSON.parse(body)});
        else
            callback({result:false, data: null});
    });
}

function request_clearBlockchain(callback){
    var options = {
        url: 'http://localhost:3000/clearBlockchain',
        method: 'POST'
    };

    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200)
            callback({result:true, data: null});
        else
            callback({result:false, data: null});
    });
}

function artik_led_control(color, isOn, callback){

    if(color=="blue") color =38;
    if(color=="red") color =28;

    var options = {
        url: 'http://localhost:3000/artik_led_control',
        method: 'POST',
        json: {'color': color, 'isOn': isOn}
    };

    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200)
            callback({result:true, data: null});
        else
            callback({result:false, data: null});
    });
}

function artik_button_read(callback){
    var options = {
        url: 'http://localhost:3000/artik_button_read',
        method: 'POST'
    };
    console.log("artik_button_read !!!!!!!!!!");
    request(options, function (error, response, body) {
        console.log(body);
        if (!error && response.statusCode == 200)
            callback({result:true, data: body}); //pushed 0
        else
            callback({result:false, data: body}); //not pushed 1
    });
}

function artik_see_write_file(path,callback){
    var options = {
        url: 'http://localhost:3000/artik_see_write_file',
        method: 'POST',
        json: {"file_full_path" : path}
    };

    request(options, function (error, response, body) {
        console.log(body);
        if (!error && response.statusCode == 200)
            callback({result:true, data: body});
        else
            callback({result:false, data: body});
    });
}

function callback_func(result){
    console.log(result);
}

module.exports = {
    request_initBlockchain,
    request_getBlockchain,
    request_clearBlockchain,
    broadcast_addBlock,
    broadcast_getBlockchain,
    artik_led_control,
    artik_button_read,
    artik_see_write_file
};

// request_initBlockchain(PEM, callback_func);
// broadcast_addBlock(PEM);

/***
 * ARTIK
 * - LED: https://developer.artik.io/documentation/artik/tutorials/blink-an-led.html
 * - BUTTON: https://developer.artik.io/documentation/artik/tutorials/read-a-button.html
 * - SEE: https://developer.artik.io/documentation/artik/advanced-concepts/prepare-dev-env.html#locating-required-software
 *        https://developer.artik.io/documentation/advanced-concepts/secure-os/secure-api.html
 *        . apt install libartik-security-dev libartik-security
 *
 * TODO
 * - ADD/REPLACE Blockchain 검증: index, previousHash, signature audit
 * - ARTIK 기능: GPIO Interrupt, PrivateKey/PublicKey(인증서), signing 기능, LED 컨트롤
 *
 */
