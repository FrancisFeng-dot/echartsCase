window.onload = function() {
    layui.use('laydate', function() {
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
    });
    queryTrendData();
    queryLatestAWeekData();
    Clampingtree();

};
var option5;
var myChart; //告警趋势
var myChart2; //告警分类汇总
var myChart3; //日均告警量汇总
var myChart4; //车均告警量汇总
var myChart5; //机构汇总
//初始化调用者方法，查询也是也是调用这方法
function query() {
    var query = serializeArrayByForm('query_dataScreening');
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
    myChart.clear();
    myChart5.clear();
    $('#institutionsview').next().show();
    $('#alarmtrend').next().show();
    //查询曲线图
    queryTrendData(startTimeStr, endTimeStr);
    //告警分类汇总
    queryLatestAWeekData(startTimeStr, endTimeStr)
        //树形图
    Clampingtree(startTimeStr, endTimeStr);

}

function formatcomma(num) {
    var reg = /\d{1,3}(?=(\d{3})+$)/g;
    return (num + '').replace(reg, '$&,');
} //处理数字加逗号
/**
 * 查询最近 {latest}个月的告警趋势
 * @param latest
 */
function queryTrendData(startTimeStr, endTimeStr) {
    if (typeof startTimeStr == 'undefined' || startTimeStr == '') {
        var getstartenddate = requestbeginandend();
        var startTimeStr = getstartenddate[0]['start'];
        var endTimeStr = getstartenddate[0]['end'];
    }
    $.ajax({
        url: ctx + "/statistics/alarmRadar/mulmonthalarm.do",
        type: "POST",
        dataType: "json",
        data: JSON.stringify({
            startTime: startTimeStr,
            stopTime: endTimeStr
        }),
        success: function(data) {
            var largenum = 0; //这是报警数的最大值
            var legendforstyle = new Object;
            legendforstyle = {
                name: {
                    fontFamily: 'Roboto-Regular',
                    fontSize: 14,
                    color: '#888888',
                    align: 'left',
                    padding: [8, 0, 0, 0]
                },
                num: {
                    fontFamily: 'Roboto-Bold',
                    fontSize: 20,
                    fontWeight: 600,
                    width: 60,
                    color: '#555555',
                    align: 'right',
                    padding: [12, 0, 0, 30]
                }
            };
            var xname = [];
            var colorarr = []; //图例的颜色的数组
            var legenddata = []; //图例内容数组
            var seriesdata = []; //图表需要的数据
            for (var i = 0; i < data.data.length; i++) {
                largenum = largenum > data.data[i]['num'] ? largenum : data.data[i]['num'];
            }
            data.data.map(function(elem, index) {
                var location = data.data.length - 1 - index; //将返回的日期和报警数按照位置来倒序
                if ((elem['num'] / largenum) < 0.01) {
                    legendforstyle['abg' + location + ''] = {
                        backgroundColor: '#A4C69F',
                        width: 0,
                        align: 'center',
                        borderRadius: [4, 0, 0, 4],
                        height: 8
                    };
                    legendforstyle['bbg' + location + ''] = {
                        backgroundColor: '#EEEEEE',
                        width: 140,
                        align: 'center',
                        borderRadius: 4,
                        height: 8
                    };
                } else if ((elem['num'] / largenum) == 1) {
                    legendforstyle['abg' + location + ''] = {
                        backgroundColor: '#A4C69F',
                        width: 140,
                        align: 'center',
                        borderRadius: 4,
                        height: 8
                    };
                    legendforstyle['bbg' + location + ''] = {
                        backgroundColor: '#EEEEEE',
                        width: 0,
                        align: 'center',
                        borderRadius: [0, 4, 4, 0],
                        height: 8
                    };
                } else {
                    legendforstyle['abg' + location + ''] = {
                        backgroundColor: '#A4C69F',
                        width: (elem['num'] / largenum) * 140,
                        align: 'center',
                        borderRadius: [4, 0, 0, 4],
                        height: 8
                    };
                    legendforstyle['bbg' + location + ''] = {
                        backgroundColor: '#EEEEEE',
                        width: (1 - elem['num'] / largenum) * 140,
                        align: 'center',
                        borderRadius: [0, 4, 4, 0],
                        height: 8
                    };
                }
                var numcount = []; //这个是当前月所代表的这个series所需的数据
                if (index < (data.data.length - 1)) {
                    for (var i = 0; i < location; i++) {
                        numcount.push(0);
                    }
                }
                numcount.push(elem['num']);
                colorarr.push('#AFCC61');
                xname.unshift(elem['months']);
                legenddata.unshift({
                    'name': elem['months'],
                    'icon': 'circle',
                    'textStyle': {
                        padding: 0
                    }
                });
                seriesdata.unshift({
                    'name': elem['months'],
                    'type': 'line',
                    'stack': 'a',
                    'data': numcount
                });
            });
            var option = {
                color: colorarr,
                legend: {
                    type:'scroll',
                    orient: 'vertical',
                    left: 'right',
                    align: 'center',
                    top: 'center',
                    width: '30%',
                    height: '80%',
                    itemWidth: 0,
                    itemHeight: 0,
                    itemGap: 20,
                    data: legenddata,
                    formatter: function(name) {
                        var target = 0; //这是报警数
                        var backgroundwidth = 0; //这是用来识别进度条宽度样式的变量
                        for (var i = 0; i < option.series.length; i++) {
                            if (option.series[i].name == name) {
                                target = option.series[i].data[i];
                                backgroundwidth = i;
                            }
                        }
                        var arr = [
                            '{name|' + name + '}{num|' + formatcomma(target) + '}', '{abg' + backgroundwidth + '|}{bbg' + backgroundwidth + '|}' //后面的是进度条
                        ]
                        return arr.join('\n');
                    },
                    textStyle: {
                        rich: legendforstyle
                    }
                },
                grid: {
                    x: '8%',
                    y: '15%',
                    x2: '30%',
                    y2: '15%'
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
                    borderWidth: 1,
                    formatter: function(obj) {
                        return '<div>' + obj[0]['name'] + ':' + formatcomma(obj[0]['value']) + '</div>'
                    }
                },
                xAxis: {
                    type: 'category',
                    boundaryGap: true,
                    name: '月份',
                    nameLocation: 'end',
                    nameTextStyle: {
                        fontSize: 14,
                        color: '#999999',
                        fontFamily: 'Roboto-Regular'
                    },
                    axisLine: {
                        lineStyle: {
                            color: '#999999'
                        },
                        symbol: ['none', 'arrow'],
                        symbolOffset: [0, 12]
                    },
                    axisTick: {
                        show: false, //是否显示刻度
                        alignWithLabel: true //刻度与标签对齐
                    },
                    data: xname
                },
                yAxis: {
                    type: 'value',
                    boundaryGap: true,
                    name: '次数',
                    nameLocation: 'end',
                    nameTextStyle: {
                        fontSize: 14,
                        color: '#999999',
                        fontFamily: 'Roboto-Regular'
                    },
                    axisLine: {
                        lineStyle: {
                            color: '#999999'
                        },
                        symbol: ['none', 'arrow'],
                        symbolOffset: [0, 12]
                    },
                    axisTick: {
                        show: false, //是否显示刻度
                        alignWithLabel: true //刻度与标签对齐
                    }
                },
                series: seriesdata
            };
            myChart = echarts.init(document.getElementById("alarmtrend"));
            $('#alarmtrend').next().hide();
            myChart.setOption(option);
        },
        error: function(err) {
            console.log(err);
        }
    });
}

