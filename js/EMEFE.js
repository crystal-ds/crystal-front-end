EME = {
	hostName: "https://localhost:8443/",
	modelDataRanges: {},
	currentModel: "",
	init: function(){

	
			
			$('#totalCases').hide();
			$('#estimatedTime').hide();
			$('#plot').hide();
			$('#resultsDiv').hide();
			$("#factorSelector").multiselect({
			   noneSelectedText: "Select Variables",
			   height: "auto",
			   minWidth: 300
			   
			});
			
			
			$("#factorSelector").multiselect('disable');
			$("#factorSelector").multiselect({
				click: function(event, ui){

				  $("tr[id^='row-" + ui.value + "']").toggle();
				  
			   },
			   
			   checkAll: function(){
				  $("tr[id^='row-']").show();
			   },
			   uncheckAll: function(){
					$("tr[id^='row-']").hide();
			   },
			   optgrouptoggle: function(event, ui){
				  var values = $.map(ui.inputs, function(checkbox){
					 return checkbox.value;
				  });
				  
				  if (ui.checked){
					for(var v = 0; v < values.length; v++){
						$("tr[id^='row-" + values[v] + "']").show();
					}		  
				  
				  }
				  else {
					for(var v = 0; v < values.length; v++){
						$("tr[id^='row-" + values[v] + "']").hide();
					}	
				  
				  }
			   }
			});
			$("#modelSelector").multiselect({
			   multiple: false,
			   header: "Select a Model",
			   noneSelectedText: "Select a Model",
			   selectedList: 1
			});
			
		
		$.ajax({
			url: EME.hostName + "crystal-a2c2/eme/models",
			contentType:"application/x-javascript;",
			type:"GET",
			success:function(data) {
				var models = []

				for (obj in data) {

					models.push(data[obj]);
				}
				EME.populateModels(models);
			   
			},
			error:function(jqXHR, textStatus, errorThrown ){
				console.log("failure");
				console.log(errorThrown);
				console.log(jqXHR);
				console.log(textStatus);
			
			
			},
			
			dataType:"json"
		});
		
		
	},
	
	
	populateModels: function(models){
		for (model in models){
			m = models[model]
			EME.modelsDic[m.name] = m;
			$("#modelSelector").append("<option value='" + m.name + "'>"+ m.name + "</option>");
			
	
		}
		$("#modelSelector").prepend("<option value='' selected='selected'></option>");
		$("#modelSelector").multiselect('refresh');
		$("#modelSelector").multiselect('uncheckAll');
	},
	
	
	modelsDic: {},
	
	generateUserInputs: function(model){
		inputs = model.inputs;
		
		$("#factorSelector").html('<optgroup id="opt-ic" label="Initial Conditions"></optgroup>' +
				'<optgroup id="opt-iv" label="Intermediary Variables"></optgroup>' +
				'<optgroup id="opt-coa"label="Courses Of Action"></optgroup>');
		for (i in inputs){
			
			var input = inputs[i];
			console.log("input");
			console.log(input);
			if(inputs.hasOwnProperty(i)){
				//TODO make this a number actually unique
				var number = Math.floor(Math.random()*9999)
				
				switch(input.variableType){
					case "INITIAL_CONDITION":	
						$("#opt-ic").append("<option id='" + number + "' value='" + number + "'>"+ input.name + "</option>");
						break;
					case "INTERMEDIARY_VARIABLE":		
						$("#opt-iv").append("<option id='" + number + "' value='" + number + "'>"+ input.name + "</option>");
						break;
					case "COURSE_OF_ACTION":		
						$("#opt-coa").append("<option id='" + number + "' value='" + number + "'>"+ input.name + "</option>");
						break;

					default:
						console.log("Improper Variable Type");
						break;
				}
				
				
				
				
				switch(input.type){
					case "RANGE":	
						console.log("In Range");
					
						EME.addSlider(number,input.name,input.properties.min,input.properties.max,input.properties.value,input.properties.value,0, input.type);
						break;
					case "FLOAT":		
						console.log("In Float");
						EME.addSlider(number,input.name,input.properties.min,input.properties.max,input.properties.value,input.properties.value,0, input.type);
						break;
					case "INTEGER":		
						console.log("In Int");
						EME.addSlider(number,input.name,input.properties.min,input.properties.max,input.properties.value,input.properties.value,0, input.type);
						break;
					case "STRING":		
						console.log("In String, but pretending to be options");
						EME.addSelection(number,input.name,input.properties.regex.split("|"),0, input.type);
						break;	
					

					default:
						console.log("In def");
						break;
				}	
			}
		
		}
		
		$("#factorSelector").multiselect('refresh');
		$("#factorSelector").multiselect('uncheckAll');
	
	
	},

	
	modelSelected: function(dropDown) {
		console.log('What?');
		console.log(dropDown);
		EME.modelDataRanges = {};
		
		var model = dropDown.options[dropDown.selectedIndex].value
		console.log(model);
		EME.currentModel = EME.modelsDic[model]
		console.log("CURRENT MODEL");
		console.log(EME.currentModel);
		if (model == ""){
			$("#factorTableDiv").html('');
			$('#totalCases').hide();
			$('#estimatedTime').hide();
			$('#plot').hide();
			$('#resultsDiv').hide();
			$("#factorSelector").multiselect('disable');
			
		}
		else {
			$("#factorTableDiv").html('<table id="factorTable"  cellspacing="10" cellpadding="10" class="tablesorter">	<thead><tr><th><u>Factor</u></th><th><u>Range</u></th><th><u>Distribution</u></th><th><u># of Samples</u></th><th></th></tr></thead><tbody></tbody></table>');    
			$('#totalCases').show();

			$('#estimatedTime').show();
			$('#plot').show();
			$('#resultsDiv').show();
			$("#factorSelector").multiselect('enable');
 
		
			
			EME.generateUserInputs(EME.modelsDic[model]);
			
			$("#factorTable").tablesorter({sortList:[[0,0],[2,1]]}); 
			
		}
		
		
	
	
	},
	convertTime: function(time){

		var mins = ~~(time / 60);
		var secs = time % 60;
	
		// Hours, minutes and seconds
		var hrs = ~~(time / 3600);
		var mins = ~~((time % 3600) / 60);
		var secs = ~~(time % 60);

		// Output like "1:01" or "4:03:59" or "123:03:59"
		ret = "";

		if (hrs > 0)
			ret += "" + hrs + ":" + (mins < 10 ? "0" : "");

		ret += "" + mins + ":" + (secs < 10 ? "0" : "");
		ret += "" + secs;
		return ret;
	
	
	}
	,
	
	
	addSelection: function(number, name, options, index, type){
		console.log("Adding Selection:" + number +"|" +  name +"|" +  options +"|" + index+"|")
		//This needs to be computed from number of cases
		console.log(name.replace(/[\*]/g, ''));
		var showName = name.indexOf('*') >= 0 ? "hidden" : "visible";
		var tableRow = '<tr id="row-' + number + '"><td style="visibility:' + showName + ';">' + name + '</td><td>'  +
					'<select id="selection-drop' +
					'-' + number + '" style="width:250px;" multiple="multiple"></select>' + 
					'</td><td>' + 
					'<input checked="checked" type="radio" name="dist'  + '-' + number +   '" id="rd1 '  + '-' + number +   '" value="Normal"/ disabled>' + 
					'<label for="rd1 '  + '-' + number +   '">Normal</label><br/>' +
					'<input  type="radio" name="dist'  + '-' + number +   '" id="rd2 '  + '-' + number +   '" value="Equal" checked="checked"/>' + 
					'<label for="rd2 '  + '-' + number +   '">Equal</label><br/>' + 
					'</td><td><input class="cases ' + name.replace(/[\*,\s]/g, '') + '"size="2" maxlength="4" value="' + options.length + '" id="cases'  + '-' + number +'" disabled></input></td><td>'  + 				
					'</td></tr>';
					
		if (index <= 0){
			$('#factorTable').append(tableRow);
		}
		else {
			$('#factorTable > tbody > tr').eq(index).after(tableRow);
		
		}
		$('input[name="dist-' + number + '"]').change(function() {
		

			EME.plotDistNominal([[number,type]])
		
		
		
		});
		$('#cases' + '-' + number).keyup(function() {
			
		
			EME.calculateCases();
				

			EME.plotDistNominal([[number,type]])
			
			}
		);
		options.forEach(function (opt){
			$('#selection-drop' +'-' + number).append("<option id='" + opt + number + "' value='" + opt + "' selected>"+ opt + "</option>");
		});
		$('#selection-drop' +'-' + number).multiselect({
			   height: "auto",
			   minWidth: 250,
			   
			   
			   click: function(event, ui){			   
					$('#cases'  + '-' + number).val($('#selection-drop' +'-' + number).multiselect("getChecked").length);		
					EME.calculateCases();
					EME.plotDistNominal([[number, type]]);					
			   }, 
			   checkAll: function(){
					$('#cases'  + '-' + number).val($('#selection-drop' +'-' + number).multiselect("getChecked").length);	
					EME.calculateCases();
					EME.plotDistNominal([[number, type]]);
			   }, 
			   uncheckAll: function(){
					$('#cases'  + '-' + number).val($('#selection-drop' +'-' + number).multiselect("getChecked").length);
					EME.calculateCases();
					EME.plotDistNominal([[number, type]]);
			   }
			   
			   
			   
			});
				
	
			
					
		
		EME.calculateCases();

		EME.plotDistNominal([[number, type]]);
		$("#factorTable").tablesorter({sortList:[[0,0],[2,1]], widgets: ['zebra']}); 
	},
	

	calculateCases: function(){
		var casesDic = {}
		var total = 1;
		
		$(".cases").each(function(index, ele) {
			var value = ele.value || ele.getAttribute('value')
			var integer =  parseInt(value, 10) || 0;
			casesDic[ele.className] = casesDic[ele.className] + integer || integer;
		})
		
		for (var prop in casesDic) {
			  if(casesDic.hasOwnProperty(prop)){
				total = total * casesDic[prop];
			  }
		  }
		$("#totalCases").html("Total number of cases: " + total);
		//Time per run of selected model (default .1 seconds)
		var secondsPerRun = .1 * total
		$("#estimatedTime").html("Estimated Time: " + EME.convertTime(secondsPerRun));

		
	
	},

	addSlider: function(number, name, lower, upper, dlower, dupper, index, type){
		console.log("Adding Slider:" + number +"|" +  name +"|" +  lower+"|" +  upper+"|" +  dlower+"|" +  dupper+"|" + index+"|")
		//This needs to be computed from number of cases
		console.log(name.replace(/[\*]/g, ''));
		var showName = name.indexOf('*') >= 0 ? "hidden" : "visible";
		var tableRow = '<tr id="row-' + number + '"><td style="visibility:' + showName + ';">' + name + '</td><td>'  +
					'<div id="slider-range' +
					'-' + number + '" style="width:250px;"></div>' + 
					'<input type="text" id="amountMin' + '-' + number + '" size="2" maxlength="4"style="border: 0; color: #f6931f; font-weight: bold;" />' +
					'<input type="text" id="amountMax' + '-' + number + '" size="2" maxlength="4" style="border: 0; color: #f6931f; font-weight: bold; float: right;" /> ' +
					
					'</td><td>' + 
					'<input checked="checked" type="radio" name="dist'  + '-' + number +   '" id="rd1 '  + '-' + number +   '" value="Normal"/>' + 
					'<label for="rd1 '  + '-' + number +   '">Normal</label><br/>' +
					'<input  type="radio" name="dist'  + '-' + number +   '" id="rd2 '  + '-' + number +   '" value="Equal"/>' + 
					'<label for="rd2 '  + '-' + number +   '">Equal</label><br/>' + 
					'</td><td><input class="cases ' + name.replace(/[\*,\s]/g, '') + '"size="2" maxlength="4" value="' + (parseInt(dupper)-parseInt(dlower)+1).toString() + '" id="cases'  + '-' + number +'"></input></td><td>'  + 
					'<button id="another' + '-' + number + '">Another Range?</button>'				
					+ '</td></tr>';
					
		if (index <= 0){
			$('#factorTable').append(tableRow);
		}
		else {
			$('#factorTable > tbody > tr').eq(index).after(tableRow);
		
		}
		$('input[name="dist-' + number + '"]').change(function() {
		

			EME.plotDist([[number,type]])
		
		
		
		});
		$('#cases' + '-' + number).keyup(function() {
			
		
			EME.calculateCases();
				

			EME.plotDist([[number, type]])
			
			}
		);

		$('#another' + '-' + number).click(function(){
						var i = $(this).closest('tr').index();
						console.log("Button Click");
						EME.addSlider(number.toString() + '1', name + '*', lower, upper, dlower, dupper, i, type);
						$(this).remove();
						}
					);
				

		
		
			$( "#slider-range" + '-' + number).slider({
		  range: true,
		  min: parseInt(lower,10),
		  max: parseInt(upper,10),
		  values: [ parseInt(dlower,10) - 2, parseInt(dupper,10) + 2],//TODO remove 2's used as workaround for undef bug
		  slide: function( event, ui ) {
			
			$( "#amountMin" + '-' + number ).val(ui.values[ 0 ]);
			$( "#amountMax" + '-' + number ).val(ui.values[ 1 ] );

			EME.plotDist([[number, type]])
		  }
		});
		$( "#amountMin" + '-' + number ).val($( "#slider-range" + '-' + number).slider( "values", 0 )).keyup(function() {
			var low = parseInt($( "#amountMin" + '-' + number ).val(),10);
			var high =  parseInt($( "#amountMax" + '-' + number ).val(),10);
			var count = parseInt($("#totalCases").html().split(':')[1])
			 
			 low = Math.min(low, high);
			EME.plotDist([[number, type]])
			$( "#slider-range" + '-' + number).slider('values', 0, low);
		
			});
		$( "#amountMax" + '-' + number ).val($( "#slider-range" + '-' + number ).slider( "values", 1 ) ).keyup(function() {
			 var low = parseInt($( "#amountMin" + '-' + number ).val(),10);
			 var high =  parseInt($( "#amountMax" + '-' + number ).val(),10);
			 var count = parseInt($("#totalCases").html().split(':')[1])
			 high = Math.max(low, high);
			EME.plotDist([[number, type]])
			$( "#slider-range" + '-' + number).slider('values', 1, high);
		
			});
		
		
		EME.calculateCases();

		EME.plotDist([[number, type]])
		$("#factorTable").tablesorter({sortList:[[0,0],[2,1]], widgets: ['zebra']}); 
		
		EME.plotDist([[number, type]])
		
		console.log("Model Data Ranges:");
		console.log(EME.modelDataRanges);
	},
	
	
	//Type must be consistance accross input
	plotDistNominal: function(lOfN){
	
	
		d = {}
		e = []
		
		var type = lOfN[0][1];
		var caseTot = 0;
		var idvCaseTot = 0;
		for (num in lOfN){
			var number = lOfN[num][0];
			
			var numbers = []
			var factorName = (($("#cases-" + number)[0].className).split(' ')[1])
			$("." + factorName).each(function(index, ele) {
				var id = ele.id.split('-')[1]

				var cases = ele.value;

				caseTot += parseInt(cases);

				numbers.push(id);
				
		
		
			});
	
		
			for (n in numbers) {
				var number = numbers[n]
					var p = {}	
					p.low = 1;
					p.high =  $('#cases'  + '-' + number).val();
					p.count = parseInt($("#totalCases").html().split(':')[1])
					p.step = 1;
					var caseCount = $("#cases-" + number).val();
					p.percentage = caseCount/(caseTot *1.0);
					idvCaseTot += caseCount;
					var d1 = []; 
					
					for (var i = p.low; i <= p.high; i += p.step) {
						d1.push([i, EME.uniformDensity(p.low,p.high,p.count,p.step, p.percentage)]);
					}
					
					

					for (tuple in d1){
						d[d1[tuple][0]] = d[d1[tuple][0]] + d1[tuple][1] ||  d1[tuple][1];
					
					}
				
			

				
			}	
		}
		
		for (tuple in d){
				e.push([tuple, d[tuple]])
			
			
			}
		
		$.plot($("#plot"), [e], {xaxis:{tickDecimals:0 }});	
		
		
		EME.modelDataRanges[factorName] = [e,idvCaseTot];
	
	
	
	},
	//Type must be consistance accross input
	plotDist: function(lOfN){
	
	
		d = {}
		e = []
		
		var type = lOfN[0][1];
		var caseTot = 0;
		var idvCaseTot = 0;
		for (num in lOfN){
			var number = lOfN[num][0];
			var numbers = []
			var factorName = (($("#cases-" + number)[0].className).split(' ')[1])
			$("." + factorName).each(function(index, ele) {
				var id = ele.id.split('-')[1]

				var cases = ele.value;

				caseTot += parseInt(cases);

				numbers.push(id);
				
		
		
			});
	
		
			for (n in numbers) {
				var number = numbers[n]
					var p = {}	
					p.low = parseInt($( "#slider-range" + '-' + number).slider( "values", 0 ),10);
					p.high =  parseInt($( "#slider-range" + '-' + number).slider( "values", 1 ),10);
					p.count = parseInt($("#totalCases").html().split(':')[1])
					p.dist = $('input[name=dist-' + number +']:checked').val();
					p.mean = ((p.low + p.high)/2.0);
					p.step = 1;
					var caseCount = $("#cases-" + number).val();
					p.percentage = caseCount/(caseTot *1.0);
					idvCaseTot += caseCount;
					var d1 = []; 
					if (p.dist == "Normal"){
						for (var i = p.low; i <= p.high; i += p.step) {
							d1.push([i, EME.normalDensity(i, p.mean ,(p.high - p.low)/10, p.count, p.percentage)]);
						}
					
					}
					else if(p.dist == "Equal"){
						for (var i = p.low; i <= p.high; i += p.step) {
							d1.push([i, EME.uniformDensity(p.low,p.high,p.count,p.step, p.percentage)]);
						}
					
					}
					

					for (tuple in d1){
						d[d1[tuple][0]] = d[d1[tuple][0]] + d1[tuple][1] ||  d1[tuple][1];
					
					}
				
			

				
			}	
		}
		
		for (tuple in d){
				e.push([parseInt(tuple), d[tuple]])
			
			
			}
		
		$.plot($("#plot"), [e], {xaxis:{tickDecimals:0 }});	
		
		if (type =="RANGE") {
			
			EME.modelDataRanges[factorName] = [[[e[0][0] + "-" + e[e.length - 1][0],1/numbers.length]],idvCaseTot];
		}
		else {
			EME.modelDataRanges[factorName] = [e,idvCaseTot];
		
		}
		
		
	
	
	},
	
	normalDensity: function (x, Mean, StdDev, count, percentage){
		var a = x - Mean;
		return (Math.exp(-(a * a) / (2 * StdDev * StdDev)) / (Math.sqrt(2 * Math.PI) * StdDev)) * 1 * percentage; //1 is a standin for count when not wanting to display individual count
	},
	
	
	uniformDensity: function (low,high,count, step, percentage){
		return (1/((high-low)*step)) * percentage;  //1 is a standin for count when not wanting to display individual count
	},
	
	cartesian: function (arg) {
		var r = [], max = arg.length-1;
		function helper(arr, i) {
			for (var j=0, l=arg[i].length; j<l; j++) {
				var a = arr.slice(0); // clone arr
				a.push(arg[i][j])
				if (i==max) {
					r.push(a);
				} else
					helper(a, i+1);
			}
		}
		helper([], 0);
		return r;
	},
	
	 normalize: function(arr, max) {
		// find the max value
		var m = 0;
		for(var x=0; x<arr.length; x++) m = Math.max(m, arr[x]);
		// find the ratio
		var r = max / m;
		// normalize the array
		for(var x=0; x<arr.length; x++) arr[x] = arr[x] * r;
		return arr;
	},
	
	 normalizeData: function(arr, max) {
		// find the max value
		var m = 0;
		for(var x=0; x<arr.length; x++) m = Math.max(m, arr[x][1]);
		// find the ratio
		var r = max / m;
		// normalize the array
		for(var x=0; x<arr.length; x++) arr[x][1] = arr[x][1] * r;
		return arr;
	},
	
	sampleData: function(arr, nsamples){
		//arr = [[value, probability] ....]
		nsamples = parseInt(nsamples);
		console.log("Sampling " + nsamples + " from: ")
		console.log(arr)
		var count = 0;
		var samplebin = [];
		var samples = [];
		//Create an array that has possible samples duplicated a number of times
		//relative to their probability
		for(var x=0; x<arr.length; x++){
			count =  Math.round(arr[x][1] * 1000);
			for(var j=0; j< count; j++){
				samplebin.push(arr[x][0])
			
			}
		}
		console.log("SampleBin: ");
		console.log(samplebin);
		var length = samplebin.length
		//Randomly select a sample from the list
		for (var x=0; x<nsamples; x++){
			length = samplebin.length;
			rN = Math.floor(Math.random() * (length + 1));
			var sample = samplebin[rN]
			samples.push(sample)
			//Remove all instances of that sample from the list for sampling w/out replacement
			for (var i=samplebin.length-1; i>=0; i--) {
				if (samplebin[i] === sample) {
					samplebin.splice(i, 1);
				}
			}

		}
		console.log("Samples: ");
		console.log(samples);
		
		return samples;
		
	
	
	
	},
	
	
	
	
	
	
	generateModelRuns: function(){
		var datas = [];
		var mName = $('#modelSelector').val();
		var model = EME.modelsDic[mName];
		var modelInputs = [];
		var modelInputList = [];
		
		
		//model.inputs.sort();
		for (i in model.inputs){
			
			var input = model.inputs[i];
			modelInputs.push(input.name);

		
		}
		//Ensures that the values and names will match up
		//modelInputs.sort();
		
		
		
		
		for (d in EME.modelDataRanges){
			datas.push(EME.sampleData(EME.modelDataRanges[d][0],EME.modelDataRanges[d][1]));
		
		}
		
		console.log("Datas");		
		console.log(datas);
		var cart = EME.cartesian(datas);
		console.log("Cart");
		console.log(cart);
		for (c in cart){
			//TODO make zip JS
			function zip(arrays) {
				return arrays[0].map(function(_,i){
					return arrays.map(function(array){return array[i]})
				});
			}
			
			var cobj = {}
			for (i in cart[c]){
				cobj[modelInputs[i]] = cart[c][i];
			
			}
			modelInputList.push(cobj)
			
		
		
		}
		//Send post to DS
		EME.sendModelRuns(modelInputList)

	
	
	
	
	},
	
	sendModelRuns: function(runs){
	
	
		var fake =  [{
		  "InputNode1" : {
		  "name" : "InputNode1",
		  "properties" : {
		  "checked" : "true"

		  
		  },
		  "id" : null,
		  "type" : "CHECKBOX"
		  },
		  "InputNode2" : {
		  "name" : "InputNode2",
		  "properties" : {
		  "min" : "1",
		  "max" : "5",
		  "value" : "3"
		  },
		  "id" : null,
		  "type" : "SIMPLE"
		  },
		  "InputNode3" : {
		  "name" : "InputNode3",
		  "properties" : {
		  "min" : "0",
		  "max" : "10",
		  "high" : "7",
		  "low" : "626262"
		  },
		  "id" : null,
		  "type" : "RANGESLIDER"
		  }
		}];

		console.log("Sending Runs");
		console.log({runs:runs});
		console.log("JSON")
		console.log(JSON.stringify(runs));
		$('#results').html('<img src="./images/loading.gif" />')
		$.ajax({
		   type: "POST",
		   data: JSON.stringify(runs),
		   url: EME.hostName + "crystal-a2c2/eme/models/" + EME.currentModel.id + "/run",
		   contentType:"application/json;",
		   datatype: "json",
		   success: function(msg){
				var bjid = msg["batchJob"];
				console.log(bjid)
				$('#results').html('Simulation Complete - Scoring Model<img src="./images/loading.gif" />')
				$('#results').html("Finished Job #" + bjid)
				
				//This is for linking to tailorcore 
				if (EME.hostName == "************"){
					$('#results').html("Sending to tailor")
						
						$.ajax({
						   type: "PUT",
						   data: {source: {Url: "***********/crystal-a2c2/eme/resultsets/" + bjid}},
						   url: "***********/tailorcore/sources/********.json",
						   dataType:"json",
						   success: function(msg){
								
								$('#results').html("Finished Job #" + bjid)

						   }
						});
							
						//spit out //sme/resultsets/{id}
				}
			}
		   
		});
		
		
	/*
		post
			success: //Update Page with new Data Source
			failure: //:-(
	*/
	
	}





}