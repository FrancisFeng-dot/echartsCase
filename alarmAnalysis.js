window.onload = function() {
	/*layui.use('laydate', function() {
		var laydate = layui.laydate;
		laydate.render({
			elem: '#calendertime1'
		});
	});
	layui.use('laydate', function() {
		var laydate = layui.laydate;
		laydate.render({
			elem: '#calendertime2'
		});
	});*/
	//查询曲线图
	queryTrendData();
	//获取增长率
	queryAlarmpercent();
};
function requestbeginandend() {
    var date1 = new Date();
    var endTimeStr = date1.format("yyyy-MM-dd");
    date1.setMonth(date1.getMonth() - 3 + 1);
    var year1 = date1.getFullYear();
    var month1 = date1.getMonth() + 1;
    month1 = (month1 < 10 ? "0" + month1 : month1);
    var sDate = (year1.toString() + '-' + month1.toString());
    var startTimeStr = sDate + "-01";
    var getstartenddate = [];
    getstartenddate.push({'start':startTimeStr,'end':endTimeStr});
    $("#calendertime1").val(startTimeStr);
    $("#calendertime2").val(endTimeStr);
    return getstartenddate;
}
var myChart; //告警趋势
//初始化调用者方法，查询也是也是调用这方法
function query() {
	var query = serializeArrayByForm('query_dataScreening');
	var licenseplate = query['licenseplate'];
	var startTimeStr = query['startTimeStr'];
	var endTimeStr = query['endTimeStr'];
	if (typeof startTimeStr == 'undefined' || startTimeStr == '') {
		alertMessage("请选择开始时间！");
		return;
	}
	if (typeof endTimeStr == 'undefined' || endTimeStr == '') {
		alertMessage("请选择结束时间！");
		return;
	}
	var date1 = new Date(endTimeStr);
	var year1 = date1.getFullYear();
	var month1 = date1.getMonth();
	month1 = (month1 < 10 ? "0" + month1 : month1);
	var sDate = (year1.toString() + '-' + month1.toString());
	var chainratio = sDate + "-01";
	//查询曲线图
	queryTrendData(licenseplate, startTimeStr, endTimeStr);
	//获取增长率
	queryAlarmpercent(licenseplate, chainratio, endTimeStr);
}
/**
 * 查询最近 {latest}个月的告警趋势
 * @param latest
 */