function mGetDate(year, month) {
    var d = new Date(year, month, 0);
    return d.getDate();
}
/**
 * 最近三月告警数
 */
var monthcount = 0; //时间范围总天数
function handlemonthcount(num, date) {
    for (var i = 0; i < num; i++) {
        date.setMonth(date.getMonth() - 1);
        var year = date.getFullYear();
        var month = date.getMonth() + 2;
        var DayCount = mGetDate(year, month);
        monthcount += DayCount;
    }
}
var carcount = 0; //车辆总数
function queryLatestAWeekData(startTimeStr, endTimeStr) {
    monthcount = 0; //每调用一次月数清零一次
    if (typeof startTimeStr == 'undefined' || startTimeStr == '') {
        var date1 = new Date();
        handlemonthcount(3, date1);
        var getstartenddate = requestbeginandend();
        var startTimeStr = getstartenddate[0]['start'];
        var endTimeStr = getstartenddate[0]['end'];
    } else {
        var date2 = new Date(endTimeStr);
        var startarr = startTimeStr.split('-');
        var endarr = endTimeStr.split('-');
        var monthnum = (parseInt(endarr[0]) - parseInt(startarr[0])) * 12 + (parseInt(endarr[1]) - parseInt(startarr[1])) + 1;
        handlemonthcount(monthnum, date2);
    }
    $.ajax({
        url: ctx + "/topicAnalysis/dataScreening/alarmVehilceCountByTime.do",
        type: "POST",
        dateType: "json",
        data: {
            deptId: ac.deptId,
            startDate: startTimeStr,
            endDate: endTimeStr
        },
        success: function(data) {
            carcount = data;
            containcarava(startTimeStr, endTimeStr); //生成完成车辆数之后回调生成右侧三图表
        },
        error: function(err) {
            console.log(err);
        }
    });
}

