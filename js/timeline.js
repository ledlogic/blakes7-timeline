// A timeline component for d3
// @see http://bl.ocks.org/rengel-de/5603464

//
// chart
//

function timeline(domElement) {
    // chart geometry
    var margin = {top: 20, right: 20, bottom: 20, left: 20},
        outerWidth = $("#timeline").width(),
        outerHeight = $("#timeline").height(),
        width = outerWidth - margin.left - margin.right,
        height = outerHeight - margin.top - margin.bottom;

    // global timeline variables
    var timeline = {},   // The timeline
        data = {},       // Container for the data
        components = [], // All the components of the timeline for redrawing
        bandGap = 25,    // Arbitrary gap between to consecutive bands
        bands = {},      // Registry for all the bands in the timeline
        bandY = 0,       // Y-Position of the next band
        bandNum = 0;     // Count of bands for ids

    // Create svg element
    var svg = d3.select(domElement).append("svg")
        .attr("class", "svg")
        .attr("id", "svg")
        .attr("width", outerWidth)
        .attr("height", outerHeight)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top +  ")");

    svg.append("clipPath")
        .attr("id", "chart-area")
        .append("rect")
        .attr("width", width)
        .attr("height", height);

    var chart = svg.append("g")
            .attr("class", "chart")
            .attr("clip-path", "url(#chart-area)" );

    var tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("visibility", "visible");

    //
    // data
    //

    timeline.data = function(items) {
        var tracks = [],
            instantOffset = 100;

        data.items = items;

        // Convert yearStrings into dates
        data.items.forEach(function (item) {
        	item.start = parseFloat(item.start);
            if (item.end == "") {
                //console.log("1 item.start: " + item.start);
                //console.log("2 item.end: " + item.end);
                item.end = (item.start + instantOffset);
                //console.log("3 item.end: " + item.end);
                item.instant = true;
            } else {
                //console.log("4 item.end: " + item.end);
                item.end = parseFloat(item.end);
                item.instant = false;
            }
        });

        data.min = d3.min(data.items, function (d) { return d.start; });
        data.max = d3.max(data.items, function (d) { return d.end; });

        return timeline;
    };

    //
    // band
    //

    timeline.band = function (bandName, sizeFactor) {
        var band = {};
        band.id = "band" + bandNum;
        band.x = 0;
        band.y = bandY;
        band.w = width;
        band.h = height * (sizeFactor || 1);
        band.trackOffset = 4;
        // Prevent tracks from getting too high
        band.trackHeight = Math.min((band.h - band.trackOffset) / data.nTracks, 20);
        band.itemHeight = band.trackHeight * 0.8,
        band.parts = [],
        band.instantWidth = 100; // arbitrary value

        band.xScale = d3.scaleLinear()
            .domain([data.min, data.max])
            .range([0, band.w]);
            
        band.yScale = function (track) {
            return band.trackOffset + track * band.trackHeight;
        };
        
        band.yCalc = function(d) {
        	return (d.series-1) * 20;
        };

        band.g = chart.append("g")
            .attr("id", band.id)
            .attr("transform", "translate(0," + band.y +  ")");

        band.g.append("rect")
            .attr("class", "band")
            .attr("width", band.w)
            .attr("height", band.h);

        // Items
        var items = band.g.selectAll("g")
            .data(data.items)
            .enter().append("svg")
            .attr("y", function (d) { return (band.yCalc(d)); })
            //.attr("height", band.itemHeight)
            .attr("class", function (d) { return d.instant ? "part instant" : "part interval";});

        var intervals = d3.select("#band" + bandNum).selectAll(".interval");
        intervals.append("rect")
            .attr("width", "100%")
            .attr("height", "100%");
        intervals.append("text")
            .attr("class", "intervalLabel")
            .attr("x", 1)
            .attr("y", 10)
            .text(function (d) { return d.label; });

        var instants = d3.select("#band" + bandNum).selectAll(".instant");
        instants.append("circle")
            .attr("cx", band.itemHeight / 2)
            .attr("cy", band.itemHeight / 2)
            .attr("r", 5);
        instants.append("text")
            .attr("class", "instantLabel")
            .attr("x", 15)
            .attr("y", 10)
            .text(function (d) { return d.label; });

        band.addActions = function(actions) {
            // actions - array: [[trigger, function], ...]
            actions.forEach(function (action) {
                items.on(action[0], action[1]);
            })
        };

        band.redraw = function () {
            items
                .attr("x", function (d) { return band.xScale(d.start);})
                .attr("width", function (d) {
                    return band.xScale(d.end) - band.xScale(d.start); });
            band.parts.forEach(function(part) { part.redraw(); })
        };

        bands[bandName] = band;
        components.push(band);
        // Adjust values for next band
        bandY += band.h + bandGap;
        bandNum += 1;

        return timeline;
    };

    //
    // labels
    //

    timeline.labels = function (bandName) {
        var band = bands[bandName],
            labelWidth = 46,
            labelHeight = 20,
            labelTop = band.y + band.h - 10,
            y = band.y + band.h + 1,
            yText = 15;

        var labelDefs = [
                ["start", "bandMinMaxLabel", 0, 4,
                    function(min, max) { return (min); },
                    "Start of the selected interval", band.x + 30, labelTop],
                ["end", "bandMinMaxLabel", band.w - labelWidth, band.w - 4,
                    function(min, max) { return (max); },
                    "End of the selected interval", band.x + band.w - 152, labelTop],
                ["middle", "bandMidLabel", (band.w - labelWidth) / 2, band.w / 2,
                    function(min, max) { return max - min; },
                    "Length of the selected interval", band.x + band.w / 2 - 75, labelTop]
            ];

        var bandLabels = chart.append("g")
            .attr("id", bandName + "Labels")
            .attr("transform", "translate(0," + (band.y + band.h + 1) +  ")")
            .selectAll("#" + bandName + "Labels")
            .data(labelDefs)
            .enter().append("g")
            .on("mouseover", function(d) {
                tooltip.html(d[5])
                    .style("top", d[7] + "px")
                    .style("left", d[6] + "px")
                    .style("visibility", "visible");
                })
            .on("mouseout", function(){
                tooltip.style("visibility", "hidden");
            });

        bandLabels.append("rect")
            .attr("class", "bandLabel")
            .attr("x", function(d) { return d[2];})
            .attr("width", labelWidth)
            .attr("height", labelHeight)
            .style("opacity", 1);

        var labels = bandLabels.append("text")
            .attr("class", function(d) { return d[1];})
            .attr("id", function(d) { return d[0];})
            .attr("x", function(d) { return d[3];})
            .attr("y", yText)
            .attr("text-anchor", function(d) { return d[0];});

        labels.redraw = function () {
            var min = band.xScale.domain()[0],
                max = band.xScale.domain()[1];

            labels.text(function (d) { return d[4](min, max); })
        };

        band.parts.push(labels);
        components.push(labels);

        return timeline;
    };

    //
    // tooltips
    //

    timeline.tooltips = function (bandName) {
        var band = bands[bandName];

        band.addActions([
            // trigger, function
            ["mouseover", showTooltip],
            ["mouseout", hideTooltip]
        ]);

        function getHtml(element, d) {
            var html;
            if (element.attr("class") == "interval") {
                html = d.label + "<br>" + (d.start) + " - " + (d.end);
            } else {
                html = d.label + "<br>" + (d.start);
            }
            return html;
        }

        function showTooltip (d) {

            var x = event.pageX < band.x + band.w / 2
                    ? event.pageX + 10
                    : event.pageX - 110,
                y = event.pageY < band.y + band.h / 2
                    ? event.pageY + 30
                    : event.pageY - 30;

            tooltip
                .html(getHtml(d3.select(this), d))
                .style("top", y + "px")
                .style("left", x + "px")
                .style("visibility", "visible");
        }

        function hideTooltip () {
            tooltip.style("visibility", "hidden");
        }

        return timeline;
    };

    //
    // xAxis
    //

    timeline.xAxis = function (bandName, orientation) {
        var band = bands[bandName];

    	var xScale = d3.scaleLinear();
        var axis = d3.axisBottom(xScale)
            .tickSize(6, 0)
            .tickFormat(function (d) { return (d); });
         
        var xAxis = chart.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + (band.y + band.h)  + ")");
   
        xAxis.redraw = function () {
            xAxis.call(axis);
        };
        
        band.parts.push(xAxis); // for brush.redraw
        components.push(xAxis); // for timeline.redraw

        return timeline;
    };

    //
    // brush
    //

    timeline.brush = function (bandName, targetNames) {
        var band = bands[bandName];

        var brush = d3.svg.brush()
            .x(band.xScale.range([0, band.w]))
            .on("brush", function() {
                var domain = brush.empty()
                    ? band.xScale.domain()
                    : brush.extent();
                targetNames.forEach(function(d) {
                    bands[d].xScale.domain(domain);
                    bands[d].redraw();
                });
            });

        var xBrush = band.g.append("svg")
            .attr("class", "x brush")
            .call(brush);

        xBrush.selectAll("rect")
            .attr("y", 4)
            .attr("height", band.h - 4);

        return timeline;
    };

    //
    // redraw
    //

    timeline.redraw = function () {
        components.forEach(function (component) {
            component.redraw();
        })
    };

    return timeline;
}