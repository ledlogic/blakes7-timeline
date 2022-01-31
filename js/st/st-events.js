/* st-events.js */

st.events = {
	fields: [],
	data:[],
	min: null,
	max: null,
	
	init: function() {
		st.log("init events");
		st.events.loadCsv("csv/st-events.csv");
	},
	loadCsv: function(uri) {
		st.log("loading events from csv, uri[" + uri + "]");
		
		var uriArr = uri.split(":");
		var d = (new Date()).getTime();
		var csv = uriArr[0];
		var n = uriArr[1];
		
		Papa.parse(csv + "?d=" + d, {
			delimiter: ",",
			download: true,
			header: true,
			complete: function(d) {
				st.events.response(d,n);
			},
			encoding: "UTF-8"
		});
	},
	response: function(d, name) {
		st.log("events response");
		
		st.log(d);
		st.log(d.data);
		var fields = d.meta.fields;
		var data = d.data;
		
		//st.log(fields);
		//st.log(data);
		
		st.events.fields = fields;
		st.events.data = data;

		st.events.detBoundaries();		

		setTimeout(st.render.render, 10);
	},
	detBoundaries: function() {
		st.log("events detBoundaries");
		
		// gather min and max
		var data = st.events.data;
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
		st.events.min = min;
		st.events.max = max;
	}
};