var seriesdata;
function queryTrendData(licenseplate, startTimeStr, endTimeStr) {
    if (typeof startTimeStr == 'undefined' || startTimeStr == '') {
        var getstartenddate = requestbeginandend();
        var startTimeStr = getstartenddate[0]['start'];
        var endTimeStr = getstartenddate[0]['end'];
    }
    if (typeof licenseplate == 'undefined') {
        licenseplate = '';
    }
	$.ajax({
		url: ctx + "/topicAnalysis/alarmAnalysis/testAlarm.do",
		type: "POST",
		dataType: "json",
		data: JSON.stringify({
			vehicle_code: licenseplate,
			start_time: startTimeStr,
			end_time: endTimeStr
		}),
		success: function(data) {
			if(data.code=="300"){
				alertMessage("根据查询条件无相关数据，请核对！");
				return;
			}
			var tablehtml = '<thead><tr><th></th></tr></thead>'
			+'<tbody><tr><td>急加速</td></tr><tr><td>急刹车</td></tr><tr><td>急转弯</td></tr><tr><td>抽烟</td></tr>'
			+'<tr><td>打电话</td></tr><tr><td>左车道偏离</td></tr><tr><td>右车道偏离</td></tr><tr><td>低头</td></tr>'
			+'<tr><td>闭眼</td></tr><tr><td>打哈欠</td></tr><tr><td>前车碰撞警告</td></tr><tr><td>行人探测预警</td></tr><tr><td>偏头</td></tr></tbody>';
			$('#grid_period').html(tablehtml);
			var daterange = []; //时间范围数组
			seriesdata = {
				rapidacceleration: [],
				brakes: [],
				sharpturn: [],
				smoking: [],
				telephone: [],
				leftlane: [],
				rightlane: [],
				bow: [],
				colseeye: [],
				yawn: [],
				frontcar: [],
				pedestrianwarning: [],
				migraine: []
			}; //用来series的数组
			for (var i = 0; i < data.length; i++) {
				daterange.push(data[i]['alarmmonth']);
				seriesdata['rapidacceleration'][i] = data[i]['rapidacceleration'];
				seriesdata['brakes'][i] = data[i]['brakes'];
				seriesdata['sharpturn'][i] = data[i]['sharpturn'];
				seriesdata['smoking'][i] = data[i]['smoking'];
				seriesdata['telephone'][i] = data[i]['telephone'];
				seriesdata['leftlane'][i] = data[i]['leftlane'];
				seriesdata['rightlane'][i] = data[i]['rightlane'];
				seriesdata['bow'][i] = data[i]['bow'];
				seriesdata['colseeye'][i] = data[i]['colseeye'];
				seriesdata['yawn'][i] = data[i]['yawn'];
				seriesdata['frontcar'][i] = data[i]['frontcar'];
				seriesdata['pedestrianwarning'][i] = data[i]['pedestrianwarning'];
				seriesdata['migraine'][i] = data[i]['migraine'];
				var montharr = data[i]['alarmmonth'].split('-');
				if (montharr.length > 0) {
					var month = parseInt(montharr[1]);
				}
				$('#grid_period').children('tbody').children('tr').eq(0).append('<td>' + data[i]['rapidacceleration'] + '</td>');
				$('#grid_period').children('tbody').children('tr').eq(1).append('<td>' + data[i]['brakes'] + '</td>');
				$('#grid_period').children('tbody').children('tr').eq(2).append('<td>' + data[i]['sharpturn'] + '</td>');
				$('#grid_period').children('tbody').children('tr').eq(3).append('<td>' + data[i]['smoking'] + '</td>');
				$('#grid_period').children('tbody').children('tr').eq(4).append('<td>' + data[i]['telephone'] + '</td>');
				$('#grid_period').children('tbody').children('tr').eq(5).append('<td>' + data[i]['leftlane'] + '</td>');
				$('#grid_period').children('tbody').children('tr').eq(6).append('<td>' + data[i]['rightlane'] + '</td>');
				$('#grid_period').children('tbody').children('tr').eq(7).append('<td>' + data[i]['bow'] + '</td>');
				$('#grid_period').children('tbody').children('tr').eq(8).append('<td>' + data[i]['colseeye'] + '</td>');
				$('#grid_period').children('tbody').children('tr').eq(9).append('<td>' + data[i]['yawn'] + '</td>');
				$('#grid_period').children('tbody').children('tr').eq(10).append('<td>' + data[i]['frontcar'] + '</td>');
				$('#grid_period').children('tbody').children('tr').eq(11).append('<td>' + data[i]['pedestrianwarning'] + '</td>');
				$('#grid_period').children('tbody').children('tr').eq(12).append('<td>' + data[i]['migraine'] + '</td>');
				var html = '<th>' + month + '月</th>';
				$('#grid_period').children('thead').children('tr').append(html);
			}
			var option = {
				legend: {
					y: 'center',
					right: '1%',
					orient: 'vertical',
					align: 'left',
					data: ['急加速', '急刹车', '急转弯', '抽烟', '打电话', '左车道偏离', '右车道偏离', '低头', '闭眼', '打哈欠', '前车碰撞警告', '行人探测预警', '偏头'],
					textStyle: {
						color: '#555555',
						fontSize: 13
					}
				},
				grid: {
					x: '8%',
					x2: '20%',
					y: '15%',
					y2: '10%'
				},
                toolbox: {
                    top: 'bottom',
                    left: 'right',
                    show: true,
                    itemSize: 30,
                    feature: {
                        saveAsImage: {
                            icon: 'image://' + ctx + '/img/saveasimage.png'
                        }
                    }
                },
				tooltip: {
					trigger: 'axis',
					axisPointer: {
						type: 'line'
					},
					padding: 10,
					backgroundColor: '#222',
					borderColor: '#777',
					borderWidth: 1
				},
				xAxis: {
					zlevel: 1,
					type: 'category',
					boundaryGap: true,
					name: '月份',
					nameGap: 20,
					nameLocation: 'end',
					nameTextStyle: {
						fontSize: 14,
						color: '#555555',
						fontFamily: 'Helvetica'
					},
					axisLine: {
						lineStyle: {
							color: '#BBBBBB'
						},
						symbol: ['none', 'arrow'],
						symbolOffset: [0, 12]
					},
					axisTick: {
						show: false, //是否显示刻度
						alignWithLabel: true //刻度与标签对齐
					},
					data: daterange
				},
				yAxis: {
					type: 'value',
					boundaryGap: true,
					name: '次数',
					nameLocation: 'end',
					nameGap: 20,
					nameTextStyle: {
						fontSize: 14,
						color: '#555555'
					},
					axisLine: {
						lineStyle: {
							color: '#BBBBBB'
						},
						symbol: ['none', 'arrow'],
						symbolOffset: [0, 12]
					},
					axisTick: {
						show: false, //是否显示刻度
						alignWithLabel: true //刻度与标签对齐
					}
				},
				series: [{
					name: '急加速',
					type: 'line',
					data: seriesdata['rapidacceleration']
				}, {
					name: '急刹车',
					type: 'line',
					data: seriesdata['brakes']
				}, {
					name: '急转弯',
					type: 'line',
					data: seriesdata['sharpturn']
				}, {
					name: '抽烟',
					type: 'line',
					data: seriesdata['smoking']
				}, {
					name: '打电话',
					type: 'line',
					data: seriesdata['telephone']
				}, {
					name: '左车道偏离',
					type: 'line',
					data: seriesdata['leftlane']
				}, {
					name: '右车道偏离',
					type: 'line',
					data: seriesdata['rightlane']
				}, {
					name: '低头',
					type: 'line',
					data: seriesdata['bow']
				}, {
					name: '闭眼',
					type: 'line',
					data: seriesdata['colseeye']
				}, {
					name: '打哈欠',
					type: 'line',
					data: seriesdata['yawn']
				}, {
					name: '前车碰撞警告',
					type: 'line',
					data: seriesdata['frontcar']
				}, {
					name: '行人探测预警',
					type: 'line',
					data: seriesdata['pedestrianwarning']
				}, {
					name: '偏头',
					type: 'line',
					data: seriesdata['migraine']
				}]
			};
			myChart = echarts.init(document.getElementById("institutionsview"));
			myChart.setOption(option);
		},
		error: function(err) {
			console.log(err);
		}
	});
}

