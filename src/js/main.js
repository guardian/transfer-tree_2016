import reqwest from 'reqwest'
import mainHTML from './text/main.html!text'
import dropdownHTML from './text/dropdown.html!text'
import share from './lib/share'

import treeMap from './components/treeMap';
import lodash from 'lodash';
import d3 from 'd3';

var _ = lodash;

var shareFn = share('Interactive title', 'http://gu.com/p/URL', '#Interactive');
var allTransfers;
var premOnlyArr=[];
var starTransfers;
var sellArr=[];
var buyArr=[];
var unsortedArr=[];
var sortedArr=[];
var treeMapChart;

var premClubs= [ {name:'Arsenal', hex:'#000000'},{ name:'Aston Villa', hex:'#00001D'},{ name:'Bournemouth',hex:'#001E43'},{ name:'Chelsea',hex:'#00456E'},{ name:'Crystal Palace',hex:'#41709D'},{ name:'Everton',hex:'#739ECE'},{ name:'Leicester City',hex:'#000232'},{ name:'Liverpool',hex:'#003C51'},{ name:'Manchester City',hex:'#a4cfff'},{ name:'Manchester United',hex:'#1c4c00'},{ name:'Newcastle United',hex:'#4BC6DF'},{ name:'Norwich City',hex:'#00677E'},{ name:'Stoke City', hex:'#062300'},{ name:'Southampton',hex:'#658299'},{ name:'Sunderland',hex:'#002519'},{ name:'Swansea City',hex:'#004D3F'},{ name:'Tottenham Hotspur',hex:'#377A6A'},{ name:'West Bromwich Albion',hex:'#66A998'},{ name:'Watford', hex:'#96DBC9' },{ name:'West Ham United', hex:'#41709D' }];

export function init(el, context, config, mediator) {
    el.innerHTML = mainHTML.replace(/%assetPath%/g, config.assetPath);

    reqwest({
        url: 'https://interactive.guim.co.uk/docsdata/1oHfE7wk0FYbbMPnbqvTNYOyLJij8WBOFl5MXa5kpa_A.json',
        type: 'json',
        crossOrigin: true,
         success: (resp) => dataInit(resp)
    });

    [].slice.apply(el.querySelectorAll('.interactive-share')).forEach(shareEl => {
        var network = shareEl.getAttribute('data-network');
        shareEl.addEventListener('click',() => shareFn(network));
    });
}

function dataInit(resp){
    allTransfers = resp.sheets.Data;
    starTransfers = resp.sheets.Star_Men;
    allTransfers = _.uniqBy(allTransfers, 'playername'); //clean up data - remove duplicates

    modelTransfersData();
}

function modelTransfersData(){
    
    _.forEach(allTransfers, function(item){
        item.fee = checkForNumber(item.price);
        item.treeSize = checkForNumber(item.price) + 1000000; // add 1,000,000 so zero values show in treemap
        item.ageGroup = getAgeGroup(item);
        item.premBuy = false;
        item.premSell = false;
        buySellSort(item);
    })

   initView()
}


function buySellSort(item){
    //handle entries bought by prem club
    _.forEach(premClubs, function(premClub){    
        if(item.to == premClub.name)
          { 
            
            item.premBuy = true;
            item.premClub = item.to;
             
          }  
    })

    //handle entries sold by prem club
    _.forEach(premClubs, function(premClub){    
        if(item.from == premClub.name)
          {             
             item.premSell = true; 
             item.premClub = item.from;  
          }
    })

    //handle entries bought by prem club and sold by prem club
    if(item.premBuy && item.premSell){ 
        var newObj = {} // declare a new object - duplicating item hasn't worked!!!!!
        newObj.playername=item.playername;
        newObj.age=item.age;
        newObj.ageGroup=item.ageGroup;
        newObj.fee = item.fee;
        newObj.treeSize = item.treeSize;
        newObj.from = item.from;
        newObj.nationality=item.nationality;
        newObj.newleague=item.newleague;
        newObj.position=item.position;
        newObj.premBuy=true;
        newObj.premSell=true;
        newObj.previousleague=item.previousleague;
        newObj.price=item.price;
        newObj.to=item.to;
        newObj.premClub = item.to; //toggle premClub value
        allTransfers.push(newObj); //push newObj to bucket array
    }  
}


function initView(){
    var dropDownEl = document.getElementById('dropDownHolder');
    dropDownEl.innerHTML =  dropdownHTML;
    addListeners();
}

function addListeners(){
//window.addEventListener("resize", checkWin);
  var interactiveContainer = document.getElementById("interactiveContainer");
  document.getElementById("filterDropdown").addEventListener('change', filterChanged);

}


function filterChanged(event) {
  //document.getElementById("detailView").style.display="none";
   // $('#treemap-view').css('height', 'auto');
    var varIn = this.value;
    filterArr(varIn);
}

var filterArr = function (s){
  var f; //f stands for filtered
    if (s=='club'){ 
      s ='premClub' 
    }
  
  f = nestChildren(allTransfers,s);

  treeMapChart = new treeMap(f);
}


function nestChildren(data,k){

  var root = {};
  var children = []
  root.name='root';

 
  var dataChildren = d3.nest()
        .key(function(d) {  return d[k]; }) //console.log(d);
            .rollup(function(values) {
              return {
                totalFee: Math.round(d3.sum(values, function(d) { return d.fee })),
                size: (function(d) { return d.treeSize }),
                values : values
              };
            })
       .entries(data);  

        // .map(data);

        //.key(function(d) {  return d.playername; })

        

        // _.forEach(dataChildren, function(child){ 
        //   //child.name = child.name
        //   //child.children = obj;
        //   //child.totalFee = _.sumBy(child.values, 'fee');
        //   //children.push(jObj);
        // })



        //root = JSON.stringify(root);
        //console.log(root);



  root._children = dataChildren;

  root.children = dataChildren;

  root.values = dataChildren;


  console.log(root)

  return(root)



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