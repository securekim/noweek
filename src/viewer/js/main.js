
var PEOPLES="";
var PEOPLESDETAIL=[];
var MYPROFILE={};

var MYACCOUNT;
var MYPRIVATEKEY;

var BLOCKS=[];
var BLOCKS_LENGTH="";

var HARD_CODED_ACCOUNT = "0x731a765dff550d11b7c880af145066bc1bdd3127";
var HARD_CODED_ACCOUNT_PRIVATEKEY = "2269b98525af6803b23779eefee1d1ee7293547cca8cb14f1ca12df9bfbfb7f5";

var HARD_CODED_SCOUTER = "0x6f213a598be7058a4248eaf0a2593210fa8b71c3";
var HARD_CODED_SCOUTER_PRIVATEKEY = "d816e5e0eab23dc5573968edaed1443787b03a5dddf4b82e48818ad3634a894a";

var HARD_CODED_SCOUTER_NUMBER =2 ;
var HARD_CODED_ACCOUNT_NUMBER = 0;
var ScouterAccessHideInfoYn = {};

///////////INTERVIEW STATUS
  var ING="1";                    //INTERVEWEE ONLY
  var QUIT="2";                   //INTERVIEWER & SCOUTER  
  var WAIT ="0"; PASS="3"; FAIL="4";  //SCOUTER ONLY
  
    
  

///////////////////////////////////////////////////
//https://loading.io/css/
// 모두 캐시 해야 됨
// 이래가지고는 안된다.
// 전부 로컬스토리지에 넣어놓고
// 주기적으로 갱신 해야 한다
// 구조는 ?

// myaccount : {privatekey, number}
// {account} : {구매했는지, 파일명이뭔지,  }
// 
//느린 주범 1. 
// initUser
// PEOPLES = initUser(1);
// PEOPLES = PEOPLES.replace(/'/g, '"');
// PEOPLES = JSON.parse(PEOPLES);
//
// 0. 한번 접근하면 로컬스토리지에 저장한다.
// 1. 로컬스토리지에 접근해서 PEOPLES를 가져온다.
// 2. 값이 없으면 initUser 진행, 값이 있으면 리턴.
// 3. 주기적으로 initUser 를 호출해준다.
//
//느린 주범 2.
//getScouterAccessHideInfoYn
//var files = getScouterAccessHideInfoYn(account,PEOPLES[number].account)
//if(files[0]!=""){
//
//느린 주범 3.
//getScouterPurchaseAccountList
//
// //
// var scouterPurchaseAccountList = getScouterPurchaseAccountList(account);
// var paid = false;
// for (var i in scouterPurchaseAccountList[0]){
//   if(typeof PEOPLES[number].account!='undefined' && scouterPurchaseAccountList[0][i] == PEOPLES[number].account) paid = true;
// }
////////////////////////////////////////////////////


function initMyPMC(){
  if(typeof MYPROFILE.myPMC=='undefined'){
    MYPROFILE.myPMC=getPMCBalance(MYPROFILE.account);
    document.getElementById('myPMC').innerHTML='My PMC : '+MYPROFILE.myPMC+' <span class="glyphicon glyphicon-fire"></span>';
  }
}

function updateMyPMC(){
  MYPROFILE.myPMC=getPMCBalance(MYPROFILE.account);
  document.getElementById('myPMC').innerHTML='My PMC : '+MYPROFILE.myPMC+' <span class="glyphicon glyphicon-fire"></span>';
}

function insertPrivateContent(){
  var tables = document.getElementById('tables');
  
  var table = document.createElement('table');  
    table.className = "contents_table";
    table.width = "350px";
    table.style = "margin: 0px auto; padding-top:10px"
    table.bgcolor="#FFFFFF";
    table.border="0";
    tables.appendChild(table);
    
  var tbody = document.createElement('tbody'); 
    table.appendChild(tbody);

  var tr1 = document.createElement('tr');
    tbody.appendChild(tr1);

  var td1 = document.createElement('td');
    tr1.appendChild(td1);  
  
  var frmTag1 = '<input type=text name=addText style="width:300px; height:30px;" placeholder="Content Name">';
    td1.innerHTML=frmTag1;

  var td2 = document.createElement('td');
    td2.rowSpan="2";
    tr1.appendChild(td2);  

  var frmTag2 = '<button class="btn btn-outline-danger my-2 my-sm-0" type=button value="삭제" onClick="deletePrivateContent($(this))" style="cursor:hand; height:50px;">X</button>';
    td2.innerHTML=frmTag2;  

  var tr2 = document.createElement('tr');
    tr2.style="padding-bottom:10px";
    tbody.appendChild(tr2);

  var frmTag3 = '<input type=text name=addText style="width:300px; height:30px;" placeholder="Content URL">';
    td3.innerHTML=frmTag3;  
}