function containcarava(startTimeStr, endTimeStr) {
    $.ajax({
        url: ctx + "/statistics/alarmRadar/alarmDetailByTime.do",
        type: "POST",
        dateType: "json",
        data: {
            deptId: ac.deptId,
            startDate: startTimeStr,
            endDate: endTimeStr
        },
        success: function(data) {
            var xvalue = []; //x轴上的名字
            var numcount = []; //总数
            var dailynumcount = []; //日均总数
            var carnumcount = []; //车均总数
            data.result.map(function(elem, index) {
                numcount.push(elem['alarmCount']);
                dailynumcount.push((parseInt(elem['alarmCount']) / monthcount).toFixed(0));
                carnumcount.push((parseInt(elem['alarmCount']) / carcount).toFixed(0));
                index % 2 == 0 ? xvalue.push(elem['alarmName']) : xvalue.push('\n' + elem['alarmName']);
            });
            var option2 = {
                color: [
                    '#A4C69F'
                ],
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
                grid: {
                    x: '16%',
                    y: '25%',
                    x2: '1%',
                    y2: '25%'
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
                    axisLabel: {
                        'interval': 0
                    },
                    axisLine: {
                        lineStyle: {
                            color: '#797979'
                        },
                        symbol: ['none', 'arrow'],
                        symbolOffset: [0, 20]
                    },
                    axisTick: {
                        show: false, //是否显示刻度
                        alignWithLabel: true //刻度与标签对齐
                    },
                    axisPointer: {
                        type: 'shadow'
                    },
                    data: xvalue
                },
                yAxis: {
                    type: 'value',
                    boundaryGap: true,
                    name: '次数',
                    nameLocation: 'end',
                    nameTextStyle: {
                        fontSize: 14
                    },
                    axisLine: {
                        lineStyle: {
                            color: '#797979'
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
                    name: '统计次数',
                    type: 'bar',
                    barWidth: '50%',
                    data: numcount
                }]
            };
            var option3 = {
                color: [
                    '#FBC6AE'
                ],
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
                grid: {
                    x: '16%',
                    y: '25%',
                    x2: '1%',
                    y2: '25%'
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
                    axisLabel: {
                        'interval': 0
                    },
                    axisLine: {
                        lineStyle: {
                            color: '#797979'
                        },
                        symbol: ['none', 'arrow'],
                        symbolOffset: [0, 20]
                    },
                    axisTick: {
                        show: false, //是否显示刻度
                        alignWithLabel: true //刻度与标签对齐
                    },
                    axisPointer: {
                        type: 'shadow'
                    },
                    data: xvalue
                },
                yAxis: {
                    type: 'value',
                    boundaryGap: true,
                    name: '次数',
                    nameLocation: 'end',
                    nameTextStyle: {
                        fontSize: 14
                    },
                    axisLine: {
                        lineStyle: {
                            color: '#797979'
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
                    name: '统计次数',
                    type: 'bar',
                    barWidth: '50%',
                    data: dailynumcount
                }]
            };
            var option4 = {
                color: [
                    '#6DBDD8'
                ],
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
                grid: {
                    x: '16%',
                    y: '25%',
                    x2: '1%',
                    y2: '25%'
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
                    axisLabel: {
                        'interval': 0
                    },
                    axisLine: {
                        lineStyle: {
                            color: '#797979'
                        },
                        symbol: ['none', 'arrow'],
                        symbolOffset: [0, 20]
                    },
                    axisTick: {
                        show: false, //是否显示刻度
                        alignWithLabel: true //刻度与标签对齐
                    },
                    axisPointer: {
                        type: 'shadow'
                    },
                    data: xvalue
                },
                yAxis: {
                    type: 'value',
                    boundaryGap: true,
                    name: '次数',
                    nameLocation: 'end',
                    nameTextStyle: {
                        fontSize: 14
                    },
                    axisLine: {
                        lineStyle: {
                            color: '#797979'
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
                    name: '统计次数',
                    type: 'bar',
                    barWidth: '50%',
                    data: carnumcount
                }]
            };
            myChart2 = echarts.init(document.getElementById("alarmLabelReport"));
            myChart2.setOption(option2);
            myChart3 = echarts.init(document.getElementById("averagedailyReport"));
            myChart3.setOption(option3);
            myChart4 = echarts.init(document.getElementById("averagecarReport"));
            myChart4.setOption(option4);
        },
        error: function(err) {
            console.log(err);
        }
    });
}

function generationtree(servicedata, originaldata) {
    for (var j = 0; j < servicedata.length; j++) {
        for (var i = 0; i < originaldata.length; i++) {
            if (originaldata[i]['pId'] == servicedata[j]['id']) {
                if (originaldata[i]['alarmCount']) {
                    servicedata[j]['children'].push({
                        'name': originaldata[i]['name'] + '(' + originaldata[i]['alarmCount'] + ')',
                        "value": originaldata[i]['alarmCount'],
                        "id": originaldata[i]['id'],
                        "pId": originaldata[i]['pId'],
                        "children": []
                    });
                } else if (originaldata[i]['alarm_type_0']) {
                    var allcount = parseInt(originaldata[i]['alarm_type_0']) + parseInt(originaldata[i]['alarm_type_1']) + parseInt(originaldata[i]['alarm_type_2']);
                    servicedata[j]['children'].push({
                        'name': originaldata[i]['name'] + '(' + allcount + ')',
                        'children': [{
                            'name': '疲劳驾驶(' + originaldata[i]['alarm_type_0'] + ')',
                            "value": originaldata[i]['alarm_type_0']
                        }, {
                            'name': '不良驾驶行为(' + originaldata[i]['alarm_type_1'] + ')',
                            "value": originaldata[i]['alarm_type_1']
                        }, {
                            'name': '不良安全习惯(' + originaldata[i]['alarm_type_2'] + ')',
                            "value": originaldata[i]['alarm_type_2']
                        }],
                        "id": originaldata[i]['id'],
                        "pId": originaldata[i]['pId']
                    });
                } else {
                    servicedata[j]['children'].push({
                        'name': originaldata[i]['name'] + '(0)',
                        "value": 0,
                        "id": originaldata[i]['id'],
                        "pId": originaldata[i]['pId']
                    });
                }
            }
        }
        if (servicedata[j]['children'] != undefined) {
            generationtree(servicedata[j]['children'], originaldata);
        }
    }
    return servicedata;
}

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
    getstartenddate.push({
        'start': startTimeStr,
        'end': endTimeStr
    });
    $("#calendertime1").val(startTimeStr);
    $("#calendertime2").val(endTimeStr);
    return getstartenddate;
}

function Clampingtree(startTimeStr, endTimeStr) {
    if (typeof startTimeStr == 'undefined' || startTimeStr == '') {
        var getstartenddate = requestbeginandend();
        var startTimeStr = getstartenddate[0]['start'];
        var endTimeStr = getstartenddate[0]['end'];
    }
    $.ajax({
        url: ctx + "/topicAnalysis/dataScreening/deptTreeAlarm.do",
        type: "POST",
        dateType: "json",
        data: {
            deptId: ac.deptId,
            startDate: startTimeStr,
            endDate: endTimeStr
        },
        success: function(data) {
            var jsondata = JSON.parse(data);
            var servicedata = []; //树需要的数据
            for (var i = 0; i < jsondata.length; i++) {
                if (jsondata[i]['pId'] == 'root') {
                    servicedata.push({
                        'name': jsondata[i]['name'] + '(' + jsondata[i]['alarmCount'] + ')',
                        "value": jsondata[i]['alarmCount'],
                        "id": jsondata[i]['id'],
                        "children": []
                    });
                    generationtree(servicedata, jsondata);
                }
            }
            option5 = {
                tooltip: {
                    trigger: 'item',
                    triggerOn: 'mousemove',
                    formatter: '{b}'
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
                series: [{
                    type: 'tree',
                    name: 'tree1',
                    data: servicedata,
                    top: '5%',
                    left: '25%',
                    bottom: '2%',
                    right: '13%',
                    symbolSize: 7,
                    initialTreeDepth: 5,
                    label: {
                        normal: {
                            position: 'left',
                            verticalAlign: 'middle',
                            align: 'right'
                        }
                    },
                    leaves: {
                        label: {
                            normal: {
                                position: 'right',
                                verticalAlign: 'middle',
                                align: 'left'
                            }
                        }
                    },
                    expandAndCollapse: true,
                    animationDuration: 550,
                    animationDurationUpdate: 750
                }]
            };
            myChart5 = echarts.init(document.getElementById("institutionsview"));
            $('#institutionsview').next().hide();
            myChart5.setOption(option5);
        },
        error: function(err) {
            console.log(err);
        }
    });
}
window.onresize = function() {
    myChart.resize();
    myChart2.resize();
    myChart3.resize();
    myChart4.resize();
    myChart5.resize();
}