 /**
  * |init_monitoring_page()
  * |	-|showItem(0)
  * | 		-|freshChart(tabSelected)
  * |  		 |	-|loadTimeStamp(timeStampIndex, ListKind, fileSrc)
  * |  		 |		 -|loadListAndGenerateObj(index, ListKind, fileSrc)
  * |    	 |			-|processSrcArr(tmp_src_arr)
  * |   	 |			-|reInitDivAndChart(ListKind, chartsNum)
  * | 		 |			-|setDataJSONArray(src, ChartNum, lineNum, finalChart, finalChartLength)
  * |      	 |				-|getOption(ChartNum)
  * |     	 |			 		-|getLegendData(ChartNum)
  * |      	 |					-|getSeries(ChartNum)
  * |      	 |					-|getData(datumArray)
  * | 		-|setTimeout("updateChartData()", 5000)
  * | 		 |	-|updateChartData()
  *	|		 |	-|freshChart(tabSelected)
  * |		 |	-|setTimeout("updateChartData()", 5000)
  * |addEventListener(reize,function(){})
  * |
  * |onClick="showItem(index)"
  *	|	-|showItem(index)
  * |linesChanged(num)
  * |	-|freshChart(tabSelected)
  * |	-|setTimeout("updateChartData()", 5000)
  * |onkeydown="linesEnterSumbit()"
  * |	-|freshChart(tabSelected)
  * |	-|setTimeout("updateChartData()", 5000);
  */

 /**
  * store date of each dataSrc file,
  * the JSON architetture of dataJSONObject is:
  *
  * dataJSONObject : {
  * 	cpu_load_div_chart_0 : {
  * 		No_0 : {
  * 			data : [
  * 				0 : "2015-07-15_15-19-51   98.44% ",
  * 				1 : "2015-07-15_15-20-57   98.42% ",
  * 				2 : "2015-07-15_15-21-52   98.42% ",
  * 				...
  * 				],
  * 			seriesName : "../../xinguojibolanzhongxin6haoAL14W_cpuload",
  * 			previousLastDatum : previousLastDatum
  * 		},
  * 		No_1: {},
  * 		No_2: {},
  * 		No_3: {},
  * 		No_4: {},
  * 		Title: "ALU eNB Cluster CPU Load Monitoring",
  * 		eChart: i,
  * 		length: 5,
  * 		Label: "CPU Idle"
  * 	},
  * 	cpu_load_div_chart_1{},
  * 	dl_tp_div_chart_0{},
  * 	dl_tp_div_chart_1{},
  * 	...
  * }
  */
 var dataJSONObject = {};

 /**Numbers of lines in each chart*/
 var linesEachChart = 5;
 /**Numbers of charts in each line*/
 var chartsEachLine = 2;

 /**Store the backup of src_arr, src_arr is an array that stores listFile */
 var bak_src_arr = {};
 /**backup to store the last datum of previous file
  * web can find which data is newdata and shoule be added into chart
  * by comparing previousLastDatum with new file,
  */
 var previousLastDatum;

 /**indicate whether the web should refreash or just add new data*/
 var addDataMode = false;
 /**force the web to refreash*/
 var needFresh = true;
 /**incidate while the web has resize, then inform each chart to resise itself */
 var needResize = [];
 /**
  * idicator that store the chosen tab, including:
  * [ue_no_div, cpu_load_div, total_ue_div, dl_tp_div, ul_tp_div]
  */
 var tabSelected;

 /**
  * TimeOut is for save the instance of setTimeOut
  */
 var TimeOut;

 /**
  * Array for store timeStamp of each tab.
  */
 var timeStamp = [];

 /**
  * Main function, doing these:
  * 1. configure paths,
  * 2. initailize component,
  * 3. execute showitem(0) to present the first test item,
  * 4. add addEventListene to window of explorer,which is used to inform
  *    charts to resize themselves according the size of window.
  */
 function init_monitoring_page() {
  	if (window["console"]) {
 		console.log("Start Init");
 	} else {
 		alert("Internet Explorer doesn't support full function,\n please change to Chrome or Firefox");
 	}
 	console.debug("enter function: init_monitoring_page()");

 	// Path configure
 	require.config({
 		paths : {
 			echarts : 'echarts-2.2.7/build/dist'
 		}
 	});
 	for (var i in itemList) {
 		var div = document.createElement("div");
 		div.setAttribute("id", itemList[i]["div"]);
 		document.getElementById("main").appendChild(div);
 		var li = document.createElement("li");
 		var a = document.createElement("a");
 		li.setAttribute("id", itemList[i]["id"] + "_li");
 		a.innerHTML = itemList[i]["name"];
 		a.setAttribute("onclick", "showItem(" + i + ");");
 		a.setAttribute("href", "javascript:void(0)");
 		a.setAttribute("id", itemList[i]["id"]);
 		li.appendChild(a);
 		document.getElementById("itemDropDown").appendChild(li);
 	}
 	showItem(0);
 	if (window.addEventListener) {
 		window.addEventListener("resize", function () {
 			for (var i in itemList) {
 				needResize[i] = true;
 			}
 			console.log("tabSelected is " + tabSelected);
 			if (tabSelected >= 0) {
 				resizeChart();
 				needResize[tabSelected] = false;
 			}
 		});
 	}
 	console.debug("exit function: init_monitoring_page()");
 }

 /**
  *  Load corresponding timeStamp according to timeStampIndex,
  *  if and only if the timeStamp has changed, then calling loadListAndGenerateObj
  *  to read listFile.
  */
 function loadTimeStamp(timeStampIndex, ListKind, fileSrc) {
 	console.debug("enter function: loadTimeStamp(timeStampIndex, ListKind, fileSrc)");
 	var xmlhttp;
 	if (window.XMLHttpRequest) { // code for IE7+, Firefox, Chrome, Opera, Safari
 		xmlhttp = new XMLHttpRequest();
 	} else { // code for IE6, IE5
 		xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
 	}
 	xmlhttp.onreadystatechange = function () {
 		if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
			console.debug("loadTimeStamp: xmlhttp.readyState == 4 && xmlhttp.status == 200");
 			var mTimeStamp = xmlhttp.responseText.replace(/\s+/g, "");
 			console.log("timeStamp is: " + mTimeStamp);
 			if (timeStamp[timeStampIndex] != mTimeStamp) {
 				timeStamp[timeStampIndex] = mTimeStamp;
 				var index = timeStampIndex;
 				loadListAndGenerateObj(index, ListKind, fileSrc);
 			} else {
 				if (needResize[timeStampIndex] == true) {
 					resizeChart();
 					needResize[timeStampIndex] = false;
 				}
 			}
 		}
 	}
 	xmlhttp.open("GET", timeStampFilePath, true);
 	xmlhttp.setRequestHeader("If-Modified-Since", "0");
 	xmlhttp.send();
 	console.debug("exit function: loadTimeStamp(timeStampIndex, ListKind, fileSrc)");
 }

 /**
  * Load fileList file,
  * if the fileList hasn't changed, then go into the addDataMode,
  * if not, refeash charts.
  */
 function loadListAndGenerateObj(index, ListKind, fileSrc) {
 	console.debug("enter function: loadListAndGenerateObj(index, ListKind, fileSrc)");
 	var xmlhttp;
 	if (window.XMLHttpRequest) { // code for IE7+, Firefox, Chrome, Opera, Safari
 		xmlhttp = new XMLHttpRequest();
 	} else { // code for IE6, IE5
 		xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
 	}
 	xmlhttp.onreadystatechange = function () {
 		if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
			console.debug("loadListAndGenerateObj: xmlhttp.readyState == 4 && xmlhttp.status == 200");
 			var tmp_src_arr = xmlhttp.responseText.split(/[\r\n]+/g);
 			var src_arr = processSrcArr(tmp_src_arr, index);
 			console.log("src_arr.length: " + src_arr.length);
 			var chartsNum = Math.ceil(src_arr.length / linesEachChart);
 			if (bak_src_arr[index]
 				 && bak_src_arr[index].toString() == src_arr.toString()
 				 && needFresh != true) {
 				console.log("src_arr not changed");
 				addDataMode = true;
 			} else {
 				needFresh = false;
 				console.log("src_arr changed, reInitDivAndChart()");
 				reInitDivAndChart(ListKind, chartsNum, index);
 				bak_src_arr[index] = src_arr;
 				addDataMode = false;
 				deleteRedundant(ListKind, chartsNum);
 			}
 			var finalChart = false;
 			//outer Loop, create serval charts according to src_arr.length and linesEachChart
 			for (var i = 0; i < chartsNum; i++) {
 				if (i == chartsNum - 1) {
 					//indicate this term in the final of loop.
 					finalChart = true;
 				}
 				dataJSONObject[ListKind + "_chart_" + i]["length"] = 0;
 				//innder loop, call setDataJSONArray to load files of each chart's data
 				for (var j = i * linesEachChart; j < (i + 1) * linesEachChart && j < src_arr.length; j++) {
 					console.log(j + "th TextSrc:" + src_arr[j] + "  of " + fileSrc);
 					var finalChartLength = src_arr.length % linesEachChart;
 					setDataJSONArray(dataFilePathPrefix + src_arr[j], ListKind + "_chart_" + i, "No_" + (j - i * linesEachChart), finalChart, finalChartLength);
 				}
 			}
 		}
 	}
 	xmlhttp.open("GET", fileSrc, true);
 	xmlhttp.setRequestHeader("If-Modified-Since", "0");
 	xmlhttp.send();
 	console.debug("exit function: loadListAndGenerateObj(index, ListKind, fileSrc)");
 }

 /**
  * 1. Delete all the <Div> tags in parent node(including "ue_no_div","cpu_load_div","total_ue_div",...)
  * then reinitialize <Div>.
  * <div>'s parent node is based on ListKind,
  * <div>'s number is based on chartsNum,
  * <div>'s size is based on chartsEachLine.
  *
  * 2. reinitialize each chart's JSON object
  */
 function reInitDivAndChart(ListKind, chartsNum, index) {
 	console.debug("enter function: reInitDivAndChart(ListKind, chartsNum)");
 	var parentNode = document.getElementById(ListKind);
 	while (parentNode.lastChild) {
 		parentNode.removeChild(parentNode.lastChild);
 	}
 	for (var i = 0; i < chartsNum; i++) {
 		//reInitialize div according whether chartsEachLine is 1 or 2.
 		var node = document.createElement("div");
 		var hr = document.createElement("hr");
 		if (chartsEachLine == 1) {
 			node.setAttribute("id", ListKind + "_chart_" + i);
 			node.setAttribute("class", "col-xs-12 col-sm-12 col-md-12");
 			//node.style.width = "80%";
 			node.style.height = (window.innerWidth || document.body.clientWidth) * 2 / 5 + "px";
 			document.getElementById(ListKind).appendChild(node);
 			hr.setAttribute("style", "color : 000000");
 			hr.style.width = "100%";
 			document.getElementById(ListKind).appendChild(hr);
 		} else {
 			node.setAttribute("id", ListKind + "_chart_" + i);
 			node.setAttribute("class", "col-xs-6 col-sm-6 col-md-6  ");
 			node.style.height = (window.innerWidth || document.body.clientWidth) * 5 / 16 + "px";
 			document.getElementById(ListKind).appendChild(node);
 			if ((i + 1) % 2 == 0 || i == chartsNum - 1) {
 				hr.setAttribute("style", "color : #000000");
 				hr.style.width = "100%";
 				document.getElementById(ListKind).appendChild(hr);
 			}
 		}
 		//var Title = itemList[index]["title"];
                var Title = "";
 		var yLabel = itemList[index]["yLabel"];
 		dataJSONObject[ListKind + "_chart_" + i] = {
 			"Title" : Title,
 			"yLabel" : yLabel,
 		};
 	}
 	console.debug("exit function: reInitDivAndChart(ListKind, chartsNum)");
 }

 /**
  *  load each file and organize these data according to it's ChartNum,lineNum,
  */
 function setDataJSONArray(src, ChartNum, lineNum, finalChart, finalChartLength) {
 	console.debug("enter function: setDataJSONArray(src, ChartNum, lineNum, finalChart, finalChartLength)");
 	var xmlhttp;
 	if (window.XMLHttpRequest) { // code for IE7+, Firefox, Chrome, Opera, Safari
 		xmlhttp = new XMLHttpRequest();
 	} else { // code for IE6, IE5
 		xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
 	}
 	xmlhttp.onreadystatechange = function () {
 		var datumArray = [];
 		if (xmlhttp.readyState == 4) {
 			if (xmlhttp.status == 200) {
				console.debug("loadListAndGenerateObj: xmlhttp.readyState == 4 && xmlhttp.status == 200");
 				var tmp = xmlhttp.responseText;
 				var value_arr = processValueArr(tmp,ChartNum,lineNum,src);
 				for (var i in value_arr) {
 					if (value_arr[i].match(/(\d+-\d+-\d+_)(\d+)-(\d+)-(\d+)\s+(\d+)\r?/g) != null) {
 						datumArray.push(value_arr[i]);
 						//console.log(value_arr[i]);
 					}
 				}
 				if (datumArray.length > maxItemNum) {
 					datumArray.splice(0, datumArray.length - maxItemNum);
 				}
 				dataJSONObject[ChartNum][lineNum]["data"] = datumArray;
 				dataJSONObject[ChartNum]["length"] = dataJSONObject[ChartNum]["length"] + 1;
 			} else if (xmlhttp.status == 404) {
				console.debug("loadListAndGenerateObj: xmlhttp.readyState == 4 && xmlhttp.status == 404");
 				if (addDataMode == false) {
 					dataJSONObject[ChartNum][lineNum] = {};
 					dataJSONObject[ChartNum][lineNum]["seriesName"] = src;
 					dataJSONObject[ChartNum][lineNum]["data"] = datumArray;
 				}
 				dataJSONObject[ChartNum]["length"] = dataJSONObject[ChartNum]["length"] + 1;
 			}
 			console.log("src: " + src + "\nChartNum: " + ChartNum + "\nlineNum: " + lineNum + "\nLength: " + dataJSONObject[ChartNum]["length"]);
 			if (dataJSONObject[ChartNum]["length"] == linesEachChart
 				 || finalChart == true && dataJSONObject[ChartNum]["length"] == finalChartLength) {
 				console.log("Begin to draw");
 				if (addDataMode == true) {
 					var myChart = dataJSONObject[ChartNum]["eChart"];
 					var mySeries = [];
 					mySeries = myChart.getSeries();
 					myChart.addData(getAddData(ChartNum, mySeries));
 				} else {
 					require(
 						[
 							'echarts',
 							'echarts/chart/line', // load-on-demand, don't forget the Magic switch type.
 							'echarts/chart/bar'
 						],
 						function (ec) {
 						// Initialize echart based on prepared DOM
 						var myChart = ec.init(document.getElementById(ChartNum), 'macarons');
 						myChart.setOption(getOption(ChartNum));
 						dataJSONObject[ChartNum]["eChart"] = myChart;
 						//window.onresize = dataJSONObject[ChartNum]["eChart"].resize;
 						//dataJSONObject[ChartNum]["eChart"].setOption(getOption(ChartNum));
 					});
 				}
 			}
 			console.log("-------------------------------------------------");
 		}
 	}
 	xmlhttp.open("GET", src, true);
 	xmlhttp.setRequestHeader("If-Modified-Since", "0");
 	xmlhttp.send();
 	console.debug("exit function: setDataJSONArray(src, ChartNum, lineNum, finalChart, finalChartLength)");
 }

 /**
  *  get Option according to ChartNum, the Option is used to render its corresponding chart.
  */
 function getOption(ChartNum) {
	console.debug("enter function: getOption(ChartNum)");
 	var option = {
 		title : {
 			text : dataJSONObject[ChartNum]["Title"],
 			x : 10,
 			y : 5,
 			TextStyle : {
 				fontSize : 15
 			}
 		},
 		tooltip : {
 			trigger : 'item',
 			formatter : function (params) {
 				var date = new Date(params.value[0]);
 				timeData = 'Time: ' + date.getFullYear() + '-'
 					 + (date.getMonth() + 1) + '-'
 					 + date.getDate() + ' '
 					 + date.getHours() + ':'
 					 + (date.getMinutes() / 10 < 1 ? "0" + date.getMinutes() : date.getMinutes()) + ':'
 					 + (date.getSeconds() / 10 < 1 ? "0" + date.getSeconds() : date.getSeconds());

 				return timeData + '<br/>'
 				 + 'Value: ' + params.value[1]
 			},
 			textStyle : {
 				align : 'left'
 			},
 		},
 		toolbox : {
 			show : true,
 			feature : {
 				mark : {
 					show : true,
 					lineStyle : {
 						color : '#000000',
 						type : 'solid',
 						width : 4,
 						shadowColor : 'rgba(f,f,0,0)'
 					},
 				},
 				dataView : {
 					show : true,
 					readOnly : false
 				},
 				magicType : {
 					show : true,
 					type : ['line', 'bar']
 				},
 				restore : {
 					show : true
 				},
 				saveAsImage : {
 					show : true
 				}
 			}
 		},
 		animation : true,
 		dataZoom : {
 			show : true,
 			start : 0
 		},
 		legend : {
 			data : getLegendData(ChartNum),
 			orient : 'vertical',
 			x : 'right',
 			y : '8%',
 			itemGap : 2,

 		},
 		grid : {
 			x : '8%',
 			x2 : '5%',
 			y : '12%',
 			y2 : '18%'
 		},
 		xAxis : [{
 				type : 'time',
 				splitNumber : 10
 			}
 		],

 		yAxis : [{
 				type : 'value',
 				name : dataJSONObject[ChartNum]["yLabel"],
 				nameLocation : 'end',
 				nameTextStyle : {
 					fontSize : 15,
 					fontColor : '#000000'
 				}
 			}
 		],
 		series : getSeries(ChartNum)
 	};
	console.debug("exit function: getOption(ChartNum)");
 	return option;
 }

 /**
  * Get the Series of every Chart from dataJSONObject
  */
 function getSeries(ChartNum) {
	console.debug("enter function: getSeries(ChartNum)");
 	var series = [];
 	for (var i = 0; i < dataJSONObject[ChartNum]["length"]; i++) {
 		series.push({
 			name : dataJSONObject[ChartNum]["No_" + i]["seriesName"].slice(dataJSONObject[ChartNum]["No_" + i]["seriesName"].lastIndexOf('/') + 1, dataJSONObject[ChartNum]["No_" + i]["seriesName"].lastIndexOf('_')),
 			type : 'line',
 			showAllSymbol : true,
 			symbol : 'circle',
 			symbolSize : 1,
 			data : getData(dataJSONObject[ChartNum]["No_" + i]["data"])
 		});
 	}
 	//console.log(series);
	console.debug("exit function: getSeries(ChartNum)");
 	return series;
 }

 /**
  * Get the data of Series from dataJSONObject
  */
 function getData(datumArray) {
	console.debug("enter function: getData(datumArray)");
 	var data = [];
 	for (var i in datumArray) {
 		data.push(getDateAndValue(datumArray[i])); //Value
 	}
	console.debug("enter function: getData(datumArray)");
 	return data;
 }
 
 /**
  * Get the data to be added from dataJSONObject
  */
 function getAddData(ChartNum, mySeries) {
	console.debug("enter function: getAddData(ChartNum, mySeries)");
 	console.log("previous data is: ");
 	console.log(mySeries);
 	var AddData = [];
 	for (var i = 0; i < dataJSONObject[ChartNum]["length"]; i++) {
 		for (var j in dataJSONObject[ChartNum]["No_" + i]["data"]) {
 			AddData.push([
 					i, //seriesIndex
 					getDateAndValue(dataJSONObject[ChartNum]["No_" + i]["data"][j]),
 					false,
 					(mySeries[i]["data"].length + parseInt(j)) >= maxItemNum ? false : true
 				]);
 			console.log(mySeries[i]["data"].length + parseInt(j));
 			console.log((mySeries[i]["data"].length + j) >= maxItemNum);
 		}
 	}
 	console.log("AddData is:\n");
 	console.log(AddData);
	console.debug("exit function: getAddData(ChartNum, mySeries)");
 	return AddData;
 }

 /**
  * Get the Legend of every Chart from dataJSONObject
  */
 function getLegendData(ChartNum) {
	console.debug("enter function: processValueArr(tmp,ChartNum,lineNum,src)");
 	var data = [];
 	for (var i = 0; i < dataJSONObject[ChartNum]["length"]; i++) {
 		console.log("getLegendData " + dataJSONObject[ChartNum]["No_" + i]["seriesName"]);
 		data.push(dataJSONObject[ChartNum]["No_" + i]["seriesName"].slice(dataJSONObject[ChartNum]["No_" + i]["seriesName"].lastIndexOf('/') + 1, dataJSONObject[ChartNum]["No_" + i]["seriesName"].lastIndexOf('_')));
 	}
 	//console.log("getLegendData " + data);
	console.debug("exit function: processValueArr(tmp,ChartNum,lineNum,src)");
 	return data;
 }