function deletePrivateContent(td) {
  console.log(td.parent().parent().parent().parent().remove());
}


  //value == COIN
  //_계좌 사용자
  //_계좌 스카우터
  //prikey : d816e5e0eab23dc5573968edaed1443787b03a5dddf4b82e48818ad3634a894a
  //function sendPmcForOpenHideInfo(gas, value, _to, _from, priKey){

function useGas(coin,number){
  alertify.prompt('<H4>'+coin+' <span class="glyphicon glyphicon-fire"></span>  will be paid.</H4> <br>And It takes some time. <br> Speed is depend on GAS :', "50",
  function(evt, value ){
    alertify.confirm("Are you sure ? Coin :"+coin+" Gas :"+value+ " <br>Will be paid for private info.",
      function(){
        sendPmcForOpenHideInfo(value, coin, PEOPLES[number].account, MYPROFILE.account, MYPROFILE.priKey)
        console.log(value, coin, PEOPLES[number].account, MYPROFILE.account, MYPROFILE.priKey);
        setJumboButton(number,"YELLOW");
        alertify.success('Ok');
      },
      function(){
        alertify.error('Cancel');
      }).set('labels', {ok:'Comfirm', cancel:'Cancel'});
  },
  function(){
    alertify.error('Cancel');
  })
}

