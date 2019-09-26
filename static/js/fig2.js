
sectorList = ["All", "Communication Services", "Consumer Discretionary", "Consumer Staples", "Energy", "Financials", "Health Care", "Industrials", "Information Technology", "Materials", "Real Estate", "Utilities"]                 

makeResponsive();

var chartGroup = d3.select(".chartGroup")
chartGroup.append("text")
            .attr("transform", 'translate(600, 30)')
            .attr("font-size", '40px')
            .attr('text-anchor', 'middle')
            .html('Quintile vs. Selection Criteria')
var homeButton = d3.select("#fig2").append("div")
                    .append("button").html("Home").attr("id", "homeButton")
d3.select("#homeButton").on("click",function(){
    location.href = "/"
})
var visualButton = d3.select("#fig2").append("div")
                    .append("button").html("Visuals").attr("id", "visualButton")
d3.select("#visualButton").on("click",function(){
    location.href = "/#page2"
})

var svg    = chartGroup.call(d3.drag().on('drag', dragged).on('start', dragStart).on('end', dragEnd)).append('g'); 
var cubesGroup = svg.append('g').attr('class', 'cubes');

var origin = [600, 500], scale = 16, j = 10, cubesData = [], alpha = 0, beta = 0, startAngle = Math.PI/6;
var caption = ['Price/Earnings','Price/Book','E-Value/Sales', 'E-Value/EBIT','Debt-Cap','Mkt-Cap']

var color  =  d3.scaleSequential(d3.interpolateGreens)
var colorm = d3.scaleSequential(d3.interpolateReds)

var mx, my, mouseX, mouseY;
var cubes3D = d3._3d()
    .shape('CUBE')
    .x(function(d){ return d.x; })
    .y(function(d){ return d.y; })
    .z(function(d){ return d.z; })
    .rotateY( startAngle)
    .rotateX( - startAngle)
    .origin(origin)
    .scale(scale);

var yScale3d = d3._3d()
    .shape('LINE_STRIP')
    .origin(origin)
    .rotateY( startAngle)
    .rotateX(-startAngle)
    .scale(scale);

var xScale3d = d3._3d()
    .shape('LINE_STRIP')
    .origin(origin)
    .rotateY( startAngle)
    .rotateX(-startAngle)
    .scale(scale);

var zScale3d = d3._3d()
    .shape('LINE_STRIP')
    .origin(origin)
    .rotateY( startAngle)
    .rotateX(-startAngle)
    .scale(scale);

sector = "All"
path = "ThreeDee/"+ sector
d3.json(path, function(json_data){
    init(json_data)
})    

d3.select("#sectors").selectAll("button").on("click", function(){
    var value_sec = d3.select(this).attr("value")
        if (value_sec!= sector){
            sector = value_sec  
            d3.select("#fig2sectorButton>button").html((sector == "All")? ("Sector: " + sector+ " sectors") : ("Sector: " +sector))
            d3.select("#sectors").selectAll("button")
                .classed("inactive", true)
                .classed("active",false)
            d3.select(this)
                .classed('active', true)
                .classed("inactive", false)
            
            path = "ThreeDee/"+ sector
            d3.json(path, function(data){
                init(data)
            })    
    }
})