/**
 * Procedd datum string to get year, month, day, hour, minute, second and value
 */
 function getDateAndValue(datum) {
	console.debug("enter function: getDateAndValue(datum)");
 	var dateAndValue = [
 		new Date(
 			parseInt(datum.replace(/(\d+)-(\d+)-(\d+)_(\d+)-(\d+)-(\d+)\s+(\d+)\r?/g, "$1")), //Year
 			parseInt(datum.replace(/(\d+)-(\d+)-(\d+)_(\d+)-(\d+)-(\d+)\s+(\d+)\r?/g, "$2")) - 1, //Month
 			parseInt(datum.replace(/(\d+)-(\d+)-(\d+)_(\d+)-(\d+)-(\d+)\s+(\d+)\r?/g, "$3")), //Day
 			parseInt(datum.replace(/(\d+)-(\d+)-(\d+)_(\d+)-(\d+)-(\d+)\s+(\d+)\r?/g, "$4")), //Hour
 			parseInt(datum.replace(/(\d+)-(\d+)-(\d+)_(\d+)-(\d+)-(\d+)\s+(\d+)\r?/g, "$5")), //Minute
 			parseInt(datum.replace(/(\d+)-(\d+)-(\d+)_(\d+)-(\d+)-(\d+)\s+(\d+)\r?/g, "$6")) //Second
 		),
 		parseInt(datum.replace(/(\d+)-(\d+)-(\d+)_(\d+)-(\d+)-(\d+)\s+(\d+)\r?/g, "$7"))] //value
	console.debug("exit function: getDateAndValue(datum)");
 	return dateAndValue;
 }

 /**
  * Process the raw src_arr, only return src names of true format (with true suffix),
  */
 function processSrcArr(tmp_src_arr, index) {
	console.debug("enter function: processSrcArr(tmp_src_arr, index)");
 	var src_arr = [];
 	var count = 0;
 	for (var i in tmp_src_arr) {
 		console.log("tmp_src_arr[" + i + "]: " + tmp_src_arr[i]);
 		if (tmp_src_arr[i].match(itemList[index]["suffix"])) {
 			src_arr[count] = tmp_src_arr[i];
 			count++;
 		}
 	}
	console.debug("exit function: processSrcArr(tmp_src_arr, index)");
	return src_arr;
 }

 /**
  * Process the raw tmp arr, 
  * if addDataMode == true, only return the new data,
  * if not, read all the data and return.
  */
 function processValueArr(tmp,ChartNum,lineNum,src) {
	console.debug("enter function: processValueArr(tmp,ChartNum,lineNum,src)");
    var value_arr = [];
	if (addDataMode == true) {
 		var tmp_value_arr = tmp.split(/[\r\n]+/g);
 		if (dataJSONObject[ChartNum][lineNum]["data"].length != 0) {
 			dataJSONObject[ChartNum][lineNum]["previousLastDatum"] = dataJSONObject[ChartNum][lineNum]["data"].pop();
 		}
 		console.log(dataJSONObject[ChartNum][lineNum]["previousLastDatum"]);
 		var previousLastIndex = tmp_value_arr.indexOf(dataJSONObject[ChartNum][lineNum]["previousLastDatum"]);
 		console.log("Find previousLastDatum:  " + dataJSONObject[ChartNum][lineNum]["previousLastDatum"] + "\nAt " + (previousLastIndex + 1) + " of previous data");
 		value_arr = tmp_value_arr.slice(previousLastIndex + 1);
 	} else {
 		dataJSONObject[ChartNum][lineNum] = {};
 		dataJSONObject[ChartNum][lineNum]["seriesName"] = src;
 		value_arr = tmp.split(/[\r\n]+/g);
 	}
	console.debug("exit function: processValueArr(tmp,ChartNum,lineNum,src)");
 	return value_arr;
 }
 
 /**
  *  Only freas and present the chosen kind of data by set tabSelected, .
  *  Other tab will store previes chart data,
  *  every time that showItem is called,
  *  Previous TimeOut will be cleared and set a new one.
  *
  *  After that freshChart(tabSelected) will be called.
  */
 function showItem(index) {
	console.debug("enter function: showItem(index)");
 	if (index != tabSelected) {
 		if (TimeOut != null) {
 			clearTimeout(TimeOut);
 		}
 		for (var i in itemList) {
 			document.getElementById(itemList[i]["div"]).style.display = "none";
 			document.getElementById(itemList[i]["id"] + "_li").removeAttribute("class");
 		}
 		//Show the target only.
 		document.getElementById(itemList[index]["div"]).style.display = "block";
 		document.getElementById(itemList[index]["id"] + "_li").setAttribute("class", "active");
 		tabSelected = index;
 		freshChart(tabSelected)
 		//calling updateChartData() periodically
 		TimeOut = setTimeout("updateChartData()", 5000);
 	}
	console.debug("enter function: showItem(index)");
 }

 /**
  * Update periodically
  */
 function updateChartData() {
	console.debug("enter function: updateChartData()");
 	/**
 	 *
 	 * since it takes time to read file,
 	 * if the timeout value set too small,
 	 * the updateChartData() may start before last operation finished,
 	 * set the interval to greater than 10s.)
 	 *
 	 * After introducing timeStamp to verify whether file has been modified,
 	 * there is no problem in setting timeout value.
 	 */
 	freshChart(tabSelected)
 	TimeOut = setTimeout("updateChartData()", 5000);
	console.debug("exit function: updateChartData()");
 }

 /**
  * Called by 'selectedBtn' button, change the value of linesEachChart
  * then fresh chart and reset TimeOut
  */
 function linesChanged(lines) {
	console.debug("enter function: linesChanged(lines)");
 	if (linesEachChart != lines) {
 		for (var i = 1; i <= 5; i++) {
 			document.getElementById("changeLineNum_" + i).removeAttribute("class");
 		}
 		if (lines >= 1 && lines <= 5) {
 			document.getElementById("changeLineNum_" + lines).setAttribute("class", "active");
 		}
 		needFresh = true;
 		linesEachChart = lines;
 		timeStamp = [];
 		if (TimeOut != null) {
 			clearTimeout(TimeOut);
 		}
 		freshChart(tabSelected)
 		TimeOut = setTimeout("updateChartData()", 5000);
 	}
	console.debug("exit function: linesChanged(lines)");
 }

 /**
  * Called by 'inputLines' inputbox,
  * listen to keycode, when enter the "enter" key, calls linesEnterButton();
  */
 function linesEnterSumbit() {
	console.debug("enter function: linesEnterSumbit()");
 	var event = arguments.callee.caller.arguments[0] || window.event; //Consider different Explorer
 	if (event.keyCode == 13) {
 		linesEnterButton();
 	}
	console.debug("exit function: linesEnterSumbit()");
 }

 /**
  * Called by Button or linesEnterSumbit(), get value of inputbox, then calls linesChanged();
  */
 function linesEnterButton() {
	console.debug("enter function: linesEnterButton()");
 	var lines = document.getElementById("inputLines").value;
 	if (parseInt(lines)) {
 		linesChanged(lines);
 		document.getElementById("inputLines").value = "";
 	} else {
 		alert("Please valid number and try again");
 	}
	console.debug("enter function: linesEnterButton()");
 }

 /**
  * Called by 'chartsChanged' button, change the value of chartsEachLine
  * then fresh chart and reset TimeOut
  */
 function chartsChanged(charts) {
	console.debug("enter function: chartsChanged(charts)");
 	needFresh = true;
 	chartsEachLine = charts;
 	timeStamp = [];
 	if (TimeOut != null) {
 		clearTimeout(TimeOut);
 	}
 	freshChart(tabSelected)
 	for (var i = 1; i <= 2; i++) {
 		document.getElementById("changeChartNum_" + i).removeAttribute("class");
 	}
 	document.getElementById("changeChartNum_" + charts).setAttribute("class", "active");
 	document.getElementById("changeChartNum_" + i)
 	TimeOut = setTimeout("updateChartData()", 5000);
	console.debug("exit function: chartsChanged(charts)");
 }

 /**
  * fresh the selected Chart, set variabies of
  * timeStampIndex: indicate the index of this elemenent in timeStamp[],
  * ListKind: indicate which kind of these charts,
  * fileSrc: store the file path of the fileList file.
  */
 function freshChart(tabSelected) {
	console.debug("enter function: freshChart(tabSelected)");
 	var timeStampIndex = tabSelected;
 	var ListKind = itemList[tabSelected]["div"];
 	var fileSrc = itemList[tabSelected]["fileSrc"];
 	loadTimeStamp(timeStampIndex, ListKind, fileSrc);
	console.debug("exit function: freshChart(tabSelected)");
 }

