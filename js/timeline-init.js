
// Define domElement and sourceFile
var domElement = "#timeline";
var sourceFile = "csv/timeline.csv?t=" + (new Date()).getTime();

// Read in the data and construct the timeline
d3.csv(sourceFile, function(dataset) {

    timeline(domElement)
        .data(dataset)
        .band("mainBand", 0.82)
        .xAxis("mainBand")
        .tooltips("mainBand")
        .labels("mainBand")
        .redraw();

});