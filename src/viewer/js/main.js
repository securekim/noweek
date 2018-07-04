
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

// var parameter = '"'+account+'"';
// parameter    += ',"'+name+'"';
// parameter    += ',"'+url+'"';
// parameter    += ',"'+category+'"';
// parameter    += ',"'+expense+'"';
// parameter    += ',"'+place+'"';
// parameter    += ',"'+contact+'"';
// parameter    += ',"'+date+'"';
function viewScouter(account,name,url,category,expense,place,contact,date,recruitAddr,userName,scouterName,recruitStatus,userAddr){

  var frame = '<H4>'+name+' 에서</H4><br>'
  frame    += ' 친애하는 "' + userName + '" 님께<br><br>'
  frame    += '"'+userName +'"님께서<br> 유로로 공개한 정보를 검토해 본 결과,<br>'
  frame    += '면접에 초대하고 싶어서 연락 드리게 되었습니다.<br>';
  frame    += '<br>"'+scouterName+'" 드림.<br><br>';
  frame    += '<hr>';
  frame    += ' 면접 정보 요약 :<br>';
  frame    += '<span class="glyphicon glyphicon-time"></span> '+date+' <br>';
  frame    += '<span class="glyphicon glyphicon-home"></span> '+place+' <br>';
  frame    += '<span class="glyphicon glyphicon-phone-alt"> '+contact+'</span><br>';
  frame    += '<span class="glyphicon glyphicon-link"></span><a href="'+url+'"> URL(Click) </a><br>'
  frame    += '<hr>';
  frame    += expense+' <span class="glyphicon glyphicon-fire"></span> 가 면접비로 지원 됩니다.<br>';
  if(recruitStatus == ING){
    frame    += '<hr>';
    frame    += '"'+userName+'" 님께서 면접에 동의하셨습니다.';
  } 
  if (recruitStatus == QUIT){
    frame    += '<hr>';
    frame    += '부득이한 사정으로 면접이 종료되었습니다.';
  } 
  if (recruitStatus == PASS){
    frame    += '<hr>';
    frame    += '면접 결과 <br> ';
    frame    += 'Pass 입니다. 함께 일할 수 있게 되어 영광입니다.';
  } 
  if (recruitStatus == FAIL){
    frame    += '<hr>';
    frame    += '면접 결과 <br> ';  
    frame    += '부득이한 사정으로 함께 일할 수 없게 되어 죄송합니다. ';
  }

  var FLAG = 1;
  alertify.confirm(frame,
  function myconfirm(){
    if(account != MYPROFILE.account && recruitStatus==WAIT){

        alertify.prompt('Your Contact will be posted for interview. <br>And It takes some time. <br> Speed is depend on GAS :', "50",
        function(evt, value ){
          alertify.confirm("Are you sure ? Gas :"+value+ " <br>Will be paid for interview.<br>And Your Contact will be posted for interview",
            function(){
              //setJumboButton(number,"YELLOW");
              //가스 , 유재석, 최유정, 최유정개인키, 면접주소
              assignRecruitRequest(value, account, MYPROFILE.account, MYPROFILE.priKey, recruitAddr);
              setJumboButton(recruitAddr,ING);
              alertify.success('Ok');
            },
            function(){
              alertify.error('Cancel');
            }).set('labels', {ok:'Confirm', cancel:'cancel'});;
        },
        function(){
          alertify.error('Cancel');
        })

      } else if (account == MYPROFILE.account && recruitStatus==ING){
        //진행중이므로, 유재석인경우 PASS / FAIL 을 줄 수 있다.
        
        alertify.prompt('면접이 종료되었나요? 결과와 가스를 입력해 주세요', "불합격/50",
        function(evt, value ){
          gas = value.split("/")[1]
          
          if(value.includes('불')) {
              frm = "결과 : 불합격";
              ret = FAIL;
            }
            else{
              ret = PASS;
              frm = "결과 : 합격";
            } 
          alertify.confirm(frm+"<br> 확실한가요? 결과가 면접자에게 통보됩니다.<br> 이 작업은 Gas"+gas+" 를 소모합니다.",
            function(){
              //setJumboButton(number,"YELLOW");
              //가스 , 유재석, 최유정, 최유정개인키, 면접주소
              noticeJobInterviewResult(gas, account, userAddr, ret, MYPROFILE.priKey, recruitAddr)
              alertify.success('진행이 완료됩니다.');
              setJumboButton(recruitAddr,ret);
            },
            function(){
              alertify.error('Cancel');
            }).set('labels', {ok:'Confirm', cancel:'Cancel'});;
        },
        function(){
          alertify.error('Cancel');
        })

      }
  },
  function mycancel(){
    //SET FLAG FOR INFINITY LOOP...
      if(FLAG && (recruitStatus==ING || recruitStatus==WAIT)){
        FLAG = 0;
        secondConfirm(recruitAddr);
      }
  }).set('labels', {ok:'알겠습니다.', cancel:'취소'});

}