function drawScout(){
  list = getRecruitRequestList(MYPROFILE.account,1);
  list = list.replace(/'/g, '"');
  list = JSON.parse(list);
  //for(var i in list){}
  removeAllJumbotrons();
  for(var i in list){
    addScoutJumbotronToMain(list[i]);
  }
}

function addScoutJumbotronToMain(myScoutersInfo){
  //내 어카운트를 넣으면 면접정보가 나온다
  //그 정보 전체를 여기에 넣어준다
  if(myScoutersInfo=="" || typeof myScoutersInfo=='undefined') {
    console.log("There is no data in myScoutersInfo");
    return;
  }
  // var account     = myScoutersInfo.scouterAddr;
  // var name        = myScoutersInfo.company.name;
  // var url         = myScoutersInfo.company.url;
  // var category    = myScoutersInfo.company.category;
  // var expense     = myScoutersInfo.recruitReward;
  // var place       = myScoutersInfo.meetingPlace;
  // var contact     = myScoutersInfo.emergencyPhoneNumber;
  // var date        = myScoutersInfo.meetingDate;
  // var recruitAddr = myScoutersInfo.recruitAddr;
  // var userName    = myScoutersInfo.userName;
  // var scouterName = myScoutersInfo.scouterName;

  if(typeof myScoutersInfo.company.url =='undefined') myScoutersInfo.company.url = "https://i.pinimg.com/280x280_RS/90/b2/5c/90b25cf1d436d20b1ce2dcd7f48bd89d.jpg"
  if(typeof myScoutersInfo.company.category == 'undefined') myScoutersInfo.company.category = "unknwon";
  
  var parameter =  '"'+myScoutersInfo.scouterAddr+'"';
  parameter    += ',"'+myScoutersInfo.company.name+'"';
  parameter    += ',"'+myScoutersInfo.company.url+'"';
  parameter    += ',"'+myScoutersInfo.company.category+'"';
  parameter    += ',"'+myScoutersInfo.recruitReward+'"';
  parameter    += ',"'+myScoutersInfo.meetingPlace+'"';
  parameter    += ',"'+myScoutersInfo.emergencyPhoneNumber+'"';
  parameter    += ',"'+myScoutersInfo.meetingDate+'"';
  parameter    += ',"'+myScoutersInfo.recruitAddr+'"';
  parameter    += ',"'+myScoutersInfo.userName+'"';
  parameter    += ',"'+myScoutersInfo.scouterName+'"';
  parameter    += ',"'+myScoutersInfo.recruitStatus+'"';
  parameter    += ',"'+myScoutersInfo.userAddr+'"';
 
  var main = document.getElementById("main");

  var jumbotron = document.createElement('div');
    jumbotron.className = "jumbotron";
    jumbotron.style = "background-color: white; margin-bottom: 1rem;";
    jumbotron.href="#"
    jumbotron.id = "jumbotron_"+myScoutersInfo.recruitAddr;

    //HASH값 필요
    jumbotron.setAttribute("onclick",'viewScouter(' +parameter+ ')');
    jumbotron.style = "border-radius: 0px;margin-bottom: 10px;background-color: white;border-bottom: solid gray; border-bottom-width: 1px;border-right-width: 0.7px; ";
    main.appendChild(jumbotron);

  var table = document.createElement('table');
    table.style="width:100%"
    jumbotron.appendChild(table);

  var td1 = document.createElement('td');
    td1.style = "padding:20px";
    table.appendChild(td1);

  var image = '<img src="'+myScoutersInfo.company.url+'" alt="'+myScoutersInfo.company.name+'" height="45" '
    //image+='class="rounded-circle"'
    image+='></img>';
    td1.innerHTML=image;

  var td2 = document.createElement('td');
    td2.style = "vertical-align:middle";
    table.appendChild(td2);
    
    var td3 = document.createElement('td');
    td3.id="load_"+myScoutersInfo.recruitAddr;
    td3.style = "vertical-align:middle; height:80px; width:80px";
    table.appendChild(td3);  
  
    setJumboButton(myScoutersInfo.recruitAddr,myScoutersInfo.recruitStatus);

  var h = document.createElement('h6');
    td2.appendChild(h);
  var myContext = myScoutersInfo.company.name+' - '+myScoutersInfo.company.category+' <p class="lead"><span class="glyphicon glyphicon-briefcase"></span> '+myScoutersInfo.scouterName+'<br>'
      myContext+= '<span class="glyphicon glyphicon-hand-right"></span> '+myScoutersInfo.userName+''+'</p>';
    h.innerHTML=myContext;
}


function drawAllItems(account,number){
  account = MYPROFILE.account;
  if(getScouterYn(account)){
    var scouterPurchaseAccountList = getScouterPurchaseAccountList(account);
    var paid = false;
    for (var i in scouterPurchaseAccountList[0]){
      if(typeof PEOPLES[number].account!='undefined' && scouterPurchaseAccountList[0][i] == PEOPLES[number].account) paid = true;
    }
    if(paid) {
      //버튼은 노란색 아니면 파란색이되어야하고
      //로딩바가 뿌려지거나 데이터가 뿌려져야 한다.
      console.log("PAID !! : "+paid);
      var files = getScouterAccessHideInfoYn(account,PEOPLES[number].account)
        if(files[0]!=""){
          //데이터가 있다면, 로딩바는 없애고 파란색을 틀어주고 뿌려준다
          console.log("files : "+files);
          setJumboButton(number,"BLUE");
          setModalLoder(false);

          document.getElementById("interview-tab").className="nav-link";

          var myButton = document.getElementById('modalPeopleMore');
          myButton.disabled=false;
          myButton.className="btn btn-success";
          myButton.innerHTML="I need you !";
          myButton.setAttribute("onclick",'iNeedYou('+number+')');
          frm = "<strong>Private Detail : </strong><br>";
          for (var i in files){
            if(files[i]!=""){
              frm += '&nbsp;<a href="'+files[i]+'">첨부링크 클릭 '+i+'</a><br>'; 
            }
          }
          document.getElementById("modalPeoplePrivateInfoDetail").innerHTML = frm;
        } else {
          //샀는데 데이터가 없다...
          //데이터를 지워주고 노란색을 틀어주고 로딩바를 그려준다
          console.log("PAID, BUT NO DATA !!! ");
          document.getElementById("interview-tab").className="nav-link fade disabled";
          document.getElementById("profile-tab").className="nav-link active show";
          
          document.getElementById("profileTab").className = "tab-pane active show";
          document.getElementById("interviewTab").className = "tab-pane";

          document.getElementById('modalPeoplePrivateInfoDetail').innerHTML="";
          setJumboButton(number,"YELLOW");
          setModalLoder(true);
          document.getElementById('modalPeopleMore').disabled=true;
        }
    } else {
      //안샀음.. 로딩바 빼주고 회색 틀어준다
      console.log("NOT PAID !!! ");
          document.getElementById("interview-tab").className="nav-link fade disabled";
          document.getElementById("profile-tab").className="nav-link active show";
          
          document.getElementById("profileTab").className = "tab-pane active show";
          document.getElementById("interviewTab").className = "tab-pane";

          document.getElementById('modalPeoplePrivateInfoDetail').innerHTML="";
          setJumboButton(number,"GRAY");
          setModalLoder(false);
          document.getElementById('modalPeopleMore').disabled=false;
    }
  } else {
    console.log("NOT PAID !!! ");
        document.getElementById("interview-tab").className="nav-link fade disabled";
        document.getElementById("profile-tab").className="nav-link active show";
        
        document.getElementById("profileTab").className = "tab-pane active show";
        document.getElementById("interviewTab").className = "tab-pane";

        document.getElementById('modalPeoplePrivateInfoDetail').innerHTML="";
        setJumboButton(number,"GRAY");
        setModalLoder(false);
        document.getElementById('modalPeopleMore').disabled=false;

  }
}

function removeAllJumbotrons(){
  var myNode = document.getElementById("main");
  while (myNode.firstChild) {
      myNode.removeChild(myNode.firstChild);
  }
}

function setJumboButton(number,color){
  jumbotron = document.getElementById("jumbotron_"+number);
  
  if(color == "YELLOW"){
    //    border: solid rgb(23, 162, 184);
     document.getElementById('load_'+number).innerHTML = '<div class="lds-roller"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>';
  }else if (color == "BLUE"){
    //<div class="lds-heart"><div></div></div>
    //<div class="lds-ripple"><div></div><div></div></div>
    //<div class="lds-grid"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
    //<div class="lds-facebook"><div></div><div></div><div></div></div>
    document.getElementById('load_'+number).innerHTML = '<div class="lds-grid"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>';
  }else if(color == "GRAY"){
    document.getElementById('load_'+number).innerHTML = '';
  }else if(color == ING){
    document.getElementById('load_'+number).innerHTML = '<div class="lds-facebook"><div></div><div></div><div></div></div>';
    
// //INTERVEWEE ONLY
// ING=1; 

// //INTERVIEWER / SCOUTER
// QUIT=2; 

// //SCOUTER ONLY
// var PASS=3; FAIL=4;
  }else if(color == QUIT){
    document.getElementById('jumbotron_'+number).className = 'jumbotron blured';
  }else if (color == FAIL){
    document.getElementById('jumbotron_'+number).className = 'jumbotron darkness';
  }else if (color == PASS){
    document.getElementById('load_'+number).innerHTML = '<div class="lds-heart"><div></div></div>';
    
  }else if (color == WAIT){
    document.getElementById('load_'+number).innerHTML = '<div class="lds-ripple"><div></div><div></div></div>';
  }
}

function setModalLoder(loader){
  if(loader){
    document.getElementById('modalLoader').className="loader loader-8";
  } else {
    document.getElementById('modalLoader').className="";
  }
}




function dummyPeople(){
  removeAllJumbotrons();
  //http://cfile5.uf.tistory.com/image/99E8E33359DB49394B6E66
  addJumbotronToMain("휴지", "Security 전문가입니다.", "http://cfile5.uf.tistory.com/image/99E8E33359DB49394B6E66","http://blog.securekim.com","PEOPLE");
}


function iNeedYou(number){
    var date = document.getElementById('DATE').value;
    var place = document.getElementById('PLACE').value;
    var contact = document.getElementById('CONTACT').value;
    var expenses = document.getElementById('EXPENSES').value;
    console.log(date);
    console.log(place);
    console.log(contact);
    console.log(expenses);

    if (date == "" || place == "" || contact == "" || expenses == ""){
      alertify.error('Please input the value to interview.');
      return;
    }
    
    var message = " The interview has been scheduled for <H6>'"+date+"'</H6>";
    message += "<br> In <H6>'"+place+"'</H6>";
    message += "<br> Contact : <H6>"+contact+"'</H6>";
    message += "<br> Interview expenses : <H6>"+expenses+'<span class="glyphicon glyphicon-fire"></span></H6>';

    alertify.confirm("<H3>Is this right ?</H3> <br> "+message,
    function(){
          alertify.prompt('<H4>'+expenses+' <span class="glyphicon glyphicon-fire"></span> will be paid at the end of the interview.</H4> <br>And It takes some time. <br> Speed is depend on GAS :', "50",
          function(evt, value ){
            alertify.confirm("Are you sure ? EXPENSES :"+expenses+" Gas :"+value+ " <br>Will be paid for interview.",
              function(){
                 requestRecruitUser(value, PEOPLES[number].account, MYPROFILE.account, MYPROFILE.priKey, expenses, date, place, contact)
                alertify.success('Ok');
              },
              function(){
                alertify.error('Cancel');
              }).set('labels', {ok:'Comfirm', cancel:'Cancel'});
          },
          function(){
            alertify.error('Cancel');
          })
    },
    function(){
      alertify.error('Cancel');
    }).set('labels', {ok:'Comfirm', cancel:'Cancel'});
}





  // ***************************************************** //

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

httpGetAsync("/getBlockChain",function(data){
  console.log("/getBlockChain");
  dt=JSON.parse(data);
  for (var i in dt.data){
    dt.data[i].pubkey=JSON.parse(dt.data[i].pubkey) 
  }

  if(BLOCKS==null 
    || typeof BLOCKS == "undefined" 
    || BLOCKS.length == 0)
    {
      BLOCKS=dt.data;
      drawPeople();
    } else {
        for (var i in BLOCKS){
          if (BLOCKS[i].hash == dt.data[i].hash){
            console.log("Same block");
        } else {
          console.log("not same block");
          BLOCKS=dt.data;
          drawPeople();
          break;
        }
      }
    }
})

setInterval(function(){
httpGetAsync("/getBlockChain",function(data){
  console.log("/getBlockChain");
  dt=JSON.parse(data);
  for (var i in dt.data){
    dt.data[i].pubkey=JSON.parse(dt.data[i].pubkey) 
  }
  httpGetAsync("/getBlockChain",function(data){
    console.log("/getBlockChain");
    dt=JSON.parse(data);
    for (var i in dt.data){
      dt.data[i].pubkey=JSON.parse(dt.data[i].pubkey) 
    }
  
    if(BLOCKS==null 
      || typeof BLOCKS == "undefined" 
      || BLOCKS.length == 0)
      {
        BLOCKS=dt.data;
        drawPeople();
      } else {
          for (var i in BLOCKS){
            if (BLOCKS[i].hash == dt.data[i].hash){
              console.log("Same block");
          } else {
            console.log("not same block");
            BLOCKS=dt.data;
            drawPeople();
            break;
          }
        }
      }
  })
  })},4000);

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


function drawPeople(){
  removeAllJumbotrons();
  if(BLOCKS==null || typeof BLOCKS == "undefined" || BLOCKS.length == 0){
    console.log("NO BLOCKS");
  } else {
    for(var i in BLOCKS){
      addJumbotronToMain("BLOCK NUMBER :"+i,"DEVICE : '"+BLOCKS[i].pubkey.CN+"'",CNtoIMAGE(BLOCKS[i].pubkey.CN),i,"PERSON");
    }
  }
}

function addPeople(number){
  if(BLOCKS==null || typeof BLOCKS == "undefined" || BLOCKS.length == 0){
    console.log("NO BLOCKS");
  } else {
      addJumbotronToMain("BLOCK NUMBER :"+number,"DEVICE : '"+BLOCKS[number].pubkey.CN+"'",CNtoIMAGE(BLOCKS[number].pubkey.CN),number,"PERSON");
    
  }
}

function CNtoIMAGE(CN){
  //todo
  //if CN == mobile -> imageURL
  
  return "images/"+CN+".png";
}


function addJumbotronToMain(name, context, imageURL, number, type){
  
  var CN= BLOCKS[number].pubkey.CN;

  var main = document.getElementById("main");
  var jumbotron = document.createElement('div');
    jumbotron.className = "jumbotron";
    jumbotron.style = "background-color: white; margin-bottom: 1rem;";
    jumbotron.setAttribute("data-target","#profileModal");
    jumbotron.setAttribute("data-toggle","modal");
    jumbotron.href="#"
  
    jumbotron.id = "jumbotron_"+number;
    jumbotron.style = "border-radius: 0px;margin-bottom: 10px;background-color: white;border-bottom: solid gray; border-bottom-width: 1px;border-right-width: 0.7px; ";
    main.appendChild(jumbotron);

  var table = document.createElement('table');
    table.style="width:100%"
    jumbotron.appendChild(table);

  var td1 = document.createElement('td');
    td1.style = "padding:20px; width:40%";
    table.appendChild(td1);

  var image = '<img src="'+imageURL+'" alt="'+name+'" height="80" width="80" '
    if(type=="PERSON") image+='class="rounded-circle"'
    image+='></img>';
    td1.innerHTML=image;

  var td2 = document.createElement('td');
    td2.style = "vertical-align:middle";
    table.appendChild(td2);
    
  if(type=="PERSON"){
    var td3 = document.createElement('td');
    td3.id="load_"+number;
    td3.style = "vertical-align:middle; height:80px; width:80px";
    table.appendChild(td3);  
  }

  var h = document.createElement('h6');
    td2.appendChild(h);

  var myContext = timeBeautiful(BLOCKS[number].timestamp)+' <p class="lead">'+context+'</p>';
    h.innerHTML=myContext;
    
    if(type=="PERSON"){
      //drawAllItems("HARD_CODED_SCOUTER",number);
      jumbotron.setAttribute("onclick","updatePeopleModal("+number+")");
    }
    if(CN=="webcam"){
      var image = '<img src="images/QR.png" alt="'+name+'" height="80" width="80" '
      image+='></img>';
      document.getElementById('load_'+number).innerHTML=image;
    } else {
      document.getElementById('load_'+number).innerHTML = '<div class="lds-grid"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>';
    }

}

function updatePeopleModal(number){
  console.log("updatePeopleModal !!! ");
  //var items = PEOPLES[number].items
  /*
      사용자 디테일은 사용자 한명한명 직접 클릭했을때 반영
  */
    
  document.getElementById('modalPeopleName').innerText=BLOCKS[number].pubkey.CN;
  document.getElementById('modalPeopleImg').setAttribute("src",CNtoIMAGE(BLOCKS[number].pubkey.CN));
  document.getElementById('modalPeopleImg2').setAttribute("src",CNtoIMAGE(BLOCKS[number].pubkey.CN));
  var modalPeopleInfo = document.getElementById('modalPeopleInfo');
  while (modalPeopleInfo.firstChild) {
    modalPeopleInfo.removeChild(modalPeopleInfo.firstChild);
  }
  var h3 = document.createElement('h3');
    h3.className = "media-heading";
    modalPeopleInfo.appendChild(h3);

  var frm = '<span id="peoplePMC" class="glyphicon glyphicon-time"></span> '+timeBeautiful(BLOCKS[number].timestamp)
    h3.innerHTML = frm;

  //  for(var i in items.interestItems){
  //    span = document.createElement('span');
  //    span.className = "badge badge-pill badge-info";
  //    span.innerHTML = hexToString(items.interestItems[i]);
  //    modalPeopleInfo.appendChild(span);
  //  }


  document.getElementById('modalPeopleBio').style="word-break: break-all;"

  if(BLOCKS[number].previousHash==""){
    document.getElementById('modalPeopleBio').innerHTML = "<strong>Prev Hash: </strong><br>This is GENESIS BLOCK.<br>" ;
  } else {
    document.getElementById('modalPeopleBio').innerHTML = "<strong>Prev Hash: </strong><br>" +BLOCKS[number].previousHash+"<br>";
  }
  document.getElementById('modalPeopleBio').innerHTML += "<br><strong>This Hash: </strong><br>" +BLOCKS[number].hash;

  var modalPeoplePrivateInfo = document.getElementById("modalPeoplePrivateInfo");
  frm = "<strong>Signature : </strong><br>"
  frm += BLOCKS[number].signature;


  modalPeoplePrivateInfo.style="word-break: break-all;"
  modalPeoplePrivateInfo.innerHTML = frm;

   var modalPeoplePublicInfo = document.getElementById("modalPeoplePublicInfo");
   while (modalPeoplePublicInfo.firstChild) {
    modalPeoplePublicInfo.removeChild(modalPeoplePublicInfo.firstChild);
  }

  modalPeoplePublicInfo.style="word-break: break-all;"

    frm = "<strong>Public Key : </strong><br>"
    frm += "&nbsp;"+BLOCKS[number].pubkey.PUBKEY+"<br>";

    modalPeoplePublicInfo.innerHTML = frm;

    // for (var i in PEOPLESDETAIL[number].hideInfo.hideInfoHint){
    //   if(PEOPLESDETAIL[number].hideInfo.hideInfoHint[i]!="")
    //   frm += "&nbsp;"+PEOPLESDETAIL[number].hideInfo.hideInfoHint[i]+"<br>";
    // }

    //frm += &nbsp;

    //document.getElementById('modalPeopleMore').setAttribute("onclick","useGas("+PEOPLESDETAIL[number].hideInfo.hideInfoValue+","+number+")");
    //
    //document.getElementById('modalPeopleMore').innerHTML = "More "+PEOPLESDETAIL[number].hideInfo.hideInfoValue+' <span class="glyphicon glyphicon-fire"></span>';
    
  //drawAllItems("HARD_CODED_SCOUTER",number);
  
  var rawBlock = document.getElementById("RAWBLOCK");
  rawBlock.innerHTML = JSON.stringify(BLOCKS[number]);
  rawBlock.style="word-break: break-all;"

}