/* st-render.js */

st.render = {
	init: function() {
		st.log("init render");
	},
	render: function() {
		st.log("rendering timeline");
		
		var h = $("#timeline").height();
		var w = $("#timeline").width();
		var max = st.timeline.max;

		st.log("h[" + h + "]");
		st.log("w[" + w + "]");

		var g = d3.select("#timeline").append("svg")
			.attr("width", w)
   			.attr("height", h);
		
		
		st.render.renderTimeline(g, w, h);
		st.render.renderEvents(g, w, h);
	},
	renderTimeline: function(g, w, h) {
		var max = st.timeline.max;
		
		var tickWidth = 60;
		var tickpx0 = 20;
		var tickpx1 = tickpx0 + tickWidth;

		var verticalMargin = 20;
		var verticalExtent = h - 2*verticalMargin;
		var verticalExaggeration = verticalExtent/max;

		st.log("verticalExtent[" + verticalExtent + "]");
		st.log("verticalExaggeration[" + verticalExaggeration + "]");
		
		st.log("max[" + max + "]");
		for (var y=1; y<max+1; y++) {
			var ypx = (y-1) * verticalExaggeration + verticalMargin;
			//st.log("y[" + y + "]");
			//st.log("ypx[" + ypx + "]");
			var strokeWidth = 1;
			if (y % 5 == 0) {
				strokeWidth = 2;
			}
			if (y % 10 == 0) {
				strokeWidth = 4;
			}
			if (y % 50 == 0) {
				strokeWidth = 8;
			}
			g.append('line')
    			.style("stroke", "#cccccc")
    			.style("stroke-width", strokeWidth)
    			.attr("x1", tickpx0)
    			.attr("y1", ypx)
    			.attr("x2", tickpx1)
    			.attr("y2", ypx); 

			if (strokeWidth > 1) {
				g.append('line')
	    			.style("stroke", "#000000")
	    			.style("stroke-width", 0.5)
	    			.attr("x1", tickpx0)
	    			.attr("y1", ypx)
	    			.attr("x2", tickpx1)
	    			.attr("y2", ypx);
	    	}

			g.append('line')
    			.style("stroke", "#ffffff")
    			.style("stroke-width", strokeWidth * 2)
    			.attr("x1", tickpx0 + 20)
    			.attr("y1", ypx)
    			.attr("x2", tickpx1 - 20)
    			.attr("y2", ypx); 

			var text = g.append("text")
			    .attr("x", (tickpx0 + tickpx1) / 2)
			    .attr("y", ypx + 5)
			    .text(y)
			    .attr("font-family", "AYT Avalon")
			    .attr("font-size", "10px")
			    .style("text-anchor", "middle")
			    .style("opacity", 0)
			    .transition()
    			.delay(200)
    			.style("opacity", 1);
		}
	},
	
	renderEvents: function(g, w, h) {
		var max = st.timeline.max;
		var data = st.timeline.data;
		
		var tickWidth = 60;
		var tickpx0 = 20;
		var tickpx1 = tickpx0 + tickWidth;
		var tickpx2 = tickpx1 + 20;
		var tickpx3 = tickpx2 + 200;

		var verticalMargin = 20;
		var verticalExtent = h - 2*verticalMargin;
		var verticalExaggeration = verticalExtent/max;

		st.log("verticalExtent[" + verticalExtent + "]");
		st.log("verticalExaggeration[" + verticalExaggeration + "]");
		
		for (var i=0; i<data.length; i++) {
			var datum = data[i];
			st.log(datum);
			
			var y = (datum.start + datum.end)/2 - 1;
			var ypx = y * verticalExaggeration + verticalMargin;
			
			var text = g.append("text")
			    .attr("x", tickpx2)
			    .attr("y", ypx + 4)
			    .text("S" + datum.group + " E" + datum.start + " " + datum.title)
			    .attr("font-family", "AYT Avalon")
			    .attr("font-size", "12px");
		}
	}
};