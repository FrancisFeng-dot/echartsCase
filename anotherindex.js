window.onload = function() {
    //获取车辆总数
    $.ajax({
        url: ctx + "/statistics/alarmRadar/macroscopicNum.do",
        type: "POST",
        success: function(data) {
            $('#span_total_car_num').text(formatcomma(data.imeis.length));

            $('#li_total_car_num').click(function() {
                openTab("车辆管理", ctx + "/resourcesManage/vehicleResources/index.do")
            });
            $('#li_driver_num').click(function() {
                openTab("司机管理", ctx + "/resourcesManage/driverResources/index.do")
            });
            $('#li_today_alarm_count').click(function() {
                openTab("告警日志", ctx + "/statistics/alarmLog/index.do")
            });
            $('#div_need_me_handle_alarm').click(function() {
                openTab("需要我处理的告警", ctx + "/statistics/alarmLog/index.do?needType=needMe")
            });
            $('#div_pending_alarm').click(function() {
                openTab("安全监控", ctx + "/monitoring/security/index.do")
            });
            $('#div_license_expiration').click(function() {
                openTab("车务查询", ctx + "/operationMgr/dateValidReport/index.do")
            });

            $('#span_driver_num').text(formatcomma(data.driverCount));
            $('#span_today_alarm_count').text(formatcomma(data.todayAlarmCount));
            $('#span_pending_alarm_count').text(formatcomma(data.pendingAlarmCount));
            $('#span_license_expiration_count').text(formatcomma(data.licenseExpirationCount));
            $('#span_need_me_handle_alarm_count').text(formatcomma(data.needMeHandleAlarmCount));
            var imeis = [];
            data.imeis.map(function(elem, index) {
                imeis.push({
                    'imei': elem
                })
            });
            //获取在线车辆总数
            $.ajax({
                url: "http://office.che-mi.net:64109/data/getVehicleState.do",
                type: "POST",
                dataType: "json",
                data: JSON.stringify({
                    imeis: imeis
                }),
                success: function(data) {
                    var onLineCarNum = 0;
                    for (var i = 0; i < data.result.length; i++) {
                        if (data.result[i].lastObdTimeDiff / 60 < commonConfig.onLineCarDiffTime) {
                            onLineCarNum++;
                        }
                    }
                    $('#span_online_car_num').text(formatcomma(onLineCarNum));
                },
                error: function(err) {
                    console.log(err);
                }
            });
        },
        error: function(err) {
            console.log(err);
        }
    });
    queryTrendData(3);
    queryLatestAWeekData();

};

function formatcomma (num) {  
    var reg=/\d{1,3}(?=(\d{3})+$)/g;   
    return (num + '').replace(reg, '$&,');  
}

function openTab(name, url) {
    window.parent.$.fn.jerichoTab.addTab({
        tabFirer: null,
        title: name,
        closeable: true,
        data: {
            dataType: 'iframe',
            dataLink: url
        }
    }).showLoader().loadData();
    resizeTab();
}

var myChart;
var myChart2;
var myChart3;

/**
 * 最近一周告警数
 */
