
var BLOCKS=[];
var BLOCKS_VIEW=[];
var BLOCKS_LENGTH="";

  // ***************************************************** //

function timeBeautiful(timestamp){
  date = new Date(timestamp),
  datevalues =
     date.getFullYear() + "/" +
     (date.getMonth()+1) + "/" +
     date.getDate() + " " +
     date.getHours() + ":" +
     date.getMinutes() + ":" +
     date.getSeconds()
  
  return datevalues;
}



function CNtoIMAGE(CN){
  //todo
  //if CN == mobile -> imageURL
  
  return "images/"+CN+".png";
}



function addMiddleChain(){
  let middleChain = document.getElementById("middleChain");

  let chain = document.createElement('div');
    chain.className = "chain";
    middleChain.appendChild(chain);

  let img = document.createElement('img');
    img.className = "chainImage";
    img.src = "images/MiddleChain.png";
    chain.appendChild(img);
}

function removeMiddleChain() {
  let middleChain = document.getElementById("middleChain");
  middleChain.removeChild(middleChain.childNodes[0]); 
  middleChain.removeChild(middleChain.childNodes[0]); 
}

function removeBlock(number) {
 //if (document.getElementById("zeroBlock")==null)         
  if(typeof BLOCKS[number] == "undefined" 
  || typeof BLOCKS[number].pubkey == "undefined") return false;
  
  let _block = document.getElementById("block_"+number);
  //BLOCKS[number] = "";
  BLOCKS_VIEW[number] = false;
  _block.remove();
  removeMiddleChain();
}

function isFull(){
  let width = document.getElementById("blockContainer").offsetWidth;
  console.log("width :"+width);
  let viewWidth = 160;
  for(var i in BLOCKS){
    if(typeof BLOCKS_VIEW[i]!="undefined" && BLOCKS_VIEW[i]){
      viewWidth += 80;
    } 
  }
  console.log("viewWidth :" +viewWidth);
  return viewWidth >= width
}

let deletedNumber = 0;

function addBlock(number) {

  if(typeof BLOCKS[number] == "undefined" 
  || typeof BLOCKS[number].pubkey == "undefined") return false;
  
  if(typeof BLOCKS_VIEW[number] == "undefined")
    BLOCKS_VIEW[number] = true;

  let blockContainer = document.getElementById("blockContainer");
  
  let block = document.createElement('div');
    block.id = "block_"+number;
    block.className = "block";
    blockContainer.appendChild(block);

  let img = document.createElement('img');
    img.className = "blockImage";
    img.src = "images/"+BLOCKS[number].pubkey.CN+".png";
    img.setAttribute("onclick",'updateBlock('+number+')');
    img.setAttribute("onmouseover",'updateBlock('+number+')');
    block.appendChild(img);
  
  let fullFlag = isFull();  
  if(number != 0 && !fullFlag){
    addMiddleChain();
  } else {
    document.getElementById("chainContainer").style="display:contents";
  }
  $('.chain').css('opacity', '1'); // 꼭 들어가야한다.
  if(fullFlag){
    console.log("Full Flag !! delete :"+deletedNumber);
    removeBlock(deletedNumber++);
  } 

  updateBlock(number);
}


function httpGetAsync(theUrl, callback)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}

function isSameChain(chain1, chain2){
  try {
    if(chain1.length != chain2.length) return false;
    for(var i in chain1) {
      if(typeof chain1[i].hash == "undefined"
      || typeof chain2[i].hash == "undefined"
      || chain1[i].hash != chain2[i].hash
      ) return false;
    }
  } catch (e) {
    console.log("Is not same chain! Change it");
    return false;
  }
  console.log("It is same chain! Do not Change it");
  return true;
}

var dt;
function getNewBlockIndex(callback){ 
  // return new block index
  // -1 : no new block.
  // 0 : initialized. redraw all things.
  httpGetAsync("/getBlockChain",function(data){
    try {
      dt=JSON.parse(data);
      for (var i in dt.data){
        try {
          dt.data[i].pubkey=JSON.parse(dt.data[i].pubkey) 
        } catch (e) {

        }
      }
      console.log("Check for draw chain")
      if (isSameChain(BLOCKS, dt.data)){
        callback(-1);
        return;
      } else if(BLOCKS.length < dt.data.length) {
        let ret = BLOCKS.length;
        BLOCKS=dt.data;
        callback(ret);
        return;
      } else if(BLOCKS.length > dt.data.length) {
        console.log("Block is deleted.");
        console.log("Hard forked!");
        window.location.reload()

        for(var i=0; i<BLOCKS.length; i++) {
          console.log("Remove Block");
          removeBlock(i);
        }
        BLOCKS=dt.data;
        callback(0);
        return;
      }
      BLOCKS=dt.data;
      callback(0);
      return;
    } catch (e) {
      BLOCKS=dt.data;
      callback(-1);
      return;
    }
  })
}

function drawBlock() {
  getNewBlockIndex ((idx) => {
    console.log("New Block Index :"+idx);
    if(idx != -1 ){
      for(var i=idx; i<BLOCKS.length; i++) {
        console.log("Add Block");
        addBlock(i);
      }
    }
  });
}

setTimeout (()=>{
  drawBlock();
},800)

setInterval(function(){
  drawBlock();
},4000);

//todo getBlock(number);

function updateBlock(number){
  for (key in update){
    update[key](number);
  }
}

const maxLength = 250;

var update = {
image_CN : (number)=>{
  let _image_CN = document.getElementById("image_CN");
    //<img src="images/mobile.png" alt="BLOCK NUMBER :0" height="80" width="80" class="chain">Mobile

    _image_CN.innerHTML = '<img src="images/'+BLOCKS[number].pubkey.CN+'.png" class="mainImage">'+BLOCKS[number].pubkey.CN
},
time :(number) => {
  let _time = document.getElementById("time");
  _time.innerHTML = timeBeautiful(BLOCKS[number].timestamp);
},
loading : (number) => {
  if(BLOCKS[number].pubkey.CN=="webcam"){
    var image = '<img src="images/QR.png" alt="'+name+'" height="160" width="160" '
    image+='></img>';
    document.getElementById('load').innerHTML=image;
  } else {
    document.getElementById('load').innerHTML = '<div class="lds-grid"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>';
  }
},
certificate : (number) => {
  let _certificate = document.getElementById("certificate");
  _certificate.innerHTML = readmore(BLOCKS[number].pubkey.CA);
},
publickey : (number) => {
  let _publickey = document.getElementById("publickey");
  _publickey.innerHTML = readmore(BLOCKS[number].pubkey.PUBKEY);
},
signature : (number) => {
  let _signature = document.getElementById("signature");
  _signature.innerHTML = readmore(BLOCKS[number].signature);

},
rawdata : (number) => {
  let _rawdata = document.getElementById("rawdata");
  _rawdata.innerHTML = readmore(JSON.stringify(BLOCKS[number]));
}
}

function readmore(str){
  let readMore = '<span class="read-more-target">' // + </span>
  return str.substring(0, maxLength)
  + readMore
  + str.substring(maxLength)
  + "</span>";
}

function test(){
  for(var i=0; i<20; i++){
    setTimeout(()=>{
      addBlock(1);
    },i*300);
  }
}