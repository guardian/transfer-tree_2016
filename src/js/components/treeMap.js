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

export default function treeMap(dataJSON){

	var height

	console.log(dataJSON)

      document.getElementById("treemapFlex").innerHTML = "";
          
                      var margin = {top: 36, right: 0, bottom: 0, left: 0},
                          width = d3.select("#treemapFlex").node().getBoundingClientRect().width,
                          height = Math.round((width/16)*9),
                          formatNumber = d3.format(",d"),
                          transitioning;

                      var x = d3.scale.linear()
                          .domain([0, width])
                          .range([0, width]);

                      var y = d3.scale.linear()
                          .domain([0, height])
                          .range([0, height]);

                      var svg = d3.select("#treemapFlex").append("svg")
                          .attr("width", width + margin.left + margin.right)
                          .attr("height", height + margin.bottom + margin.top)
                          .style("margin-left", -margin.left + "px")
                          .style("margin.right", -margin.right + "px")
                        .append("g")
                          .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                          .style("shape-rendering", "crispEdges");

                      var treemap = d3.layout.treemap() 
                          .ratio(1)
                          .sticky(false)
                          .mode("squarify")
                          .round(false)
                          .sort(function(a, b) { return a.value - b.value; })
                          .children(function(d, depth) { return depth ? null : d._children; })

                      var grandparent = svg.append("g")
                          .attr("class", "grandparent");

                      grandparent.append("rect")
                          .attr("y", 0-margin.top)
                          .attr("width", width)
                          .attr("height", margin.top)

                    var grandParentButtonGroup = grandparent.append("g")    
                          .attr("id","grandParentButton")
                          .style("display","none")
                          .attr("x", 0)
                          .attr("y",-36)  

                       grandParentButtonGroup.append("rect")
                          .attr("x", 0)
                          .attr("y", -36) 
                          .attr("width", "120px")
                          .attr("height", "24px")
                          .attr("class","back-button")
                          .attr("rx", "12px")
                          .attr("ry", "12px");   

                      grandParentButtonGroup.append("text")
                          .attr("x", 24)
                          .attr("y", -30)
                          .attr("id","grandParentButtonLabel")
                          .text("show all")
                          .attr("class", "cellLabel")
                          .attr("dy", ".75em");  

                      var instructionTextGroup = grandparent.append("g")  
                          .attr("id","instructionText")
                          .style("display","block")
                          .attr("x", 0)
                          .attr("y",-36) 

                      instructionTextGroup.append("text")
                          .attr("x", 0)
                          .attr("y", -30)
                          .attr("id","instructionTextLabel")
                          .text("click on a club to see all their signings")
                          .attr("class", "treemapText")
                          .attr("dy", ".75em"); 

                          // var g1 = svg.insert("g", ".grandparent")
                          // <svg width="24px" height="22px" viewBox="0 0 24 22" id="svgArrow"><path fill="#CC0000" d="M0.62,10.49l1.44-1.44l9-8.989l0.97,0.969L4.521,10h19.12v2 l-19.12-0.001l7.51,8.971l-0.97,0.97l-9-9l-1.44-1.431V10.49"/></svg>    

                      d3.xml("../assets/imgs/arrow-left.svg", "image/svg+xml", function(error, xml) {
                              if (error) throw error;
                              var importedNode = document.importNode(xml.documentElement, true);

                              document.getElementById("grandParentButton").appendChild(importedNode);
                              
                      });    

                      d3.json(dataJSON, function() {
                        var root, node;
                        node = root = dataJSON;
                        initialize(root);
                        accumulate(root);
                        layout(root);
                        display(root);

                        function initialize(root) {
                          console.log(root);
                          root.x = root.y = 0;
                          root.dx = width;
                          root.dy = height;
                          root.depth = 0;
                        }

                        // Aggregate the values for internal nodes. This is normally done by the
                        // treemap layout, but not here because of our custom implementation.
                        // We also take a snapshot of the original children (_children) to avoid
                        // the children being overwritten when when layout is computed.
                        function accumulate(d) {
                          return (d._children = d.children)
                              ? d.value = d.children.reduce(function(p, v) { return p + accumulate(v); }, 0)
                              : d.value;
                        }

                        // Compute the treemap layout recursively such that each group of siblings
                        // uses the same size (1×1) rather than the dimensions of the parent cell.
                        // This optimizes the layout for the current zoom state. Note that a wrapper
                        // object is created for the parent node for each group of siblings so that
                        // the parent’s dimensions are not discarded as we recurse. Since each group
                        // of sibling was laid out in 1×1, we must rescale to fit using absolute
                        // coordinates. This lets us use a viewport to zoom.
                        function layout(d) {
                          if (d._children) {

                            treemap.nodes({_children: d._children});
                            d._children.forEach(function(c) {
                              c.x = d.x + c.x * d.dx;
                              c.y = d.y + c.y * d.dy;
                              c.dx *= d.dx;
                              c.dy *= d.dy;
                              c.parent = d;
                              layout(c);
                            });
                          }
                        }

                        function display(d) {
                          
                          grandparent
                              .datum(d.parent)
                              .on("click", transition)

                          var g1 = svg.insert("g", ".grandparent")
                              .datum(d)
                              .attr("class", "depth");

                          var g = g1.selectAll("g")
                              .data(d._children)
                              .enter().append("g");

                          g.filter(function(d) { return d._children; })
                              .classed("children", true)
                              .on("click", transition);

                          g.selectAll(".child")
                              .data(function(d) { return d._children || [d]; })
                            .enter().append("rect")
                              .attr("class", "child ")
                              .attr("class", function(d) { return "child "+(d.buySell); })
                              .style("fill", function(d){return d.tintColor})
                              .style("stroke-width","1px")
                              .style("stroke", function(d){return d.tintColor})
                              
                              .call(rect);

                          g.append("rect")
                              .style("fill", function(d){return d.tintColor})
                              .attr("class", function(d) { return "parent "+(d.buySell); })
                              .call(rect)
                            // .append("title")
                        //   .text(function(d) { return formatNumber(d.name); });

                          g.append("text")
                              .attr("dy", ".75em")
                              .text(function(d) { return d.name; })
                              .attr("class", "cellLabel")
                              .call(text);

                           g.append("text")
                              .attr("dy", "1.3em")
                              .text(function(d) { var t =  myRound(d.buyCost); if(t==0){ t=" "}; return t;})
                              .attr("class", "cellLabelFee")
                              .call(text);


                          function displayFeeCheck(n){
                            var t = n;
                                if(t<0.5){ t = " "}
                            return t;
                          }

                          function transition(d) {
                            
                            if (transitioning || !d) return;
                            transitioning = true;

                            var g2 = display(d),
                                t1 = g1.transition().duration(750),
                                t2 = g2.transition().duration(750);

                            // Update the domain only after entering new elements.
                            x.domain([d.x, d.x + d.dx]);
                            y.domain([d.y, d.y + d.dy]);

                            // Enable anti-aliasing during the transition.
                            svg.style("shape-rendering", null);

                            // Draw child nodes on top of parent nodes.
                            svg.selectAll(".depth").sort(function(a, b) { return a.depth - b.depth; });

                            // Fade-in entering text.
                            g2.selectAll("text").style("fill-opacity", 0);

                            // Transition to the new view.
                            t1.selectAll("text").call(text).style("fill-opacity", 0);
                            t2.selectAll("text").call(text).style("fill-opacity", 1);
                            t1.selectAll("rect").call(rect);
                            t2.selectAll("rect").call(rect);

                            // Remove the old node when the transition is finished.
                            t1.remove().each("end", function() {
                              svg.style("shape-rendering", "crispEdges");
                              transitioning = false;
                            });
                            
                            setTreeMapDetails(d);
                          }

                          return g;
                        }

                        function text(text) {
                          text.attr("x", function(d) { return x(d.x) + 6; })
                              .attr("y", function(d) { return y(d.y) + 6; });
                        }

                        function rect(rect) {
                          rect.attr("x", function(d) { return x(d.x); })
                              .attr("y", function(d) { return y(d.y); })
                              .attr("width", function(d) { return x(d.x + d.dx) - x(d.x); })
                              .attr("height", function(d) { return y(d.y + d.dy) - y(d.y); });
                        }

                        function name(d) {
                          return d.parent
                              ? name(d.parent) + "." + d.name
                              : d.name;
                        }
                      });

}

				

			    

