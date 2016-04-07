// <div id="seasonDiv_2"><div class="season-analysis">
// 	<div class="info">ciao ciao ciao</div>
// 	<h1></h1>
// 	<h2></h2>
// 	<!--<div class="match-chart"></div>-->
// 	<div class="matches clearfix"></div>
// </div></div>
//var svg = d3.select("#"+options.seasonContainer+" .matches").append("svg")


import seasonHTML from './templates/season.html!text'
import Tooltip from './Tooltip'

		export default function seasonChart(d3, options, margin) {

				var width = 300, height;
				
				var data = options.arr;				

				var widthUnit = width/options.maxValMatches;//(Math.floor(width/options.maxValMatches))

				var draggerW = 30;
			    var toolW = 120;
			    var toolH = 36;
			    var arrowOffset = 0;

				width = (options.maxValMatches * widthUnit);

				height = 120;//((options.maxValGoals*2)*widthUnit)

				var container=d3.select(options.container)
					.append("div")
					.attr("id", options.seasonContainer)
					.attr("class", "season-container")
					.html(seasonHTML);    

				d3.select("#"+options.seasonContainer+" .info").html(data[0].season.split("_").join("-")); // set the season as title	

				var x = d3.scale.linear()
				    .range([0, width]);

				var y = d3.scale.linear()
				    .range([height, 0]);

				var xAxis = d3.svg.axis()
				    .scale(x)
				    .orient("bottom");

				var yAxis = d3.svg.axis()
				    .scale(y)
				    .orient("left")
				    .tickSize(width)
				    .tickFormat('');

				var lineTop = d3.svg.line().interpolate("basis")
				    .x(function(d,i) { return x(i); })
				    .y(function(d) { return y(d.For); });

				var lineBottom = d3.svg.line().interpolate("basis")
				    .x(function(d,i) { return x(i); })
				    .y(function(d) { return y(d.Against *-1); });        

				var areaTop = d3.svg.area().interpolate("basis")
				    .x(function(d,i) { return x(i); })
				    .y0(height/2)
				    .y1(function(d) { return y(d.For); });

				var areaBottom = d3.svg.area().interpolate("basis")
				    .x(function(d,i) { return x(i); })
				    .y0(height/2)
				    .y1(function(d) { return y(d.Against * -1); });    

				var svg = d3.select("#"+options.seasonContainer+" .matches").append("svg")
				    .attr("width", width + margin.left + margin.right)
				    .attr("height", height + margin.top + margin.bottom)
				  .append("g")
				    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

				  x.domain([0 , options.maxValMatches]); 
				  y.domain([options.maxValGoals *-1, options.maxValGoals ]);

 				var gy = svg.append("g")
				  		.attr("y", 2)
					    .attr("class", "y axis")
					    .attr("transform", "translate("+ width +", 0)")
					    .call(yAxis);

				var drag = d3.behavior.drag()
					    //.origin(function(d) { return d; })
					    .on("dragstart", dragstarted)
					    .on("drag", dragged)
					    .on("dragend", dragended);
				    	    
					gy.selectAll("g").filter(function(d) { return d; })
					    .classed("minor", true);

					svg.append("path")
					      .datum(options.arr)
					      .attr("class", "area-line")
					      .attr("d", lineTop); 	

					svg.append("path")
					      .datum(options.arr)
					      .attr("class", "area-top")
					      .attr("d", areaTop );

					svg.append("path")
					      .datum(options.arr)
					      .attr("class", "area-line")
					      .attr("d", lineBottom); 	    

				    svg.append("path")
					      .datum(options.arr)
					      .attr("class", "area-bottom")
					      .attr("d", areaBottom ); 

					svg.append("rect")
				    	.attr("class", "svg-overlay")
			              .style("fill", "rgba(230,230,230,0.25)")
			              .attr("width", (data.length-1) * widthUnit)
			              .attr("height", height)
					      .attr("x", 0)
					      .attr("y", function() { return 0; })
			            .on("mousemove", mousemove)	
			            .on("mouseleave", mouseleave)       

				    var dragger = svg.append("rect")
				    	.attr("class", "svg-overlay")
			              .attr("id", "svgOverlay")
			              .style("fill", "rgba(230,230,230,0.5)")
			              .attr("width", 30)
			              .attr("height", height)
					      .attr("x", function() { return (draggerW/2)*-1; })
					      .attr("y", function() { return 0; })
			            .call(drag);


			         //      .on("mousemove", mousemove)	
			         // .on("mouseleave", mouseleave)   

			    var focus = svg.append("g")
			              .attr("class", "focus");
		            
			          	focus.append("line")
			              .attr("y1", 0)
			              .attr("y2", height)
			              .attr("class","focus-line");

			            focus.append("circle")
			           		.attr("r", 5)
	          				.attr("transform", "translate( 0 , 0 )");	

			             

				var el = document.getElementById(options.seasonContainer);
				var focusEl = el.getElementsByClassName("focus")[0];
			    var arseEl = el.getElementsByClassName("area-top")[0];
			    var nonArseEl = el.getElementsByClassName("area-bottom")[0];
			    var minDrag = (draggerW/2) *-1;
			    var maxDrag = ((data.length-1)* widthUnit) - (draggerW/2);
			    

				var tooltipPartnership = new Tooltip({ container: el, margins:margin, width:toolW, height:toolH, title: false, indicators:[
                            {
                              title:"Leader",
                              id:"govLeader"
                            },
                            {
                              title:"Party",
                              id:"govParty"
                            }
                    ] })  

				function dragstarted(d) {
				  d3.event.sourceEvent.stopPropagation();
				  d3.select(this).classed("dragging", true);
				  nonArseEl.classList.add("non-arse-highlight");
			      arseEl.classList.add("arse-highlight");
				}

				function dragged(d) {

					var xPos = d3.mouse(this)[0];
					var yPos = 0;
					var d = Math.round(x.invert(xPos));
			        var obj = data[d];
			        var toolPos;
			        var tempEl = d3.select(this);

					if (xPos > minDrag && xPos < maxDrag) { 
						toolPos = xPos - arrowOffset;
						d3.select(this).attr("x", xPos) ;
						focus.select("g").attr("transform", "translate( "+ d +" , 0 )");
				        focus.select("circle").attr("transform", "translate( "+ (xPos+(draggerW/2)) +", "+ height/2 +" )");
				        focus.select("line").attr("transform", "translate( "+ (xPos+(draggerW/2)) +" 0 )");
				        focus.style("display","block");

					};

					
			        
			        if(toolPos > (maxDrag-toolW+(draggerW/2) )){
			        	toolPos = (maxDrag-toolW+(draggerW/2));
			        }  

				    tooltipPartnership.show(obj, toolPos, 0);
				}

				function dragended(d) {
					d3.select(this).classed("dragging", false);
					nonArseEl.classList.remove("non-arse-highlight");
					arseEl.classList.remove("arse-highlight");
				}

			
		 		function mousemove() {  
			          stopPropagation();
			          
					  var xPos = d3.mouse(this)[0];
					  var yPos = (height*2)*-1;

			          var d = Math.round(x.invert(xPos));
			          var obj = data[d];
			          var toolPos;
					  			          
			          if (xPos > minDrag && xPos < maxDrag) { 
						toolPos = xPos - arrowOffset;
						dragger.attr("x", xPos) ;
						focus.select("g").attr("transform", "translate( "+ d +" , 0 )");
				        focus.select("circle").attr("transform", "translate( "+ (xPos+(draggerW/2)) +", "+ height/2 +" )");
				        focus.select("line").attr("transform", "translate( "+ (xPos+(draggerW/2)) +" 0 )");
				        focus.style("display","block");

					};
			        
			        if(toolPos > (maxDrag-toolW+(draggerW/2) )){
			        	toolPos = (maxDrag-toolW+(draggerW/2));
			        } 
			        
			          svg.selectAll(".x.axis path").style("fill-opacity", Math.random()); // XXX Chrome redraw bug

			          tooltipPartnership.show(obj, toolPos, 0);
					  nonArseEl.classList.add("non-arse-highlight");
			          arseEl.classList.add("arse-highlight");
			          dragger.select("rect").attr("x", xPos);

			        }

			     function mouseleave(){
		              		tooltipPartnership.hide();
		              		focus.style("display","none");
		              		arseEl.classList.remove("arse-highlight");
			          		nonArseEl.classList.remove("non-arse-highlight");
		            }    

			   //var offsets = data.map(function(t, i) { return [Date.UTC(t.date.getFullYear(), t.date.getMonth(), t.date.getDate()), t.lrCount, t]; });     

			   var stopPropagation = function() {
			        d3.event.stopPropagation();
			      }

			    

		}
