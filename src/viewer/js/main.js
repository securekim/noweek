
var BLOCKS=[];
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

function addBlock(number) {

  if(typeof BLOCKS[number] == "undefined" 
  || typeof BLOCKS[number].pubkey == "undefined") return false;

  let blockContainer = document.getElementById("blockContainer");
  
  let block = document.createElement('div');
    block.className = "block";
    blockContainer.appendChild(block);

  let img = document.createElement('img');
    img.className = "blockImage";
    img.src = "images/"+BLOCKS[number].pubkey.CN+".png";
    img.setAttribute("onclick",'updateBlock('+number+')');
    img.setAttribute("onmouseover",'updateBlock('+number+')');
    block.appendChild(img);
  
  if(number != 0){
    addMiddleChain();
  } else {
    document.getElementById("chainContainer").style="display:contents";
  }
  $('.chain').css('opacity', '1'); // 꼭 들어가야한다.
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
      if(typeof chain1[i].index == "undefined"
      || typeof chain2[i].index == "undefined"
      || chain1[i].index != chain2[i].index
      ) return false;
    }
  } catch (e) {
    console.log("Is not same chain! Change it");
    return false;
  }
  return true;
}

function getNewBlockIndex(callback){ 
  // return new block index
  // -1 : no new block.
  // 0 : initialized. redraw all things.
  httpGetAsync("/getBlockChain",function(data){
    try {
      dt=JSON.parse(data);
      for (var i in dt.data){
        dt.data[i].pubkey=JSON.parse(dt.data[i].pubkey) 
      }
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
        BLOCKS=dt.data;
      }
      BLOCKS=dt.data;
      callback(0);
      return;
    } catch (e) {
      BLOCKS=dt.data;
      callback(0);
      return;
    }
  })
}

function drawBlock(){
  getNewBlockIndex(function(idx){
    if(idx != -1 ){
      for(var i=idx; i<BLOCKS.length; i++) {
        console.log("Add Block");
        addBlock(i);
      }
    }
  });
}
drawBlock();

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

  //_image_CN.removeChild(image_CN.childNodes[0]); //remove png
  //_image_CN.removeChild(image_CN.childNodes[0]); //remove CN

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