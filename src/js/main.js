import reqwest from 'reqwest'
import mainHTML from './text/main.html!text'
import dropdownHTML from './text/dropdown.html!text'
import share from './lib/share'
import lodash from 'lodash';
import d3 from 'd3';

var _ = lodash;

var shareFn = share('Interactive title', 'http://gu.com/p/URL', '#Interactive');
var allTransfers;
var starTransfers;
var sellArr=[];
var buyArr=[];
var unsortedArr=[];
var sortedArr=[];

var premClubs= [ {name:'Arsenal', hex:'#000000'},{ name:'Aston Villa', hex:'#00001D'},{ name:'Bournemouth',hex:'#001E43'},{ name:'Chelsea',hex:'#00456E'},{ name:'Crystal Palace',hex:'#41709D'},{ name:'Everton',hex:'#739ECE'},{ name:'Leicester City',hex:'#000232'},{ name:'Liverpool',hex:'#003C51'},{ name:'Manchester City',hex:'#a4cfff'},{ name:'Manchester United',hex:'#1c4c00'},{ name:'Newcastle United',hex:'#4BC6DF'},{ name:'Norwich City',hex:'#00677E'},{ name:'Stoke City', hex:'#062300'},{ name:'Southampton',hex:'#658299'},{ name:'Sunderland',hex:'#002519'},{ name:'Swansea City',hex:'#004D3F'},{ name:'Tottenham Hotspur',hex:'#377A6A'},{ name:'West Bromwich Albion',hex:'#66A998'},{ name:'Watford', hex:'#96DBC9' },{ name:'West Ham United', hex:'#41709D' }];

export function init(el, context, config, mediator) {
    el.innerHTML = mainHTML.replace(/%assetPath%/g, config.assetPath);

    reqwest({
        url: 'https://interactive.guim.co.uk/docsdata/1oHfE7wk0FYbbMPnbqvTNYOyLJij8WBOFl5MXa5kpa_A.json',
        type: 'json',
        crossOrigin: true,
        //success: console.log(resp)
         success: (resp) => dataInit(resp) //injectTreeMapHTML
    });

    [].slice.apply(el.querySelectorAll('.interactive-share')).forEach(shareEl => {
        var network = shareEl.getAttribute('data-network');
        shareEl.addEventListener('click',() => shareFn(network));
    });
}

function dataInit(resp){
    allTransfers = resp.sheets.Data;
    starTransfers = resp.sheets.Star_Men;

    allTransfers = _.uniqBy(allTransfers, 'playername'); //clean up data

    modelTransfersData();
}

function modelTransfersData(){
    
    _.forEach(allTransfers, function(item){
        item.fee = checkForNumber(item.price)
        item.ageGroup = getAgeGroup(item)
        buySellSort(item)
    })

    filterArr('ageGroup');

    initView()
   // console.log(buyArr.length, sellArr.length, unsortedArr.length, unsortedArr)
}

function initView(){
    var dropDownEl = document.getElementById('dropDownHolder');
    dropDownEl.innerHTML =  dropdownHTML;
    addListeners();
}

function addListeners(){

  var interactiveContainer = document.getElementById("interactiveContainer");
       
  //window.addEventListener("resize", checkWin);
 
  document.getElementById("filterDropdown").addEventListener('change', filterChanged);

}


function filterChanged(event) {
  //document.getElementById("detailView").style.display="none";
   // $('#treemap-view').css('height', 'auto');

    var varIn = this.value;
    filterArr(varIn);
}

var filterArr = function (s){
   var tempBuy;
   var tempSell; 

   if (s=='club'){
        tempBuy = _.groupBy(buyArr, 'to');
        tempSell = _.groupBy(sellArr, 'from');
   } else if (s=='league'){
        tempBuy = _.groupBy(buyArr, 'newleague');
        tempSell = _.groupBy(sellArr, 'previousleague');
   }else {
        tempBuy = _.groupBy(buyArr, s);
        tempSell = _.groupBy(sellArr, s);
   }
    tempSell = getTotalFee(tempSell);
    console.log("look at moving this data into treemap data (json?????????????) - may need to convert to object with a name at top level plus a subitem containing entries",s,tempSell);
}


function getTotalFee(a){
    var totalFee=0;
    _.forEach(a, function(objects){
       objects.subtotalFee = _.sumBy(objects, function(o) { return o.fee; });
       totalFee+=objects.subtotalFee
    })

    a.totalFees = totalFee;

    return a; 
}


function buySellSort(item){
    item.sorted = false;
    
    _.forEach(premClubs, function(premClub){    
        if(item.to == premClub.name){ item.sorted = true; buyArr.push(item); }
        if(item.from == premClub.name){ item.sorted = true; sellArr.push(item); }

    })
    if(item.sorted == false){ unsortedArr.push(item); }
}

function getAgeGroup(item){
      var ageGroup;
      var ageIn = parseInt(item.age);
         if (ageIn < 20){ ageGroup = "19 years and younger" }
         else if(ageIn >= 19 && ageIn <= 25){ ageGroup = "20-25 years old" }  
         else if(ageIn >= 26 && ageIn <= 30){ ageGroup = "26-30 years old" } 
         if (ageIn > 30){ ageGroup = "31 years and over" }
      return ageGroup;
}

function checkForNumber(numIn){
    isNaN(numIn) ? numIn = 0 : numIn = numIn;
    numIn = Number(numIn);
    return numIn;
}