function queryAlarmpercent(licenseplate, startTimeStr, endTimeStr) {
    if (typeof startTimeStr == 'undefined' || startTimeStr == '') {
    	var date1 = new Date();
		var endTimeStr = date1.format("yyyy-MM-dd");
		var year1 = date1.getFullYear();
		var month1 = date1.getMonth();
		month1 = (month1 < 10 ? "0" + month1 : month1);
		var sDate = (year1.toString() + '-' + month1.toString());
		var startTimeStr = sDate + "-01";
    }
    if (typeof licenseplate == 'undefined') {
        licenseplate = '';
    }
	$.ajax({
		url: ctx + "/topicAnalysis/alarmAnalysis/getalarmpercent.do",
		type: "POST",
		dataType: "json",
		data: JSON.stringify({
			vehicle_code: licenseplate,
			start_time: startTimeStr,
			end_time: endTimeStr
		}),
		success: function(data) {
			if(data.code=='200') {
                $('.color_pink').html('');
                $('.color_blue').html('');
                data.alarmpercent.sort(function (a, b) {
                    return (a['alarmpercent'] < b['alarmpercent']) ? 1 : -1;
                });
                for (var i = 0; i < data.alarmpercent.length; i++) {
                    if (data.alarmpercent[i]['alarmpercent'] > 0) {
                        var html = '<li><span>' + data.alarmpercent[i]['alarmnamep'] + '</span><div><span>环比增长</span><span>' + data.alarmpercent[i]['alarmpercent'].toFixed(1) + '</span><span>%</span></div></li>';
                        $('.color_pink').append(html);
                    }
                }
                for (var i = data.alarmpercent.length - 1; i >= 0; i--) {
                    if (data.alarmpercent[i]['alarmpercent'] < 0) {
                        var html = '<li><span>' + data.alarmpercent[i]['alarmnamep'] + '</span><div><span>环比下降</span><span>' + (-(data.alarmpercent[i]['alarmpercent'].toFixed(1))) + '</span><span>%</span></div></li>';
                        $('.color_blue').append(html);
                    }
                }
            }
		},
		error: function(err) {
			console.log(err);
		}
	});
}
window.onresize = function() {
	myChart.resize();
}