/**
 * Resize chart, called while browser'swindow has resized.
 */
 function resizeChart() {
	console.debug("enter function: resizeChart()");
 	console.log("Start resizeChart()");
 	for (var i in dataJSONObject) {
 		if (i.match(itemList[tabSelected]["div"])) {
 			if (chartsEachLine == 2) {
 				document.getElementById(i).style.height = (window.innerWidth || document.body.clientWidth) * 5 / 16 + "px";
 			} else if (chartsEachLine == 1) {
 				document.getElementById(i).style.height = (window.innerWidth || document.body.clientWidth) * 2 / 5 + "px";
 			}
 			dataJSONObject[i]["eChart"].resize();
 		}
 	}
	console.debug("exit function: resizeChart()");
 }

 /**
  * Use following loop to dispose redundant EChart instances and delede corresponding object
  * instead of dataJSONObject = {};
  */
 function deleteRedundant(ListKind, chartsNum) {
	console.debug("enter function: deleteRedundant(ListKind, chartsNum)");
 	for (var i in dataJSONObject) {
 		if (i.match(ListKind)
 			 && parseInt(i.replace(/.*_chart_(\d+)/g, "$1")) >= chartsNum) {
 			console.log("delete object and dispose chart");
 			console.log(dataJSONObject[i]["eChart"]);
 			console.log(dataJSONObject[i]);
 			if (dataJSONObject[i]["eChart"]
 				 && dataJSONObject[i]["eChart"].dispose) {
 				dataJSONObject[i]["eChart"].dispose();
 			}
 			delete dataJSONObject[i];
 		}
 	}
	console.debug("exit function: deleteRedundant(ListKind, chartsNum)");
 }

 function log(msg) {
 	if (window["console"]) {
 		console.log(msg);
 	}
 }
