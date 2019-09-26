// Run the program
// Note that "currentSector" and "currentQuintile" are global variables
var currentSector = "All";
var currentQuintile = 1;
var pe = 0;
var pb = 0;
var evsales = 0;
var evebit = 0;
var debtcap = 0;
var mktcap = 0;
init();

function buildBarChart(currSector, currQuintile) {
  url = `/BarChart/${currQuintile}/${currSector}`;

  d3.json(url).then(function(criteriaReturns) {
    for (i = 0; i < criteriaReturns.length; i++) {
      switch (criteriaReturns[i]["criteria"]) {
        case ("1 P-E"):
          pe = +criteriaReturns[i]["total_return"];
          break;
        case ("2 P-B"):
          pb = +criteriaReturns[i]["total_return"];
          break;
        case ("3 EV-Sales"):
          evsales = +criteriaReturns[i]["total_return"];
          break;
        case ("4 EV-EBIT"):
          evebit = +criteriaReturns[i]["total_return"];
          break;
        case ("5 Debt-Cap"):
          debtcap = +criteriaReturns[i]["total_return"];
          break;
        case ("6 Mkt Cap"):
          mktcap = +criteriaReturns[i]["total_return"];
        }
      }
  })

  var trace1 = {
    x: ["P/E","P/B","EV/Sales","EV/EBIT","Debt/Cap","Mkt Cap"],
    y: [pe, pb, evsales, evebit, debtcap, mktcap],
    type: "bar"
  };
  
  var data = [trace1];

  var chartTitle = ``;
  if (currSector=="All") {
    chartTitle = `Bar Chart for Quintile ${currQuintile} for all sectors`
    }
  else {
    chartTitle = `Bar Chart for Quintile ${currQuintile} in the ${currSector} sector`
  }

  var layout = {
    title: chartTitle,
    xaxis: { title: "Criteria"},
    yaxis: { title: "Average Annual Return"}
  };

  Plotly.newPlot('bar_chart', data, layout);

};


function init() {
  makeHomeButtons()
  // Grab a reference to the dropdown select element for Sector Names
  var selectorSector = d3.select("#selSector");

  // Populate the sector names
  d3.json("/SectorList").then((sectorNames) => {
    sectorNames.forEach((sector) => {
      selectorSector
        .append("option")
        .text(sector)
        .property("value", sector);
    });
  });

    // Grab the reference to the dropdown select element for Quintile Names
    var selectorQuintile = d3.select("#selQuintile");

    // Populate the quintile names
    quintileNames = ["Quintile 1", "Quintile 2", "Quintile 3", "Quintile 4", "Quintile 5"];
    for (i = 0; i < quintileNames.length; i++) {
        selectorQuintile
          .append("option")
          .text(quintileNames[i])
          .property("value", quintileNames[i]);
      };

    // currentSector and currentQuintile are global variables, initialized up top
    buildBarChart(currentSector, currentQuintile);
};

function sectorChanged(newSector) {
  // Fetch new data each time a new sector is selected
  currentSector = newSector;
  buildBarChart(currentSector, currentQuintile);
};

function quintileChanged(newQuintile) {
  // Fetch new data each time a new sector is selected
  switch(newQuintile) {
    case "Quintile 1":
      currentQuintile = 1;
      break;
    case "Quintile 2":
      currentQuintile = 2;
      break;
    case "Quintile 3":
      currentQuintile = 3;
      break;
    case "Quintile 4":
      currentQuintile = 4;
      break;
    case "Quintile 5":
      currentQuintile = 5;
    }

    buildBarChart(currentSector, currentQuintile);
};

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