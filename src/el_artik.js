const exec = require( "child_process" ).exec,
        sys = require( "sys" );

const LED_RED  = "28";
const LED_BLUE  = "38";
const BUTTON_SW403 = "30";

function led_init(color){
    command = "echo " + color + " > /sys/class/gpio/export; echo out > /sys/class/gpio/gpio" + color + "/direction";
    console.log("Execute command: " + command);
    child = exec(command, function(error, stdout, stderr) {
        if(error !== null)
            console.log("[ERROR] " + error);
    });
}

function led_control(color, isOn){
    command = "echo " + isOn + " > /sys/class/gpio/gpio" + color + "/value";
    console.log("Execute command: " + command);
    child = exec(command, function(error, stdout, stderr) {
        if(error !== null)
            console.log("[ERROR] " + error);
    });
}

function button_init(pin_no){
    command = "echo " + pin_no + " > /sys/class/gpio/export; echo in > /sys/class/gpio/gpio" + pin_no + "/direction";
    child = exec(command, function(error, stdout, stderr) {
        console.log("Execute command: " + command);
        if(error !== null)
            console.log("[ERROR] " + error);
    });
}

function button_read(pin_no, callback){
    command = "cat /sys/class/gpio/gpio" + pin_no + "/value";
    console.log("Execute command: " + command);
    child = exec(command, function(error, stdout, stderr) {
        if(error !== null){
            console.log("[ERROR] " + error);
            callback(-1);
        }
        else
            callback(stdout);
    });
}

function see_write_file(file_full_path, callback){
    command = "bin/ss_write " + file_full_path;
    console.log("Execute command: " + command);
    child = exec(command, function(error, stdout, stderr) {
        if(error !== null){
            //console.log("[ERROR] " + error);
            callback("see_write_file() Error!!");
        }
        else
            callback(stdout);
    });
}

function artik_all_init(){
    led_init(LED_RED);
    led_init(LED_BLUE);
    button_init(BUTTON_SW403);
}

module.exports = {
    artik_all_init,
    led_control,
    button_read,
    see_write_file
};