function processData(data, tt){
   
    var minmax_data = data[0].map(d => -d.height)
    var min = d3.min(minmax_data)
    var max = d3.max(minmax_data)
    /* --------- CUBES ---------*/
   
    var cubes = cubesGroup.selectAll('g.cube').data(data[0], function(d){ return d.height });
    var ce = cubes
        .enter()
        .append('g')
        .attr('class', 'cube')
        .attr('fill', function(d){
            var c = parseInt(Math.abs(d.height)-min)/(max - min);
            if (d.height < 0){ return d3.color(color(c)) }
            else{ return d3.color(colorm(c))}
        })
        .attr('stroke', function(d){ 
            c = parseInt(Math.abs(d.height)-min)/(max - min);
            return d3.color(color(c)).darker(2)
        })
        .merge(cubes)

    cubes.exit().remove();

    /* --------- FACES ---------*/

    var faces = cubes.merge(ce).selectAll('path.face').data(function(d){ return d.faces; }, function(d){ return d.face; });

    faces.enter()
        .append('path')
        .attr('class', 'face')
        .attr('fill-opacity', 1)
        .classed('_3d', true)
        .merge(faces)
        .transition().duration(tt)
        .attr('d', cubes3D.draw);

    faces.exit().remove();

    /* --------- TEXT ---------*/

    var texts = cubes.merge(ce).selectAll('text.text').data(function(d){
        var _t = d.faces.filter(function(d){
            return d.face =='top'  
        });
        return [{height: d.height, centroid: _t[0].centroid}];
    });

    texts
        .enter()
        .append('text')
        .attr('class', 'text')
        .attr('dy', "-0.7em")
        .attr('text-anchor', 'middle')
        .attr('font-family', 'sans-serif')
        .attr('font-weight', 'bolder')
        .attr('x', function(d){ return origin[0] + scale * d.centroid.x })
        .attr('y', function(d){ return origin[1] + scale * d.centroid.y })
        .classed('_3d', true)
        .merge(texts)
        .transition().duration(tt)
        .attr('fill', 'black')
        .attr('stroke', 'none')
        .attr('x', function(d){ return origin[0] + scale * d.centroid.x })
        .attr('y', function(d){ return origin[1] + scale * d.centroid.y })
        .tween('text', function(d){
            var that = d3.select(this);

            var i = d3.interpolateNumber(+that.text(), -d.height);
            return function(t){
                that.text(i(t).toFixed(2));
            };
        });

    texts.exit().remove();

    /* ----------- x-Scale ----------- */

    var xScale = svg.selectAll('path.xScale').data(data[2]);

    xScale
        .enter()
        .append('path')
        .attr('class', '_3d xScale')
        .merge(xScale)
        .attr('stroke', 'black')
        .attr('stroke-width',0.5)
        .attr('d', xScale3d.draw);

    xScale.exit().remove();

     /* ----------- x-Scale Text ----------- */

    var xText = svg.selectAll('text.xText').data(data[2][0]);

    xText
        .enter()
        .append('text')
        .attr('class', '_3d xText')
        .attr('text-anchor','middle')
        .attr('font-weight', 'bolder')
        .merge(xText)
        .each(function(d){
                d.centroid = {x: d.rotated.x, y: d.rotated.y, z: d.rotated.z}
        })
        .attr('x', function(d){ return d.projected.x; })
        .attr('y', function(d){ return d.projected.y; })
        .text(function(d){ return caption[d[2]/5 + 3] });

    xText.exit().remove();

    /* ----------- z-Scale ----------- */

    var zScale = svg.selectAll('path.zScale').data(data[3]);

    zScale
        .enter()
        .append('path')
        .attr('class', '_3d xScale')
        .merge(zScale)
        .attr('stroke', 'black')
        .attr('stroke-width', 0.5)
        .attr('d', zScale3d.draw);

    zScale.exit().remove();

     /* ----------- z-Scale Text ----------- */

    var zText = svg.selectAll('text.zText').data(data[3][0]);

    zText
        .enter()
        .append('text')
        .attr('class', '_3d zText')
        .attr('text-anchor','middle')
        .attr('font-weight', 'bolder')
        .attr('dx', '1em')
        .merge(zText)
        .each(function(d){
            d.centroid = {x: d.rotated.x, y: d.rotated.y, z: d.rotated.z};
        })
        .attr('x', function(d){ return d.projected.x; })
        .attr('y', function(d){ return d.projected.y; })
        .text(function(d){ return  `Quintile ${d[0]/5 + 3}`; });

    zText.exit().remove();

    /* --------- SORT TEXT & FACES ---------*/
    ce.selectAll('._3d').sort(d3._3d().sort);

}