function queryLatestAWeekData() {
    var rangeDate = Date.rangeByOffset(7, "d")
    var startDate = rangeDate[0].format("yyyy-MM-dd hh:mm:ss");
    var endDate = rangeDate[1].format("yyyy-MM-dd hh:mm:ss");

    $.ajax({
        url: ctx + "/statistics/alarmRadar/alarmDetailByTime.do",
        type: "POST",
        dateType: "json",
        data: {
            deptId: ac.deptId,
            startDate: startDate,
            endDate: endDate
        },
        success: function(data) {
            var legenddata = []; //右侧legend的名字和数据
            var xvalue = []; //x轴上的名字
            var seriesdata = []; //图表需要的数据
            data.result.map(function(elem, index) {
                var numcount = [];
                if (index > 0) {
                    for (var i = 0; i < index; i++) {
                        numcount.push(0);
                    }
                }
                numcount.push(elem['alarmCount']);
                legenddata.push({
                    'name': elem['alarmName'],
                    'icon': 'circle',
                    'textStyle': {
                        padding: 0
                    }
                });
                //index % 2 == 0 ? xvalue.push(elem['alarmName']) : xvalue.push('\n' + elem['alarmName']);
                xvalue.push(elem['alarmName']);
                seriesdata.push({
                    'name': elem['alarmName'],
                    'type': 'bar',
                    'barWidth': '50%',
                    'stack': 'a',
                    'data': numcount
                });
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
                legend: {
                    orient: 'horizontal',
                    left: 'right',
                    align: 'center',
                    top: 'center',
                    width: '40%',
                    itemWidth: 0,
                    itemHeight: 0,
                    itemGap: 0,
                    data: legenddata,
                    formatter: function(name) {
                        for (var i = 0; i < option2.series.length; i++) {
                            var target;
                            if (option2.series[i].name == name) {
                                target = option2.series[i].data[i];
                            }
                        }
                        var arr = [
                            '{name|' + name + '}',
                            '{num|' + formatcomma(target) + '}'
                        ]
                        return arr.join('\n');
                    },
                    textStyle: {
                        rich: {
                            // abg: {
                            //     borderColor: '#DDDDDD',
                            //     width: '100%',
                            //     borderWidth: 1,
                            //     align: 'right',
                            //     verticalAlign: 'bottom',
                            //     height: 0
                            // },
                            name: {
                                fontFamily: 'PingFangSC-Regular',
                                fontSize: 14,
                                color: '#888888',
                                width: 90,
                                padding: [8, 0, 8, 0]
                            },
                            num: {
                                fontFamily: 'Roboto-Bold',
                                fontSize: 16,
                                color: '#555555',
                                width: 90,
                                fontWeight:600,
                                padding: [6, 0, 0, 0]
                            }
                        }
                    }
                },
                grid: {
                    x: '8%',
                    y: '20%',
                    x2: '40%',
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
                    borderWidth: 1,
                    formatter: function(obj) {
                        return '<div>'+obj[0]['name']+'：'+formatcomma(obj[0]['value'])+'</div>';
                    }
                },
                xAxis: {
                    zlevel: 1,
                    type: 'category',
                    boundaryGap: true,
                    nameTextStyle: {
                        fontSize: 12,
                        color: '#999999',
                        fontFamily: 'Roboto-Regular'
                    },
                    axisLabel: {
                        'interval': 0,
                        'rotate': -40
                    },
                    axisLine: {
                        lineStyle: {
                            color: '#999999'
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
                        fontSize: 12,
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
            data.result.sort(function(a, b) {
                return (parseInt(a['alarmCount']) < parseInt(b['alarmCount'])) ? 1 : -1;
            });
            var top5data = [];
            var datalength = 0;
            datalength = data.result.length>5?5:data.result.length;
            for (var i = 0; i < datalength; i++) {
                top5data.push({
                    'value': data.result[i]['alarmCount'],
                    'name': data.result[i]['alarmName']
                });
            }
            var option3 = {
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
                    name: '近一周告警类型TOP5排行',
                    type: 'pie',
                    center: ['50%', '50%'],
                    radius: ['36%', '60%'],
                    avoidLabelOverlap: false,
                    label: {
                        normal: {
                            show: false,
                            position: 'center',
                            formatter: function(obj) {
                                var arr = [
                                    '{name|' + obj.name + '}', '{value|'+ formatcomma(obj.value) +'}'
                                ]
                                return arr.join('\n');
                            },
                            rich: {
                                name: {
                                    fontSize: 14,
                                    color: '#555555',
                                    fontFamily: 'PingFangSC-Regular',
                                    padding:[6,0,0,0]
                                },
                                value: {
                                    fontSize: 18,
                                    color: '#F2B469',
                                    fontFamily: 'Roboto-Bold'
                                }
                            }
                        },
                        emphasis: {
                            show: true
                        }
                    },
                    labelLine: {
                        normal: {
                            show: false
                        }
                    },
                    data: top5data
                }]
            };
            myChart2 = echarts.init(document.getElementById("rencentweekreport"));
            myChart2.setOption(option2);
            myChart3 = echarts.init(document.getElementById("rencentweektop5"));
            myChart3.setOption(option3);
        },
        error: function(err) {
            console.log(err);
        }
    });
}
/**
 * 查询最近 {latest}个月的告警趋势
 * @param latest
 */
function queryTrendData(latest) {
    var date1 = new Date();
    var stopTime = date1.format("yyyy-MM-dd hh:mm:ss");
    date1.setMonth(date1.getMonth() - latest + 1);
    var year1 = date1.getFullYear();
    var month1 = date1.getMonth() + 1;
    month1 = (month1 < 10 ? "0" + month1 : month1);
    sDate = (year1.toString() + '-' + month1.toString());
    var startTime = sDate + "-01 01:00:00";
    $.ajax({
        url: ctx + "/statistics/alarmRadar/mulmonthalarm.do",
        type: "POST",
        dataType: "json",
        data: JSON.stringify({
            startTime: startTime,
            stopTime: stopTime
        }),
        success: function(data) {
            $('.allmonth').html('');
            var xname = [];
            var yvalue = [];
            var largenum = 0; //这是报警数的最大值
            for (var i = 0; i < data.data.length; i++) {
                largenum = largenum > data.data[i]['num'] ? largenum : data.data[i]['num'];
            }
            data.data.sort(function (a, b) {
                return (a['months'] > b['months']) ? 1 : -1;
            });
            data.data.map(function (elem, index) {
                var arr = elem['months'].split('-');
                xname.push(elem['months']);
                yvalue.push({
                    'name': elem['months'],
                    'value': elem['num']
                });
                var num = (elem['num']/largenum)*100;
                var html;
                if(latest == 3){
                    html= '<li style="width:100%;height:7vh;"><div><span>' + elem['months'] + '</span><span>' + elem['num'] + '</span>'
                        +'</div><div><div style="width:'+num+'%;"></div></div></li>';
                }else if(latest == 6){
                    html= '<li style="width:45%;height:7vh;"><div><span>' + elem['months'] + '</span><span>' + elem['num'] + '</span>'
                        +'</div><div><div style="width:'+num+'%;"></div></div></li>';
                }else if(latest == 9){
                    html= '<li style="width:28%;height:7vh;"><div><span>' + elem['months'] + '</span><span>' + elem['num'] + '</span>'
                        +'</div><div><div style="width:'+num+'%;"></div></div></li>';
                }else if(latest == 12){
                    html= '<li style="width:28%;height:4vh;"><div><span>' + elem['months'] + '</span><span>' + elem['num'] + '</span>'
                        +'</div><div><div style="width:'+num+'%;"></div></div></li>';
                }
                $('.allmonth').append(html);
            });
            var option = {
                color: ['#AFCC61'],
                grid: {
                    x: '15%',
                    y: '20%',
                    x2: '10%',
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
                series: {
                    name: '最近' + latest + '个月告警趋势',
                    type: 'line',
                    itemStyle: {
                        opacity: 0.8,
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowOffsetY: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    },
                    data: yvalue
                }
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

$(document).on('click', '.recentmonth li', function() {
    myChart.clear();
    $('#alarmtrend').next().show();
    var a = $(this).index();
    $('.recentmonth').children('li').removeClass('active');
    $('.recentmonth').children('li').eq(a).addClass('active');
    queryTrendData($(this).attr('num'));
});
window.onresize = function() {
    myChart.resize();
    myChart2.resize();
    myChart3.resize();
}