var G_recruitAddr
function secondConfirm(addr) {
  G_recruitAddr = addr;
  var tmp = setTimeout(function myOtherCancel() {
      alertify.confirm("<h5>Caution !</h5>이 면접을 취소하시겠습니까 ? <br> 되돌릴 수 없습니다.<br> 면접 번호 :<br>"+G_recruitAddr, function (e) {
          if (e) {
              //Done
              alertify.error("면접을 취소했습니다.");
              setJumboButton(G_recruitAddr,QUIT);
              tmp = null;
          } else {
              // user clicked "cancel"
              console.log("Cancel...");
              alertify.success("면접이 취소되지 않았습니다.");
          }
      }).set('labels', {ok:'인터뷰를 취소 합니다.', cancel:'취소하지 않습니다.'});
  }, 500); // I went as low as 300 ms, but higher value is safer :)
  return true;
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



// function updateModalI(){

//     if(typeof MYPROFILE.account =='undefined'){
//       //내 정보가 없는 경우에만 세팅
//       profile = getMyProfile(MYACCOUNT);
//       MYPROFILE.account = MYACCOUNT;
//       MYPROFILE.picture = profile.basicInfo.picture;
//       MYPROFILE.name = profile.basicInfo.name;
//       MYPROFILE.interestItems = profile.basicInfo.interestItems;
//       MYPROFILE.mvp = profile.basicInfo.mvp.c[0];
//       tmp = profile.profileInfo.replace(/'/g, '"')
//       MYPROFILE.peoplesDetail = JSON.parse(tmp);

//     } 
    
//     document.getElementById('modalIName').innerText=MYPROFILE.name;
//     document.getElementById('modalIImg').setAttribute("src",MYPROFILE.picture);
//     var modalPeopleInfo = document.getElementById('modalIInfo');
//     while (modalPeopleInfo.firstChild) {
//       modalPeopleInfo.removeChild(modalPeopleInfo.firstChild);
//     }
//     var h3 = document.createElement('h3');
//       h3.className = "media-heading";
//       modalPeopleInfo.appendChild(h3);
  
//     var frm = 'Trust Power<span id="IPMC" class="glyphicon glyphicon-flash"></span>'+MYPROFILE.mvp
//       h3.innerHTML = frm;
  
//      for(var i in MYPROFILE.interestItems){
//        span = document.createElement('span');
//        span.className = "badge badge-pill badge-info";
//        span.innerHTML = hexToString(MYPROFILE.interestItems[i]);
//        modalPeopleInfo.appendChild(span);
//      }
  
//      var modalPeoplePublicInfo = document.getElementById("modalIPublicInfo");
//      while (modalPeoplePublicInfo.firstChild) {
//       modalPeoplePublicInfo.removeChild(modalPeoplePublicInfo.firstChild);
//     }
  
//       frm = "<strong>Public Info : </strong><br>"
//       for (var i in MYPROFILE.peoplesDetail.profileInfo.educationHistory){
//         if(MYPROFILE.peoplesDetail.profileInfo.educationHistory[i]!="")
//           frm += "&nbsp;"+MYPROFILE.peoplesDetail.profileInfo.educationHistory[i]+"<br>";
//       }
//       frm+="<p></p>";
//       for (var i in MYPROFILE.peoplesDetail.profileInfo.careerHistory){
//         if(MYPROFILE.peoplesDetail.profileInfo.careerHistory[i]!="")
//         frm += "&nbsp;"+MYPROFILE.peoplesDetail.profileInfo.careerHistory[i]+"<br>";
//       }
//       frm+="<p></p>";
//       for (var i in MYPROFILE.peoplesDetail.profileInfo.achievements){
//         if(MYPROFILE.peoplesDetail.profileInfo.achievements[i]!="")
//         frm += "&nbsp;"+MYPROFILE.peoplesDetail.profileInfo.achievements[i]+"<br>";
//       }
//       modalPeoplePublicInfo.innerHTML = frm;
  
//       document.getElementById('modalIBio').innerHTML = "<strong>Free Vision: </strong><br>" +MYPROFILE.peoplesDetail.freeVision;
  
//       var modalPeoplePrivateInfo = document.getElementById("modalIPrivateInfo");
//       frm = "<strong>Private Info : </strong><br>"
//       for (var i in MYPROFILE.peoplesDetail.hideInfo.hideInfoHint){
//         if(MYPROFILE.peoplesDetail.hideInfo.hideInfoHint[i]!="")
//         frm += "&nbsp;"+MYPROFILE.peoplesDetail.hideInfo.hideInfoHint[i]+"<br>";
//       }
//       modalPeoplePrivateInfo.innerHTML = frm;
//       //frm += &nbsp;
  
//   var files = getHideAppendFile(MYPROFILE.account);
//   frm = "";

//   for (var i in files){
//     if(files[i]!="")
//       frm += '&nbsp;<a href="'+files[i]+'">첨부링크 클릭 '+i+'</a><br>'; 
//   }
//   document.getElementById("modalIPrivateInfoDetail").innerHTML = frm;
// }

/////////////////////////////

//   }

// }

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





    //사용자 메인 리스트에 보여줄 아이템
    function initUser(page) {

      var resList = new Array() ;

      userContainer = web3.eth.contract(userContainerAbi).at(userContainerContractAddress);
      userBasicInfo = web3.eth.contract(userMainAbi).at(userBasicInfoContractAddress);

      var data = userContainer.getAddr(1*page - 1, (1*page - 1) + 10);

      for(i=0;i<data.length;i++){

        var userbasic = userBasicInfo.getBasicInfo(data[i]);

        var item = new Object();
        item.picture = userbasic[0];
        item.name = userbasic[1];
        item.job = userbasic[2];
        item.company = userbasic[3];
        item.interestItems = userbasic[4];
        item.updateTime = userbasic[5];
        item.mvp = userbasic[6];


        var itemList = new Object() ;
        itemList.account = data[i] ;
        itemList.items = item;
        resList.push(itemList);
      }
      var jsonResult = JSON.stringify(resList);

      return jsonResult;
    }
    


    //사용자 디테일 프로필 조회
    function getDetailProfile (_addr){
      var resList = new Array() ;
      userProfileContract = web3.eth.contract(userProfileAbi).at(userProfileContractAddress);
      userFreeVisionContract = web3.eth.contract(userFreeVisionAbi).at(userFreevisionContractAddress);
      userHideInfoContract = web3.eth.contract(userHideInfoAbi).at(userHideInfoContractAddress);

      var item = new Object() ;
      var vision = userFreeVisionContract.getUserFreeVision(_addr);
      var hideInfo = userHideInfoContract.getUserHideInfo(_addr);

      var profileInfoItem = new Object();
      profileInfoItem.educationHistory = userProfileContract.getEducationHistoryInfo(_addr);
      profileInfoItem.careerHistory = userProfileContract.getCareerHistoryInfo(_addr);
      profileInfoItem.achievements = userProfileContract.getAchievementHistoryInfo(_addr);

      var hideInfoItem = new Object();
      hideInfoItem.hideInfoValue = hideInfo[0];
      hideInfoItem.estimateValue = hideInfo[1];
      hideInfoItem.openCount = hideInfo[2];
      hideInfoItem.hideInfoHint = userHideInfoContract.getUserHideInfoHint(_addr);


      item.profileInfo = profileInfoItem;
      item.freeVision = vision;
      item.hideInfo = hideInfoItem;
      var jsonResult = JSON.stringify(item);
      return jsonResult;
    }

    //관심 분야 리스트
    function getInterestItems(){

      var resList = new Array() ;

      interestContainer = web3.eth.contract(interestContainerAbi).at(interestContainerContractAddress);
      var data = interestContainer.getInterestItemList.call();

      for(i=0;i<data.length;i++){
        resList.push(hexToString(data[i].toString()));
      }

      return resList;
    }

     //Byte로 저장된 글자들
     function hexToString(hexx) {
      var hex = hexx.toString();//force conversion
      var str = '';
      for (var i = 0; (i < hex.length && hex.substr(i, 2) !== '00'); i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
      return str;
    }

    //나의 PM Token 잔액 확인
    function getPMCBalance(addr){
      pmcTokenContract = web3.eth.contract(pmcTokenAbi).at(pmTokenContractAddress);
      balance = pmcTokenContract.balanceOf(addr).toNumber();
      return balance;
    }



  //비공개 정보 보기위해 토큰 전달
  //value == COIN
  //_계좌 사용자
  //_계좌 스카우터
  //prikey : d816e5e0eab23dc5573968edaed1443787b03a5dddf4b82e48818ad3634a894a
  function sendPmcForOpenHideInfo(gas, value, _to, _from, priKey){
    
    //updateMyPMC();

    contractAddress = pmTokenContractAddress;
    pmcTokenContract = web3.eth.contract(pmcTokenAbi).at(contractAddress);
    
    var count = web3.eth.getTransactionCount(_from);
    const gasPriceHex = web3.toHex(gas*1000000000);

   	
    var sendItemData = pmcTokenContract.trasferOpenHideInfo.getData(_from,_to, value);

   	var estimateGasResult = web3.eth.estimateGas({
			"to": pmTokenContractAddress,
			"data" : sendItemData
	})


    gasLimitHex = web3.toHex(estimateGasResult);
    var rawTransaction = {
      "from": _from,
      "nonce": web3.toHex(count),
      "gasPrice": gasPriceHex,
      "gasLimit": gasLimitHex,
      "to": contractAddress,
      "value": "0x00",
      "data": sendItemData,
      "chainId": "0x03"
    };

    var privKey = new EthJS.Buffer.Buffer(priKey, 'hex');
    var tx = new EthJS.Tx(rawTransaction);

    tx.sign(privKey);
    var serializedTx = tx.serialize();

    web3.eth.sendRawTransaction('0x' + serializedTx.toString('hex'), function(err, hash) {
      if (!err){
        // 이걸 하고나서 팝업.
        // 성공이랑 관계가 없음.
        // HASH - 하나의 계약서 - 트랜잭션 
        // 해시 값..함수를 동적으로 생성해서 계속 쪼고있음
        // pending / success
          console.log(hash);
            //sendMessage(hash);
            alertify
            .alert("Your transaction is posted ! <br>But It takes some time (1~3 min) <br>CONTRACT : "+hash, function(){
              //alertify.success('Success');
              localStorage.setItem("PAID_"+_to, "PAID");
            });
          }else{
            console.log(err);
          }

        });

  }




  // UserTransaction : 0x4d0c0f53364847349635231a125efef573bd0e6c
  function getUserTransactionList(addr){
    userTxContract = web3.eth.contract(userTransactionAbi).at('0x4d0c0f53364847349635231a125efef573bd0e6c');
    data = userTxContract.getTransaction(addr);

    var resList = new Array() ;
    for(i = 0; i<data.length ;i++){
      txReceipt = web3.eth.getTransactionReceipt(data[i]);
      var item = new Object() ;
      item.tx = data[i] ;

      if(txReceipt.status == 0) item.status = "Pending";
      if(txReceipt.status == 1) item.status = "Success";
      resList.push(item);
    }

    var jsonResult = JSON.stringify(resList);

    return jsonResult;
  }

    //회사 메인 리스트에 보여줄 아이템
    function getCompanyMainList(){

      var resList = new Array() ;

      companyContainer = web3.eth.contract(companyContainerAbi).at(companyContainerContractAddress);
      companyMainInfo = web3.eth.contract(companyMainAbi).at(companyMainContractAddress);
      var data = companyContainer.getCompanyList.call();

      for(i=0;i<data.length;i++){
        
        var companyMainItem = companyMainInfo.getCompanyMainInfo(data[i]);

        var item = new Object() ;
        item.account = data[i] ;
        item.items = companyMainItem;

        resList.push(item);
      }

      var jsonResult = JSON.stringify(resList);

      return jsonResult;
    }

    function getCompanyDetailInfo(_addr){

      companyDetailContainer = web3.eth.contract(companyDetailAbi).at(companyDetailContractAddress);
      var data = companyDetailContainer.getCompanyDetailInfo(_addr);

      var item = new Object() ;
      item.employeeNum = data[0].toString();
      item.openDate = data[1];
      item.companyType = data[2];
      item.homepage = data[3];
      item.logoImg = data[4];
      item.feedImg = data[5];

      var recruits = new Array() ;
      for(i = 0; i< data[6].length;i++){

        var aaa = data[6][i];

        recruitContract = web3.eth.contract(recruitAbi).at(aaa);

        var bottom = recruitContract.getRecruitInfoUp();
        var up = recruitContract.getRecruitInfoUp();

        var recruitItem = new Object() ;
        recruitItem.title = up[0];
        recruitItem.interestCate = up[1];
        recruitItem.recruitType = up[2];
        recruitItem.minEducational = up[3];
        recruitItem.careerLimit = up[4];
        recruitItem.preferentialTreatment = up[5];
        recruitItem.workType = bottom[0];
        recruitItem.paymentIndex = bottom[1];
        recruitItem.posibleWorkLocation = bottom[2];
        recruitItem.startTime = bottom[3];
        recruitItem.endTime = bottom[4];
        recruitItem.decription = bottom[5];

        recruits.push(recruitItem);
      }

      item.recruitList = recruits;

      return item;


    }

    function getMyProfile(_addr){
    	var profileData = getDetailProfile(_addr);
    	var privateData = getHideAppendFile(_addr);
    	userBasicInfo = web3.eth.contract(userMainAbi).at(userBasicInfoContractAddress);
		var userbasic = userBasicInfo.getBasicInfo(_addr);
		
		var item = new Object() ;
		

		var basic = new Object();
        basic.picture = userbasic[0];
        basic.name = userbasic[1];
        basic.job = userbasic[2];
        basic.company = userbasic[3];
        basic.interestItems = userbasic[4];
        basic.updateTime = userbasic[5];
        basic.mvp = userbasic[6];

        item.basicInfo = basic;
		
		item.profileInfo = profileData;

		item.privateInfo = privateData;

		return item;
    }

    //비공개 첨부파일 가져오기
    function getHideAppendFile(_addr){
  //    companyDetailContainer = web3.eth.contract(userHideAppendInfoAbi).at(userHideAppendInfoContractAddress);
//      return companyDetailContainer.getUserHideAppendInfo(_addr);

      pmcTokenContract = web3.eth.contract(pmcTokenAbi).at(pmTokenContractAddress);
      return pmcTokenContract.getUserHideAppend(_addr);
    }



    //스카우터가 사용자 비공개 정보 보려고 할때 판단
    // 1. 사용자 허용리스트에 스카우터가 존재한다.
    // 2. 스카우터 오픈 리스트에 해당 사용자가 존재한다.
    // 3. 오픈기간 7일 이내의 접근이다.
    function getScouterAccessHideInfoYn(scouterAddr, userAddr){
        contractAddress = pmTokenContractAddress;
        pmcTokenContract = web3.eth.contract(pmcTokenAbi).at(contractAddress);
        var data = pmcTokenContract.getHideInfoOther(scouterAddr,userAddr);
        return data;
    }

    //스카우터가 자신이 구매한 사용자 계좌 정보
    function getScouterPurchaseAccountList(_addr){
        contractAddress = pmTokenContractAddress;
        pmcTokenContract = web3.eth.contract(pmcTokenAbi).at(contractAddress);
        var data = pmcTokenContract.getScouterOpenAddressList(_addr);
        return data;
    }




    //면접요청 리스트 확인
    function getRecruitRequestList(_addr, page){

		var resList = new Array() ;
    

      	recruitChkContract = web3.eth.contract(recruitChkAbi).at(recruitChkContractAddress);
      	pmcTokenContract = web3.eth.contract(pmcTokenAbi).at(pmTokenContractAddress);
      	companyMainInfo = web3.eth.contract(companyMainAbi).at(companyMainContractAddress);
      	userBasicInfo = web3.eth.contract(userMainAbi).at(userBasicInfoContractAddress);


      	var data = recruitChkContract.getMapping(_addr, 1*page - 1, (1*page - 1) + 10);

	      for(i = 0; i<data.length; i++){
			recruitAppointmentContract = web3.eth.contract(recruitAppointmentAbi).at(data[i]);
    		var item = new Object() ;
			var subData = recruitAppointmentContract.getRecruitInfo()
			
			item.recruitAddr = data[i] ;
			item.recruitReward = subData[0].toNumber() ;
	        item.scouterAddr = subData[1] ;
	        item.scouterName = userBasicInfo.getBasicInfo(subData[1])[1];
	        item.userAddr = subData[2] ;
	        item.userName = userBasicInfo.getBasicInfo(subData[2])[1];
	        item.meetingDate = subData[3] ;
	        item.meetingPlace = subData[4] ;
	        item.emergencyPhoneNumber = subData[5];
	        item.recruitStatus = subData[6];


	        var companyInfo = companyMainInfo.getCompanyMainInfo(pmcTokenContract.getScouterInfo(subData[1]));
	        var companyInfoItem = new Object() ;
	        companyInfoItem.url = companyInfo[0];
	        companyInfoItem.name = companyInfo[1];
	        companyInfoItem.category = companyInfo[2];

	        item.company = companyInfoItem;
			resList.push(item);
	      }

	       var jsonResult = JSON.stringify(resList);

	    return jsonResult;
    }


    //스카우터가 구직자에게 면접요청 (가스, 구직자, 스카우터, 면접비, 날짜 YYYYMMDD-24MISS, , 장소, 비상연락망)
    function requestRecruitUser(gas, _to, _from, priKey, _recruitReward,  _meetingDate,  _meetingPlace,  _emergencyPhoneNumber){

	    recruitChkContract = web3.eth.contract(recruitChkAbi).at(recruitChkContractAddress);
	    
	    var count = web3.eth.getTransactionCount(_from);
	    const gasPriceHex = web3.toHex(gas*1000000000);
	    
	    var sendItemData = recruitChkContract.makeRecruit.getData(_recruitReward, _from, _to,_meetingDate, _meetingPlace, _emergencyPhoneNumber);
	    var estimateGasResult = web3.eth.estimateGas({
			"to": recruitChkContractAddress,
			"data" : sendItemData
		})

	    gasLimitHex = web3.toHex(estimateGasResult);

	    var rawTransaction = {
	      "from": _from,
	      "nonce": web3.toHex(count),
	      "gasPrice": gasPriceHex,
	      "gasLimit": gasLimitHex,
	      "to": recruitChkContractAddress,
	      "value": "0x00",
	      "data": sendItemData,
	      "chainId": "0x03"
	    };

	    var privKey = new EthJS.Buffer.Buffer(priKey, 'hex');
	    var tx = new EthJS.Tx(rawTransaction);

	    tx.sign(privKey);
	    var serializedTx = tx.serialize();

	    web3.eth.sendRawTransaction('0x' + serializedTx.toString('hex'), function(err, hash) {
	      if (!err){
	        // 이걸 하고나서 팝업.
	        // 성공이랑 관계가 없음.
	        // HASH - 하나의 계약서 - 트랜잭션 
	        // 해시 값..함수를 동적으로 생성해서 계속 쪼고있음
	        // pending / success
	          console.log(hash);
              //sendMessage(hash);
              //updateMyPMC();
	            alertify
	            .alert("Your transaction is posted ! <br>But It takes some time (1~3 min) <br>CONTRACT : "+hash, function(){
	              //alertify.success('Success');
	              //localStorage.setItem("PAID_"+_to, "PAID");
	            });
	          }else{
	            console.log(err);
	          }

	        });
    }

    //가스 , 유재석, 최유정, 최유정개인키, 면접주소
    function assignRecruitRequest(gas, _to, _from, priKey, recruitAddr){
    	recruitAppointmentContract = web3.eth.contract(recruitAppointmentAbi).at(recruitAddr);
    	var sendItemData = recruitAppointmentContract.assignAppointment.getData(_to,_from);

    	sendTransaction(gas, _to, _from, priKey, sendItemData, recruitAddr);
    }

    
   function noticeJobInterviewResult(gas, scouter, user, res, priKey, recruitAddr){
    	recruitAppointmentContract = web3.eth.contract(recruitAppointmentAbi).at(recruitAddr);
    	var sendItemData = recruitAppointmentContract.setResultRecruit.getData(pmTokenContractAddress,scouter,user,res);

    	sendTransaction(gas, user, scouter, priKey, sendItemData, recruitAddr);
    }


    //함수 통일
    function sendTransaction(gas, _to, _from, priKey, sendItemData, Addr){
    	
    	var count = web3.eth.getTransactionCount(_from);
    	const gasPriceHex = web3.toHex(gas*1000000000);
    	 
	    var estimateGasResult = web3.eth.estimateGas({
			"to": Addr,
			"data" : sendItemData
		})

		gasLimitHex = web3.toHex(estimateGasResult);

	    var rawTransaction = {
	      "from": _from,
	      "nonce": web3.toHex(count),
	      "gasPrice": gasPriceHex,
	      "gasLimit": gasLimitHex,
	      "to": Addr,
	      "value": "0x00",
	      "data": sendItemData,
	      "chainId": "0x03"
	    };
	    var privKey = new EthJS.Buffer.Buffer(priKey, 'hex');
	    var tx = new EthJS.Tx(rawTransaction);

	    tx.sign(privKey);
	    var serializedTx = tx.serialize();

	    web3.eth.sendRawTransaction('0x' + serializedTx.toString('hex'), function(err, hash) {
	      if (!err){
	        // 이걸 하고나서 팝업.
	        // 성공이랑 관계가 없음.
	        // HASH - 하나의 계약서 - 트랜잭션 
	        // 해시 값..함수를 동적으로 생성해서 계속 쪼고있음
	        // pending / success
	          console.log(hash);
	            //sendMessage(hash);
	            alertify
	            .alert("Your transaction is posted ! <br>But It takes some time (1~3 min) <br>CONTRACT : "+hash, function(){
	              //alertify.success('Success');
	              //localStorage.setItem("PAID_"+_to, "PAID");
	            });
	          }else{
	            console.log(err);
	          }

	        });
    }

    //현재 로그인 해당 함수를 android에서 넘겨줌
    function setLoginInfo(priKey, account, id){
      MYACCOUNT = account;
      MYPRIVATEKEY = priKey;

      //setTimeout(function(){
        //This is for non-block
        profile = getMyProfile(MYACCOUNT);
        MYPROFILE.account = MYACCOUNT;
        MYPROFILE.priKey = priKey;
        MYPROFILE.picture = profile.basicInfo.picture;
        MYPROFILE.name = profile.basicInfo.name;
        MYPROFILE.interestItems = profile.basicInfo.interestItems;
        MYPROFILE.mvp = profile.basicInfo.mvp.c[0];
        tmp = profile.profileInfo.replace(/'/g, '"')
        MYPROFILE.peoplesDetail = JSON.parse(tmp);
      //},100);
    }

    function setINTERVIEWER(){
      setLoginInfo(HARD_CODED_SCOUTER_PRIVATEKEY,HARD_CODED_SCOUTER,"");
    }
    function setINTERVIEWEE(){
      setLoginInfo(HARD_CODED_ACCOUNT_PRIVATEKEY,HARD_CODED_ACCOUNT,"");
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

setInterval(function(){
  httpGetAsync("/getBlockChain",function(data){
    console.log("/getBlockChain");
    dt=JSON.parse(data);
    for (var i in dt.data){
      dt.data[i].pubkey=JSON.parse(dt.data[i].pubkey) 
    }
    BLOCKS=dt.data;
    drawPeople();
  })
},3000);

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
      //  addJumbotronToMain("휴지", "Security 전문가입니다.", "http://cfile5.uf.tistory.com/image/99E8E33359DB49394B6E66","http://blog.securekim.com","PEOPLE");
    }
  }
}

function CNtoIMAGE(CN){
  //todo
  //if CN == mobile -> imageURL
  
  return "images/"+CN+".png";
}


function addJumbotronToMain(name, context, imageURL, number, type){
  
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
    td1.style = "padding:20px";
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
    document.getElementById('load_'+number).innerHTML = '<div class="lds-grid"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>';
  
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