function init(data){
    cubesData = [], yLine = [], xLine = [], zLine = [];
    var cnt = 0;
    for(var z = -j/2 * 3; z <= j; z = z + 5){ // criteria
        for(var x = -j; x <= j; x = x + 5){ // quintile
            datum = data[cnt]
        var h = -datum.total_return;
        var _cube = makeCube(h, x, z);
            _cube.id = 'cube_' + cnt++;
            _cube.height = h;
            cubesData.push(_cube);
        }
    }
    d3.range(0, 20, 5).forEach(function(d){ yLine.push([-j-3, -d, -j]); });
    d3.range(-10, 20, 5).forEach(function(d){ xLine.push([-j-4, 0, -d]); });
    d3.range(-10, 15, 5).forEach(function(d){ zLine.push([-d, 0, -j + 23]); });
    var data = [
        cubes3D(cubesData),
        yScale3d([yLine]),
        xScale3d([xLine]),
        zScale3d([zLine]),
    ];

    processData(data, 1000);
}

function dragStart(){
    mx = d3.event.x;
    my = d3.event.y;
}

function dragged(){
    mouseX = mouseX || 0;
    mouseY = mouseY || 0;
    beta   = (d3.event.x - mx + mouseX) * Math.PI / 230 ;
    alpha  = (d3.event.y - my + mouseY) * Math.PI / 230  * (-1);
    var data = [
        cubes3D.rotateY(beta + startAngle).rotateX(alpha - startAngle)(cubesData),
        yScale3d.rotateY(beta + startAngle).rotateX(alpha - startAngle)([yLine]),
        xScale3d.rotateY(beta + startAngle).rotateX(alpha - startAngle)([xLine]),
        zScale3d.rotateY(beta + startAngle).rotateX(alpha - startAngle)([zLine])
   ];
   processData(data, 0);
}

function dragEnd(){
    mouseX = d3.event.x - mx + mouseX;
    mouseY = d3.event.y - my + mouseY;
}

function makeCube(h, x, z){
    return [
        {x: x - 1, y: h, z: z + 1}, // FRONT TOP LEFT
        {x: x - 1, y: 0, z: z + 1}, // FRONT BOTTOM LEFT
        {x: x + 1, y: 0, z: z + 1}, // FRONT BOTTOM RIGHT
        {x: x + 1, y: h, z: z + 1}, // FRONT TOP RIGHT
        {x: x - 1, y: h, z: z - 1}, // BACK  TOP LEFT
        {x: x - 1, y: 0, z: z - 1}, // BACK  BOTTOM LEFT
        {x: x + 1, y: 0, z: z - 1}, // BACK  BOTTOM RIGHT
        {x: x + 1, y: h, z: z - 1}, // BACK  TOP RIGHT
    ];
}


// 1.  set up chart
// ================================
// function make responsieve to window size
function resizeCanvas() {
    // clear original chart in case window size update
    var svg = d3.select("#fig2").select("svg") 
    if (!svg.empty()){svg.remove();};

    svgHeight = window.innerHeight;
    svgWidth = window.innerWidth;

    margin = {
        left: 100,
        top: 50,
        right: 0,
        bottom: 100 
    };

    chartHeight = svgHeight - margin.top - margin.bottom
    chartWidth = svgWidth - margin.left - margin.right

    svg = d3.select("#fig2").append("svg")
            .attr("height", svgHeight)
            .attr("width", svgWidth)

    // create new canvas, shifting the origin to center canvas
    var chartGroup = svg.append("g")
                        .classed('chartGroup', true)
                        .attr("transform", `translate(${margin.left}, ${margin.top})`)

    return chartGroup;
}

function makeSectorButtons(){
    var Buttons = d3.select("#fig2").selectAll("div")
    if (!Buttons.isEmpty){Buttons.remove()}
    var sectorButtons = d3.select("#fig2").append("div")
                                    .classed("dropdown", true)
                                    .attr("id", "fig2sectorButton")
 
    var hoverButton = sectorButtons.append("button")
                                        .classed("dropbtn", true) 
                                        .html('Select Sector')
    var dropdownContent = sectorButtons.append("div")  
                                            .classed("dropdown-content", true)
                                            .attr("id", "sectors") 
    for (var i = 0; i< sectorList.length; i++){
        dropdownContent.append("button")
                    .attr("value",sectorList[i])
                    .text(sectorList[i])
                    .classed("btn btn-outline-warning", true)
                    .classed("active", false)
                    .classed("inactive", true)
    }
}

function makeResponsive(){
    makeSectorButtons()
    resizeCanvas()
}