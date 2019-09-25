function resizeCanvas() {
    // clear original chart in case window size update
    var cards = d3.select("#cards").select("div")
    if (!cards.empty()){cards.remove();};
    var cards = d3.select("#cards").append("div")
                    .attr("id", "card-container")
                    .classed("row", true)

    cardWidth = window.innerWidth * 0.5;

    for (var i = 0; i< card_description.length; i++){
        var card_div = cards.append('div').classed("col-xl-4 col-md-6 col-sm-12", true)

        var card = card_div.append("div")
                            .attr("width", cardWidth)
                            .classed("card bg-dark text-white", true)
        card.append("img")
            .attr('src', card_description[i].imglink)
            .classed("card-img", true)
        var overlay = card.append("div").classed("card-img-overlay", true)
        overlay.append("h5")
                .classed("card-title middle", true)
                .html(card_description[i].title)
        overlay.append("p")
                .classed("card-text middle", true)
                .html(card_description[i].abstract)    
        overlay.append("a")
                .classed("btn btn-primary middle", true)
                .attr('href', card_description[i].href)
                .html("EXPLORE")
        console.log(card_description[i].href)
    }
}
resizeCanvas();
d3.select(window).on("resize", resizeCanvas)
