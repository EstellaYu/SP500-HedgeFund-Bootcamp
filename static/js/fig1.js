var paths = {   "P-E" : {
                    name: "Price/Earnings",
                    path: "/FiveLines/1"
                },
                "P-B": {
                    name: "Price/Book",
                    path: "/FiveLines/2"
                },
                "EV-Sales": {
                    name: "E-Value/Sales",
                    path: "/FiveLines/3"
                },
                "EV-EBIT": {
                    name: "E-Value/EBIT",
                    path: "/FiveLines/4"
                },
                "Debt-Cap": {
                    name: "Net Debt/Cap",
                    path: "/FiveLines/5"
                },
                "Mkt%20Cap": {
                    name: "Market Cap",
                    path: "/FiveLines/6"
                }
            }
sectorList = ["All", "Communication Services", "Consumer Discretionary", "Consumer Staples", "Energy", "Financials", "Health Care", "Industrials", "Information Technology", "Materials", "Real Estate", "Utilities"]

makeResponsive()
d3.select(window).on("resize", makeResponsive);

function makeResponsive(){
    file_path = "Mkt%20Cap"
    sector = "All"
    data_path = paths[file_path].path + "%20" + file_path + "/" + sector
    // console.log(data_path)
    makeHomeButtons()
    makeCriteriaButtons()
    makeSectorButtons()
    var chartGroup = resizeCanvas();

    
    // get lines data from file
    d3.json(data_path, function(error, data){
        if (error) return console.warn(error)
        // parse time
        var parseTime = d3.timeParse("%Y-%m-%d")
        data.forEach(function(d){
            d.quintile = +d.quintile
            d.wealth_index = +d.wealth_index
            d.monthend_date = parseTime(d.monthend_date)
        })
    
        makeLines(data, chartGroup);
    })  

    d3.select("#sectors").selectAll("button").on("click", function(){
        var value_sec = d3.select(this).attr("value")
        // console.log(true, value_sec)
        if (value_sec!= sector){
            sector = value_sec  
            d3.select("#sectorButton>button").html((sector == "All")? ("Sector: " + sector+ " sectors") : ("Sector: " +sector))
            d3.select("#sectors").selectAll("button")
                .classed("inactive", true)
                .classed("active",false)
            d3.select(this)
                .classed('active', true)
                .classed("inactive", false)
            update(file_path, sector)
        }
    })
    d3.select("#criterias").selectAll("button").on("click", function(){
        var value  = d3.select(this).attr("value")
        if (value!= file_path){
            file_path = value  
            d3.select("#criteriaButton>button").html("Criteria: " + paths[file_path].name)
            d3.select("#criterias").selectAll("button")
                .classed("inactive", true)
                .classed("active",false)
            d3.select(this)
                .classed('active', true)
                .classed("inactive", false)
            update(file_path, sector)
        }
    })
}

function makeHomeButtons(){
    var buttons = d3.select("#home")
    if (!buttons.isEmpty){buttons.remove()}
    var homeButton = d3.select("body").append("div").attr("id", "home")
                    .append("button").html("Home").attr("id", "homeButton")
    d3.select("#homeButton").on("click",function(){
        location.href = "/"
    })    
    var buttons = d3.select("#visual")
    if (!buttons.isEmpty){buttons.remove()}
    var visualButton = d3.select("body").append("div").attr("id", "visual")
                        .append("button").html("Visuals").attr("id", "visualButton")
    d3.select("#visualButton").on("click",function(){
        location.href = "/#page2"
    })
} 

