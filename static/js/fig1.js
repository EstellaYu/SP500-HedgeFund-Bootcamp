var paths = {
            "marketCap" : "../static/sample_data/marketCap.csv",
             "debtEquity": "../static/sample_data/debtEquity.csv",
             "PE": "../static/sample_data/PE.csv",
             "priceBook": "../static/sample_data/priceBook.csv"
            }

function makeResponsive(){
    file_path = "marketCap"
    var chartGroup = resizeCanvas();
    // get lines data from file
    d3.csv(paths[file_path], function(error, data){
        if (error) return console.warn(error)
        // parse time
        var parseTime = d3.timeParse("%m/%d/%Y")
        data.forEach(function(d){
            d.Q1 = +d.Q1
            d.Q2 = +d.Q2
            d.Q3 = +d.Q3
            d.Q4 = +d.Q4
            d.Q5 = +d.Q5
            d.Monthend = parseTime(d.Monthend)
        })
        // console.log(data)
        makeLines(data, chartGroup);
    })  

    d3.selectAll("button").on("click", function(){
        var value  = d3.select(this).attr("value")
        if (value!= file_path){
            file_path = value  
            d3.selectAll("button")
                .classed("inactive", true)
                .classed("active",false)
            d3.select(this)
                .classed('active', true)
                .classed("inactive", false)
            update(file_path)
        }
    })
}


function update(file_path){
    d3.csv(paths[file_path], function(error, data){
        if (error) return console.warn(error)
        // parse time
        var parseTime = d3.timeParse("%m/%d/%Y")
        data.forEach(function(d){
            d.Q1 = +d.Q1
            d.Q2 = +d.Q2
            d.Q3 = +d.Q3
            d.Q4 = +d.Q4
            d.Q5 = +d.Q5
            d.Monthend = parseTime(d.Monthend)
        })
        // console.log(data)
        var yLinearScale = make_yScale(data, chartHeight)
        yAxis = d3.select(".yAxis")
        yAxis = renderYAxis(yLinearScale, yAxis);
        var xTimeScale = d3.scaleTime()
                            .range([10, chartWidth])
                            .domain(d3.extent(data.map(data => data.Monthend)))

        for (var i = 1; i < 6; i++){
            circles = d3.selectAll(`.Q${i}`)
                        .data(data)
            line = d3.line()
                    .x(d => xTimeScale(d.Monthend))
                    .y(d => yLinearScale(d[`Q${i}`]))
            d3.selectAll(`.Q${i}_line`)
                .data(data)
                .transition()
                .duration(1000)
                .attr("d", line(data))
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

    svgHeight = window.innerHeight * 0.65 ;
    svgWidth = window.innerWidth * 0.8;

    margin = {
        left: 200,
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
                       .domain(d3.extent(data.map(data => data.Monthend)))
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
            .text('Quantile Returns')

    // 5. Plot lines and circles
    // =================================
    // 5.1 plot markers and lines
    for (var i = 1; i < 6; i++) {
        // create an elementgroup for each Quantile
        chartGroup.append("g").attr("id", `elementGroupQ${i}`)
        // draw line and markers under the element Group
        drawLine(data, chartGroup, xTimeScale, yLinearScale, `Q${i}`)
        drawMarkers(data, chartGroup, xTimeScale, yLinearScale, `Q${i}`);
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

            var quantile = numQuantile(d3.select(this).attr("fill"));
            var currentVal = d[`Q${quantile}`];
            var percentChange = (currentVal - 1)* 100
            tooltip.style("display","block")
                    .html(`Quantile <br><b>${quantile}</b> <br>(${formatTime(d.Monthend)}) <hr>$${currentVal.toFixed(2)}<br> <b> ${sign(percentChange)}${percentChange.toFixed(2)}%</b>`)
                    .style("left", d3.event.pageX + "px")
                    .style("top", d3.event.pageY + "px")
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

// Function to draw lines based on Quantile number
function drawLine(data, chartGroup, xTimeScale, yLinearScale, Q){
    var line = d3.line()
                .x(d => xTimeScale(d.Monthend))
                .y(d => yLinearScale(d[`${Q}`]));
    var path = chartGroup.select(`#elementGroup${Q}`)
                        .append("path")
                        .attr("d", line(data))
                        .attr("stroke", markerColor(Q))
                        .classed(`line ${Q}_line`, true);
    var totalLength = path.node().getTotalLength();
    path
        .attr("stroke-dasharray", totalLength + " " + totalLength)
        .attr("stroke-dashoffset", totalLength)
        .transition().duration(3000)
        .attr("stroke-dashoffset", 0);
}

// Function to draw circle markers based on Quantile number
function drawMarkers(data, chartGroup, xTimeScale, yLinearScale, Q){
    var circleGroup = chartGroup
                    .selectAll(`#elementGroup${Q}`)
                    .data(data)
                    .enter()
                    .append("g")
    circleGroup.append("circle")
                    .attr("cx", d => xTimeScale(d.Monthend))
                    .attr("cy", d => yLinearScale(d[`${Q}`]))
                    .attr("r", 2)
                    .attr("stroke", markerColor(Q))
                    .attr("fill", markerColor(Q))
                    .classed(`circle ${Q}`, true);
    circleGroup.transition().delay(1000)  
       
}

// function to update yScale
function make_yScale(data, chartHeight){
    var yMax = d3.max([d3.max(data.map(data => data.Q1)), d3.max(data.map(data => data.Q2)), d3.max(data.map(data => data.Q3)), d3.max(data.map(data => data.Q4)), d3.max(data.map(data => data.Q5))])
    var yMin = d3.min([d3.min(data.map(data => data.Q1)), d3.min(data.map(data => data.Q2)), d3.min(data.map(data => data.Q3)), d3.min(data.map(data => data.Q4)), d3.min(data.map(data => data.Q5))])
    var yLinearScale = d3.scaleLinear()
                        .range([chartHeight - 10, 0])
                        .domain([yMin * 0.8, yMax * 1.1])
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
            .attr("cx", d=> XScale(d.Monthend))
            .attr("cy", d => YScale(d[`${Q}`]))
}

// Function to add "+" to persentChange
function sign(percentChange){
    if (percentChange>0) return "+"
    else return ""
}

// Function to select color based on Quantile
function markerColor(Q){
    switch (Q){
        case "Q1": return "#63A91F";
        case "Q2": return "#365542";
        case "Q3": return "black";
        case "Q4": return "#A40606";
        default: return "red";
    }
}

// Function to select color based on Quantile
function numQuantile(color){
    switch (color){
        case "#63A91F": return 1;
        case "#365542": return 2;
        case "black": return 3;
        case "#A40606": return 4;
        default: return 5;
    }
}

makeResponsive()
d3.select(window).on("resize", makeResponsive);