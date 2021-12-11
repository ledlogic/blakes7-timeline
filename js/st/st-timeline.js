/* st-timeline.js */

st.timeline = {
	fields: [],
	data:[],
	min: null,
	max: null,
	
	init: function() {
		st.log("init timeline");
		st.timeline.loadCsv("csv/st-timeline.csv");
	},
	loadCsv: function(uri) {
		st.log("loading default timeline from csv, uri[" + uri + "]");
		
		var uriArr = uri.split(":");
		var csv = uriArr[0];
		var n = uriArr[1];
		
		Papa.parse(csv, {
			delimiter: ",",
			download: true,
			header: true,
			complete: function(d) {
				st.timeline.response(d,n);
			},
			encoding: "UTF-8"
		});
	},
	response: function(d, name) {
		st.log("timeline response");
		
		st.log(d);
		st.log(d.data);
		var fields = d.meta.fields;
		var data = d.data;
		
		//st.log(fields);
		//st.log(data);
		
		st.timeline.fields = fields;
		st.timeline.data = data;

		st.timeline.detBoundaries();		
	
		setTimeout(st.render.render, 10);
	},
	detBoundaries: function() {
		st.log("timeline detBoundaries");
		
		// gather min and max
		var data = st.timeline.data;
		var min = null;
		var max = null;
		for (var i=0; i<data.length; i++) {
			data[i].start = parseFloat(data[i].start);
			data[i].end = parseFloat(data[i].end);
			
			var start = data[i].start;
			var end = data[i].end;
			
			if (min == null) {
				min = start;
			} else {
				min = Math.min(start, min);
			}
			if (max == null) {
				max = end;
			} else {
				max = Math.max(end, max);
			}
		}
		st.timeline.min = min;
		st.timeline.max = max;
	}
};