function makeCriteriaButtons(){
    var Buttons = d3.select("#fig1").selectAll("div")
    if (!Buttons.isEmpty){Buttons.remove()}
    var criteriasButtons = d3.select("#fig1").append("div")
                                    .classed("dropdown", true)
                                    .attr("id", "criteriaButton")
 
    var hoverButton = criteriasButtons.append("button")
                                        .classed("dropbtn", true) 
                                        .html('Selection Criteria')
    var dropdownContent = criteriasButtons.append("div")  
                                            .classed("dropdown-content", true)
                                            .attr("id", "criterias") 
    var criterias = Object.keys(paths)
    for (var i = 0; i < criterias.length; i++){
        dropdownContent.append("button")
                        .attr("value",criterias[i])
                        .text(paths[criterias[i]].name)
                        .classed("btn btn-outline-success", true)
                        .classed("active", false)
                        .classed("inactive", true)
    }
}
function makeSectorButtons(chartGroup){
    var sectorsButtons = d3.select("#fig1").append("div")
                            .classed("dropdown", true)
                            .attr("id", "sectorButton")
                            
    var hoverButton = sectorsButtons.append("button")
                            .classed("dropbtn", true)
                            .html('Select Sector')

    var dropdownContent = sectorsButtons.append("div")  
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

function update(file_path, sector){    
    data_path = paths[file_path].path + "%20" + file_path + "/" + sector
    d3.json(data_path, function(error, data){
        if (error) return console.warn(error)
        // parse time
        var parseTime = d3.timeParse("%Y-%m-%d")
        data.forEach(function(d){
            d.quintile = +d.quintile
            d.wealth_index = +d.wealth_index
            d.monthend_date = parseTime(d.monthend_date)
        })
        // console.log(data)
        var yLinearScale = make_yScale(data, chartHeight)
        yAxis = d3.select(".yAxis")
        yAxis = renderYAxis(yLinearScale, yAxis);
        var xTimeScale = d3.scaleTime()
                            .range([10, chartWidth])
                            .domain(d3.extent(data.map(data => data.monthend_date)))

        for (var i = 5; i >0; i--){
            function selectQ(data){// Function to filter data to certain quintile
                return data.quintile == i
            }
            var data_Q = data.filter(selectQ)
            circles = d3.selectAll(`.Q${i}`)
                        .data(data_Q)
            line = d3.line()
                    .x(d => xTimeScale(d.monthend_date))
                    .y(d => yLinearScale(d.wealth_index))
            d3.selectAll(`.Q${i}_line`)
                .data(data_Q)
                .transition()
                .duration(1000)
                .attr("d", line(data_Q))
            renderMarkers(circles,xTimeScale, yLinearScale, `Q${i}`)
        }      
    })  
}
// 1.  set up chart
// ================================
// function make responsieve to window size
function resizeCanvas() {
    // clear original chart in case window size update
    var svg = d3.select("#fig1").select("svg") 
    if (!svg.empty()){svg.remove();};

    svgHeight = window.innerHeight * 0.67 ;
    svgWidth = window.innerWidth * 0.8;

    margin = {
        left: 80,
        top: 20,
        right: 10,
        bottom: 100 
    };

    chartHeight = svgHeight - margin.top - margin.bottom
    chartWidth = svgWidth - margin.left - margin.right

    svg = d3.select("#fig1").append("svg")
            .attr("height", svgHeight)
            .attr("width", svgWidth)

    // create new canvas, shifting the origin to center canvas
    var chartGroup = svg.append("g")
                        .attr("transform", `translate(${margin.left}, ${margin.top})`)

    return chartGroup;
}

// 2. Main function to make lines
function makeLines(data, chartGroup){
    // 3. create scales, and axis (without data)
    // =================================
    // 3.1 create xScale and xAxis
    var xTimeScale = d3.scaleTime()
                       .range([10, chartWidth])
                       .domain(d3.extent(data.map(data => data.monthend_date)))
    var bottomAxis = d3.axisBottom(xTimeScale).tickFormat(d3.timeFormat("%b/%y"));
    chartGroup.append("g")
                .attr("transform", `translate(0, ${chartHeight})`)
                .call(bottomAxis);

    // 3.2 create yScale and yAxis
    // =================================
    var yLinearScale = make_yScale(data, chartHeight)
    var leftAxis = d3.axisLeft(yLinearScale).tickFormat(d3.format("$.2f"))
    chartGroup.append("g")
            .attr("class","yAxis")
            .call(leftAxis)
    
    // add label
    var xLabel = chartGroup.append("g")
    var yLabel = chartGroup.append("g")
    xLabel.append("text")
            .attr("x", chartWidth/2 - 50)
            .attr('y', chartHeight + 70)
            .attr("font-size", "25px")
            .text('Month End')
    yLabel.append("text")
            .attr("x", - chartHeight/2 - 80)
            .attr('y', -60)
            .attr("font-size", "25px")
            .attr('transform', 'rotate(-90)')
            .text('Quintile Returns')

    // 5. Plot lines and circles
    // =================================
    // 5.1 plot markers and lines
    for (var i = 5; i >0; i--) {
        // create an elementgroup for each Quintile
        chartGroup.append("g").attr("id", `elementGroupQ${i}`)
        // draw line and markers under the element Group
        
        function selectQ(data){// Function to filter data to certain quintile
            return data.quintile == i
        }
        var data_Q = data.filter(selectQ)
        // console.log(data_Q)
        drawLine(data_Q, chartGroup, xTimeScale, yLinearScale, i)
        drawMarkers(data_Q, chartGroup, xTimeScale, yLinearScale, i);
    }

    // 6. Add tooltips
    // ================================= 
    var circleGroup = d3.selectAll("circle")

    updateTooltip(circleGroup)
}

function updateTooltip(circleGroup){
    var formatTime = d3.timeFormat("%b-%Y")

    var tooltip = d3.select(".tooltip")
    if (!tooltip.empty()){tooltip.remove()}
    var tooltip = d3.select("#fig1")
                    .append("div")
                    .classed("tooltip", true)
    circleGroup
        .on("mouseover", function(d, i){
            d3.selectAll("circle")
                .transition()
                .duration(500)
                .attr("r", 2)
            d3.select(this)
                .transition()
                .duration(500)
                .attr("r", 5)

            var quintile = numQuintile(d3.select(this).attr("fill"));
            var currentVal = d.wealth_index;
            var percentChange = (currentVal - 100)
            tooltip.style("display","block")
                    .html(`Quintile <br><b>${quintile}</b> <br>(${formatTime(d.monthend_date)}) <hr>$${currentVal.toFixed(2)}<br> <b> ${sign(percentChange)}${percentChange.toFixed(2)}%</b>`)
                    .style("left", d3.event.pageX - 90 + "px")
                    .style("top", d3.event.pageY - 140 + "px")
                    .style("background", d3.select(this).attr("fill"))
        })
        .on("mouseout", function(){
            d3.selectAll("circle")
                .transition()
                .duration(500)
                .attr("r", 2)
            tooltip.style("display","none")

        })
}

// Function to draw lines based on Quintile number
function drawLine(data_Q, chartGroup, xTimeScale, yLinearScale, i){
    var line = d3.line()
                .x(d => xTimeScale(d.monthend_date))
                .y(d => yLinearScale(d.wealth_index));
    var path = chartGroup.select(`#elementGroupQ${i}`)
                        .append("path")
                        .attr("d", line(data_Q))
                        .attr("stroke", markerColor(`Q${i}`))
                        .classed(`line Q${i}_line`, true);
    var totalLength = path.node().getTotalLength() + 2000;
    path
        .attr("stroke-dasharray", totalLength + " " + totalLength)
        .attr("stroke-dashoffset", totalLength)
        .transition().duration(3000)
        .attr("stroke-dashoffset", 0);
}

// Function to draw circle markers based on Quintile number
function drawMarkers(data_Q, chartGroup, xTimeScale, yLinearScale, i){
    var circleGroup = chartGroup
                    .selectAll(`#elementGroupQ${i}`)
                    .data(data_Q)
                    .enter()
                    .append("g")
    circleGroup.append("circle")
                    .attr("cx", d => xTimeScale(d.monthend_date))
                    .attr("cy", d => yLinearScale(d.wealth_index))
                    .attr("r", 2)
                    .attr("stroke", markerColor(`Q${i}`))
                    .attr("fill", markerColor(`Q${i}`))
                    .classed(`circle Q${i}`, true);
    circleGroup.transition().delay(1000)  
       
}

// function to update yScale
function make_yScale(data, chartHeight){
    var yMax = d3.max(data.map(data => data.wealth_index))
    var yMin = d3.min(data.map(data => data.wealth_index))
    var yLinearScale = d3.scaleLinear()
                        .range([chartHeight - 10, 0])
                        .domain([yMin * 0.95, yMax * 1.05])
    return yLinearScale;
}

function renderYAxis(newScale, yAxis){
    var LeftAxis = d3.axisLeft(newScale).tickFormat(d3.format("$.2f"));
    yAxis.transition().duration(1000).call(LeftAxis);
    return yAxis;
}

function renderMarkers(circles,XScale, YScale, Q){
    circles.transition()
            .duration(1000)
            .attr("cx", d=> XScale(d.monthend_date))
            .attr("cy", d => YScale(d.wealth_index))
}

// Function to add "+" to persentChange
function sign(percentChange){
    if (percentChange>0) return "+"
    else return ""
}

// Function to select color based on Quintile
function markerColor(Q){
    switch (Q){
        case "Q1": return "#63A91F";
        case "Q2": return "#365542";
        case "Q3": return "black";
        case "Q4": return "#A40606";
        default: return "red";
    }
}

// Function to select color based on Quintile
function numQuintile(color){
    switch (color){
        case "#63A91F": return 1;
        case "#365542": return 2;
        case "black": return 3;
        case "#A40606": return 4;
        default: return 5;
    }
}