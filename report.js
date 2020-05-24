var dataController;
$(function () {
    dataController = new DataController(false);
    var mapHeight = $("#left_vehicle_card").height();
    $(".data_left .treeDiv").height(mapHeight - 100);
    initTree();
    dataController.loadVehicleData();
    setTimeout(function () {
        asyncAll();
    }, 1000);
    setInterval(function () {
        dataController.isFirstLoad = false;
        dataController.loadVehicleData();
    }, 35000);//1000为1秒钟
})

/**
 * 更新所有子标签的车辆状态
 */
function reloadTreeData() {
    var treeObj = $.fn.zTree.getZTreeObj("deptTree");
    var nodes = treeObj.getNodesByFilter(filter);
    for (var i = 0; i < nodes.length; i++) {
        var vehicleCode = nodes[i].name;
        var thisVehicle = dataController.allVehicleMap[vehicleCode];
        if (thisVehicle == undefined) {
            continue;
        }
        var iconSkin = getVehicleIconSkin(thisVehicle.state);
        nodes[i].iconSkin = iconSkin;
        //根据缓存中的车辆状态更新车辆小图标
        treeObj.updateNode(nodes[i]);
    }
}

/**
 * ztree自定义过滤器
 * ClassName: coldVehicle.js
 * @Description: TODO
 * @author yokoboy
 * @date 2016-11-1
 */
function filter(node) {
    return !node.isParent;
}

/**
 * 初始化机构树
 * ClassName: coldVehicle.js
 * @Description: TODO
 * @author yokoboy
 * @date 2016-10-31
 */
var randomParam = Math.random();
var treeSetting = {
    view: {
        selectedMulti: false,
        showLine: true,
        showIcon: true
    },
    data: {
        simpleData: {
            enable: true,
            idKey: "id",
            pIdKey: "pId",
            rootPId: "top"
        }
    },
    async: {
        type: "get",
        enable: true,
        url: ctx + "/monitoring/panoramicMonitor/deptTree.do?random_param=" + Math.random(),
        autoParam: ["id=parDeptId"]
    },
    callback: {
        beforeAsync: beforeAsync,
        onAsyncSuccess: onAsyncSuccess,
        onAsyncError: onAsyncError,
    }
};

function initTree() {
    $.getJSON(
        ctx + "/monitoring/panoramicMonitor/deptTree.do",
        {
            parDeptId: "newTree",
            random_param: randomParam
        }, // ie发现参数不变，不会向服务器发送请求。加入一个无所谓的参数即可，后台不需要获取这个参数。
        function (parentNodes) {
            $.fn.zTree.init($("#deptTree"), treeSetting, parentNodes);
            var treeObj = $.fn.zTree.getZTreeObj("deptTree");
            treeObj.expandAll(true);
        }
    );
}

/**加载并展开机构树==========================================start*/
var demoMsg = {
    async: "正在进行异步加载，请等一会儿再点击...",
    expandAllOver: "全部展开完毕",
    asyncAllOver: "后台异步加载完毕",
    asyncAll: "已经异步加载完毕，不再重新加载",
    expandAll: "已经异步加载完毕，使用 expandAll 方法"
}

function beforeAsync() {
    curAsyncCount++;
}

function onAsyncSuccess(event, treeId, treeNode, msg) {
    curAsyncCount--;
    if (curStatus == "expand") {
        expandNodes(treeNode.children);
    } else if (curStatus == "async") {
        asyncNodes(treeNode.children);
    }

    if (curAsyncCount <= 0) {
        if (curStatus != "init" && curStatus != "") {
            asyncForAll = true;
        }
        curStatus = "";
    }
}

function onAsyncError(event, treeId, treeNode, XMLHttpRequest, textStatus, errorThrown) {
    curAsyncCount--;

    if (curAsyncCount <= 0) {
        curStatus = "";
        if (treeNode != null) asyncForAll = true;
    }
}

var curStatus = "init", curAsyncCount = 0, asyncForAll = false,
    goAsync = false;

function asyncAll() {
    if (!check()) {
        return;
    }
    var zTree = $.fn.zTree.getZTreeObj("deptTree");
    if (asyncForAll) {
    } else {
        asyncNodes(zTree.getNodes());
        if (!goAsync) {
            curStatus = "";
        }
    }
}

function asyncNodes(nodes) {
    if (!nodes) return;
    curStatus = "async";
    var zTree = $.fn.zTree.getZTreeObj("deptTree");
    for (var i = 0, l = nodes.length; i < l; i++) {
        if (nodes[i].isParent && nodes[i].zAsync) {
            asyncNodes(nodes[i].children);
        } else {
            goAsync = true;
            zTree.reAsyncChildNodes(nodes[i], "refresh", true);
        }
    }
}

function check() {
    if (curAsyncCount > 0) {
        return false;
    }
    return true;
}

var sevenparams = {
    vehicleId: '',
    reportCondition: '',
    deptId: '',
    reportType: '',
    startdate: '',
    enddate: '',
    reportdate: ''
}

/**加载并展开机构树==========================================end*/
//机构树被点击
function treeClick(deptName, deptId) {
    $(".organ").css('display', 'block');
    $("#pnSpan").html(deptName);
    dataController.allVehicleList.map(function (elem, index) {
        if (elem['deptId'] == deptId) {
            $("#dptNameSpan").html(elem.deptTree);
        }
    });
    var reportCondition = 'dept';
    showinfo(deptId, reportCondition, deptId);
}

/**
 * 机构树车辆点击事件
 * ClassName: coldVehicle.js
 * @Description: TODO
 * @author yokoboy
 * @date 2016-11-1
 */
function clickVehicle(vehicleCode) {
    var thisVehicle = dataController.allVehicleMap[vehicleCode];
    if (thisVehicle == undefined) {
        layer.msg("此车辆不存在，或您输入的车牌号有误");
        return;
    }
    //展开节点
    var treeObj = $.fn.zTree.getZTreeObj("deptTree");
    var deptId = thisVehicle.deptId;
    var node = treeObj.getNodeByParam("id", deptId, null);
    if (node != undefined) {
        treeObj.expandNode(node, true, true, true);
    }
    if (thisVehicle != undefined) {
        $(".organ").css('display', 'block');
        $("#pnSpan").html(thisVehicle.vehicleCode != undefined ? thisVehicle.vehicleCode : '');
        $("#dptNameSpan").html(thisVehicle.deptTree);
        var reportCondition = 'vehicle';
        showinfo(thisVehicle['vehicleId'], reportCondition, thisVehicle['deptId']);
    }
}

function showinfo(vehicleId, reportCondition, deptId) {
    $('.dayweekmonth').children('div').children('span').removeClass('active');
    $('.dayweekmonth').children('div').eq(0).children('span').addClass('active');
    $('#calendertime').val('');
    var nowdate = new Date();
    todayandyesterday(nowdate);
    sevenparams['vehicleId'] = vehicleId;
    sevenparams['reportCondition'] = reportCondition;
    sevenparams['deptId'] = deptId;
    openMessageWindowNoClick(vehicleId, reportCondition, deptId, sevenparams['reportType'], sevenparams['startdate'], sevenparams['enddate'], sevenparams['reportdate']);//默认打开信息窗口
}

function addZeor(ori) {
    if (ori < 10) {
        return '0' + ori;
    } else {
        return ori;
    }
}

function todayandyesterday(nowdate) {
    var nowTime = nowdate.getTime();
    var y = nowdate.getFullYear();
    var m = nowdate.getMonth() + 1;
    var d = nowdate.getDate();
    var formatnowdate = y + '/' + addZeor(m) + '/' + addZeor(d);//报警信息时间
    var onedayDate = new Date(nowTime - 24 * 60 * 60 * 1000);
    var onedayy = onedayDate.getFullYear();
    var onedaym = onedayDate.getMonth() + 1;
    var onedayd = onedayDate.getDate();
    var yesterday = onedayy + '/' + addZeor(onedaym) + '/' + addZeor(onedayd);
    sevenparams['startdate'] = yesterday;
    sevenparams['enddate'] = yesterday;
    sevenparams['reportdate'] = formatnowdate;
    sevenparams['reportType'] = 'day';
}

/**
 * 默认打开车辆信息窗口
 * @param marker
 * @param vehicleDetail
 */
//vehicleId:当前机构或者车辆的id，用来实现报表展示
//reportCondition机构类型查询的条件vehicle按照车辆，dept按照机构
//deptId当前的机构id
//daywekmonth报表类型日报周报
//starttime报表统计开始时间
//endtime报表统计结束时间
function openMessageWindowNoClick(vehicleId, reportCondition, deptId, reportType, startdate, enddate, reportdate) {
    $.ajax({
        url: ctx + "/statistics/report/getAlarmList.do",
        type: "POST",
        dataType: "json",
        data: {
            'deptId': ac.deptId
        },
        success: function (data) {
            var itemlist = [];//报警类型列表
            for (var i = 0; i < data.list.length; i++) {
                if (data.list[i]['available'] == 1) {
                    itemlist.push({
                        'reportItem': data.list[i]['alarmValue']
                    })
                }
            }
            echartsshow2(vehicleId, reportCondition, reportType, startdate, enddate, reportdate, itemlist);
        },
        error: function (err) {
            console.log(err);
        }
    });
    ranklist(deptId, startdate, enddate);
}

function echartsshow2(vehicleId, reportCondition, reportType, startdate, enddate, reportdate, itemlist) {
    $.ajax({
        url: ctx + "/statistics/report/queryReportData.do",
        type: "POST",
        dataType: "json",
        data: JSON.stringify({
            'reportType': reportType,//报表类型日报周报
            'reportDate': reportdate,//报表时期
            'startDate': startdate,//开始时间
            'endDate': enddate,//结束时间
            'reportCondition': reportCondition,//查询的条件vehicle按照车辆，dept按照机构
            'conditionValue': vehicleId,//机构id或者车辆id
            'itemList': itemlist//报警类型列表
        }),
        success: function (data) {
            var optiondata1 = [];//图表1图例
            var optiondata2 = [];//图表2图例
            var optiondata3 = [];//图表3图例
            var optionvalue1 = 0;//图表1报警总数
            var optionvalue2 = 0;//图表2报警总数
            var optionvalue3 = 0;//图表3报警总数
            for (var i = 0; i < data.result.length; i++) {
                if (data.result[i].itemType == 'alarm_type_0') {
                    optiondata1.push({
                        'value': data.result[i]['itemValue'],
                        'name': data.result[i]['itemName'],
                        icon: 'circle',
                        textStyle: {padding: [0, 0, 0, 6]}
                    });
                    optionvalue1 += parseInt(data.result[i]['itemValue']);
                } else if (data.result[i].itemType == 'alarm_type_1') {
                    optiondata2.push({
                        'value': data.result[i]['itemValue'],
                        'name': data.result[i]['itemName'],
                        icon: 'circle',
                        textStyle: {padding: [0, 0, 0, 6]}
                    });
                    optionvalue2 += parseInt(data.result[i]['itemValue']);
                } else if (data.result[i].itemType == 'alarm_type_2') {
                    optiondata3.push({
                        'value': data.result[i]['itemValue'],
                        'name': data.result[i]['itemName'],
                        icon: 'circle',
                        textStyle: {padding: [0, 0, 0, 6]}
                    });
                    optionvalue3 += parseInt(data.result[i]['itemValue']);
                }
            }
            $('#warninglist').html('');
            data.result.sort(function (a, b) {
                return (parseInt(a['itemValue']) < parseInt(b['itemValue'])) ? 1 : -1;
            });
            for (var i = 0; i < data.result.length; i++) {
                var html = '<li><div name="indexclick"><span>' + data.result[i]['itemName'] + '</span><span>' + data.result[i]['itemValue'] + '</span></div></li>';
                $('#warninglist').append(html);
            };
            var myChart1 = echarts.init(document.getElementById('main1'));
            var myChart2 = echarts.init(document.getElementById('main2'));
            var myChart3 = echarts.init(document.getElementById('main3'));

            var option1 = {
                title: {
                    text: '{border|}{title|' + commonConfig.alarmType0 + '}',
                    x: 'center',
                    top: '5%',
                    textStyle: {
                        rich: {
                            border: {
                                borderWidth: 4,
                                borderColor: '#F89B4D',
                                height: 18
                            },
                            title: {
                                fontFamily: 'PingFangSC-Regular',
                                fontSize: 18,
                                color: '#555555'
                            }
                        }
                    }
                },
                toolbox: {
                    top:'bottom',
                    left:'right',
                    show: true,
                    itemSize:30,
                    feature: {
                        saveAsImage: {
                            icon:'image://'+ctx+'/img/saveasimage.png'
                        }
                    }
                },
                tooltip: {
                    trigger: 'item',
                    formatter: "{a} <br/>{b}: {c} ({d}%)"
                },
                legend: {
                    orient: 'vertical',
                    left: 'center',
                    top: '55%',
                    itemWidth: 6,
                    itemHeight: 6,
                    itemGap: 10,
                    data: optiondata1,
                    formatter: function (name) {
                        for (var i = 0; i < option1.series[0].data.length; i++) {
                            var target;
                            if (option1.series[0].data[i].name == name) {
                                target = option1.series[0].data[i].value;
                            }
                        }
                        return '{name|' + name + '}{num|' + target + '}{unit|次}';
                    },
                    textStyle: {
                        rich: {
                            name: {
                                fontFamily: 'PingFangSC-Regular',
                                fontSize: 16,
                                color: '#555555',
                                padding: [0, 6, 0, 0]
                            },
                            unit: {
                                fontFamily: 'PingFangSC-Regular',
                                fontSize: 16,
                                color: '#555555',
                                padding: [0, 6, 0, 6]
                            },
                            num: {
                                fontFamily: 'Helvetica-Bold',
                                fontSize: 16,
                                color: '#555555'
                            }
                        }
                    }
                },
                series: [
                    {
                        name: commonConfig.alarmType0,
                        type: 'pie',
                        center: ['50%', '30%'],
                        radius: ['36%', '50%'],
                        avoidLabelOverlap: false,
                        label: {
                            normal: {
                                show: true,
                                position: 'center',
                                formatter: ['{title|总计}', '{value|' + optionvalue1 + '}'].join('\n'),
                                rich: {
                                    title: {
                                        fontFamily: 'PingFangSC-Regular',
                                        fontSize: 14,
                                        color: '#999999'
                                    },
                                    value: {
                                        fontFamily: 'PingFangSC-Regular',
                                        fontSize: 20,
                                        color: '#555555',
                                        lineHeight: 30
                                    }
                                }
                            }
                        },
                        labelLine: {
                            normal: {
                                show: false
                            }
                        },
                        data: optiondata1
                    }
                ]
            };
            var option2 = {
                title: {
                    text: '{border|}{title|' + commonConfig.alarmType1 + '}',
                    x: 'center',
                    top: '5%',
                    textStyle: {
                        rich: {
                            border: {
                                borderWidth: 4,
                                borderColor: '#F89B4D',
                                height: 18
                            },
                            title: {
                                fontFamily: 'PingFangSC-Regular',
                                fontSize: 18,
                                color: '#555555'
                            }
                        }
                    }
                },
                toolbox: {
                    top:'bottom',
                    left:'right',
                    show: true,
                    itemSize:30,
                    feature: {
                        saveAsImage: {
                            icon:'image://'+ctx+'/img/saveasimage.png'
                        }
                    }
                },
                tooltip: {
                    trigger: 'item',
                    formatter: "{a} <br/>{b}: {c} ({d}%)"
                },
                legend: {
                    orient: 'vertical',
                    left: 'center',
                    top: '55%',
                    itemWidth: 6,
                    itemHeight: 6,
                    itemGap: 10,
                    data: optiondata2,
                    formatter: function (name) {
                        for (var i = 0; i < option2.series[0].data.length; i++) {
                            var target;
                            if (option2.series[0].data[i].name == name) {
                                target = option2.series[0].data[i].value;
                            }
                        }
                        return '{name|' + name + '}{num|' + target + '}{unit|次}';
                    },
                    textStyle: {
                        rich: {
                            name: {
                                fontFamily: 'PingFangSC-Regular',
                                fontSize: 16,
                                color: '#555555',
                                padding: [0, 6, 0, 0]
                            },
                            unit: {
                                fontFamily: 'PingFangSC-Regular',
                                fontSize: 16,
                                color: '#555555',
                                padding: [0, 6, 0, 6]
                            },
                            num: {
                                fontFamily: 'Helvetica-Bold',
                                fontSize: 16,
                                color: '#555555'
                            }
                        }
                    }
                },
                series: [
                    {
                        name: commonConfig.alarmType1,
                        type: 'pie',
                        center: ['50%', '30%'],
                        radius: ['36%', '50%'],
                        avoidLabelOverlap: false,
                        label: {
                            normal: {
                                show: true,
                                position: 'center',
                                formatter: ['{title|总计}', '{value|' + optionvalue2 + '}'].join('\n'),
                                rich: {
                                    title: {
                                        fontFamily: 'PingFangSC-Regular',
                                        fontSize: 14,
                                        color: '#999999'
                                    },
                                    value: {
                                        fontFamily: 'PingFangSC-Regular',
                                        fontSize: 20,
                                        color: '#555555',
                                        lineHeight: 30
                                    }
                                }
                            }
                        },
                        labelLine: {
                            normal: {
                                show: false
                            }
                        },
                        data: optiondata2
                    }
                ]
            };
            var option3 = {
                title: {
                    text: '{border|}{title|' + commonConfig.alarmType2 + '}',
                    x: 'center',
                    top: '5%',
                    textStyle: {
                        rich: {
                            border: {
                                borderWidth: 4,
                                borderColor: '#F89B4D',
                                height: 18
                            },
                            title: {
                                fontFamily: 'PingFangSC-Regular',
                                fontSize: 18,
                                color: '#555555'
                            }
                        }
                    }
                },
                toolbox: {
                    top:'bottom',
                    left:'right',
                    show: true,
                    itemSize:30,
                    feature: {
                        saveAsImage: {
                            icon:'image://'+ctx+'/img/saveasimage.png'
                        }
                    }
                },
                tooltip: {
                    trigger: 'item',
                    formatter: "{a} <br/>{b}: {c} ({d}%)"
                },
                legend: {
                    orient: 'vertical',
                    left: 'center',
                    top: '55%',
                    itemWidth: 6,
                    itemHeight: 6,
                    itemGap: 10,
                    data: optiondata3,
                    formatter: function (name) {
                        for (var i = 0; i < option3.series[0].data.length; i++) {
                            var target;
                            if (option3.series[0].data[i].name == name) {
                                target = option3.series[0].data[i].value;
                            }
                        }
                        return '{name|' + name + '}{num|' + target + '}{unit|次}';
                    },
                    textStyle: {
                        rich: {
                            name: {
                                fontFamily: 'PingFangSC-Regular',
                                fontSize: 16,
                                color: '#555555',
                                padding: [0, 6, 0, 0]
                            },
                            unit: {
                                fontFamily: 'PingFangSC-Regular',
                                fontSize: 16,
                                color: '#555555',
                                padding: [0, 6, 0, 6]
                            },
                            num: {
                                fontFamily: 'Helvetica-Bold',
                                fontSize: 16,
                                color: '#555555'
                            }
                        }
                    }
                },
                series: [
                    {
                        name: commonConfig.alarmType2,
                        type: 'pie',
                        center: ['50%', '30%'],
                        radius: ['36%', '50%'],
                        avoidLabelOverlap: false,
                        label: {
                            normal: {
                                show: true,
                                position: 'center',
                                formatter: ['{title|总计}', '{value|' + optionvalue3 + '}'].join('\n'),
                                rich: {
                                    title: {
                                        fontFamily: 'PingFangSC-Regular',
                                        fontSize: 14,
                                        color: '#999999'
                                    },
                                    value: {
                                        fontFamily: 'PingFangSC-Regular',
                                        fontSize: 20,
                                        color: '#555555',
                                        lineHeight: 30
                                    }
                                }
                            }
                        },
                        labelLine: {
                            normal: {
                                show: false
                            }
                        },
                        data: optiondata3
                    }
                ]
            };

            findDimensions(option1);
            findDimensions(option2);
            findDimensions(option3);
            myChart1.setOption(option1);
            myChart2.setOption(option2);
            myChart3.setOption(option3);
            window.onresize = function () {
                findDimensions(option1);
                findDimensions(option2);
                findDimensions(option3);
                myChart1.resize();
                myChart2.resize();
                myChart3.resize();
            }
        },
        error: function (err) {
            console.log(err);
        }
    })
};

var winWidth = 0;
var winHeight = 0;

function findDimensions(option) //函数：获取尺寸
{
    //获取窗口宽度
    if (window.innerWidth)
        winWidth = window.innerWidth;
    else if ((document.body) && (document.body.clientWidth))
        winWidth = document.body.clientWidth;
    //获取窗口高度
    if (window.innerHeight)
        winHeight = window.innerHeight;
    else if ((document.body) && (document.body.clientHeight))
        winHeight = document.body.clientHeight;
    //通过深入Document内部对body进行检测，获取窗口大小
    if (document.documentElement && document.documentElement.clientHeight && document.documentElement.clientWidth) {
        winHeight = document.documentElement.clientHeight;
        winWidth = document.documentElement.clientWidth;
    }
    //结果输出至两个文本框
    option.title.textStyle.rich.title.padding = [0, winWidth * 3 / 100, 0, winWidth * 4 / 100];
}

var starttime;
var endtime;
$(document).on('click', '.dayweekmonth div', function () {
    var a = $(this).index();
    $('.dayweekmonth').children('div').children('span').removeClass('active');
    $('.dayweekmonth').children('div').eq(a).children('span').addClass('active');
    var nowDate = new Date(sevenparams['reportdate']);
    var clonereportdate = sevenparams['reportdate'];//为处理报警报表日期做准备
    var nowTime = nowDate.getTime();
    if (a == 1) {
        daywekmonth = 'week';
        //获取系统前一周的时间  
        var oneweekDate = new Date(nowTime - 7 * 24 * 3600 * 1000);
        var oneweekTime = oneweekDate.getTime();
        var oneweekday = oneweekDate.getDay();
        var oneDayLong = 24 * 60 * 60 * 1000;
        var MondayTime = oneweekTime - (oneweekday - 1) * oneDayLong;
        var SundayTime = oneweekTime + (7 - oneweekday) * oneDayLong;
        var monday = new Date(MondayTime);
        var sunday = new Date(SundayTime);
        var starty = monday.getFullYear();
        var startm = monday.getMonth() + 1;
        var startd = monday.getDate();
        var endy = sunday.getFullYear();
        var endm = sunday.getMonth() + 1;
        var endd = sunday.getDate();
        starttime = starty + '/' + addZeor(startm) + '/' + addZeor(startd);
        endtime = endy + '/' + addZeor(endm) + '/' + addZeor(endd);
        var yestmond = monday.getTime();
        var yearbegin = new Date(starty + '-01-01');
        var weekofyear = Math.round((yestmond - yearbegin.getTime()) / (24 * 60 * 60 * 7 * 1000)) + 1;
        var formatweek = nowDate.getFullYear() + '/' + weekofyear;//报警信息时间
        clonereportdate = formatweek;
    } else if (a == 2) {
        daywekmonth = 'month';
        //获取系统上一月的时间  
        var monthtimebegin = getMonthPriorFirst(nowDate);
        var monthtimeover = getMonthPriorLast(nowDate);
        var monthtimebeginy;
        var monthtimebeginm;
        var formatmonth;
        if (monthtimebegin.getMonth() == 0) {
            monthtimebeginy = monthtimebegin.getFullYear() - 1;
            monthtimebeginm = 12;
            formatmonth = monthtimebeginy + '/' + 12;
        } else {
            monthtimebeginy = monthtimebegin.getFullYear();
            monthtimebeginm = monthtimebegin.getMonth();
            formatmonth = nowDate.getFullYear() + '/' + (monthtimebegin.getMonth());//报警信息时间
        }
        var monthtimebegind = monthtimebegin.getDate();
        var monthtimeovery = monthtimeover.getFullYear();
        var monthtimeoverm = monthtimeover.getMonth() + 1;
        var monthtimeoverd = monthtimeover.getDate();
        starttime = monthtimebeginy + '/' + addZeor(monthtimebeginm) + '/' + addZeor(monthtimebegind);
        endtime = monthtimeovery + '/' + addZeor(monthtimeoverm) + '/' + addZeor(monthtimeoverd);
        clonereportdate = formatmonth;
    } else {
        daywekmonth = 'day';
        starttime = sevenparams['startdate'];
        endtime = sevenparams['enddate'];
    }
    sevenparams['reportType'] = daywekmonth;
    openMessageWindowNoClick(sevenparams['vehicleId'], sevenparams['reportCondition'], sevenparams['deptId'], daywekmonth, starttime, endtime, clonereportdate);//默认打开信息窗口
});

//获取上一月的第一天
function getMonthPriorFirst(MonthPrior) {
    MonthPrior.setDate(1);
    return MonthPrior;
}

//获取上一月的最后一天
function getMonthPriorLast(MonthPrior) {
    var currentMonth = MonthPrior.getMonth();
    var nextMonth = ++currentMonth;
    var nextMonthFirstDay = new Date(MonthPrior.getFullYear(), nextMonth - 1, 1);
    var nowTime = nextMonthFirstDay.getTime();
    var oneDay = 1000 * 60 * 60 * 24;
    return new Date(nextMonthFirstDay - oneDay);
}

$(document).on('click', '#btn_searchTime', function () {
    if ($('#calendertime').val() && $('#calendertime').val().split('-') != undefined) {
        $('.dayweekmonth').children('div').children('span').removeClass('active');
        $('.dayweekmonth').children('div').eq(0).children('span').addClass('active');
        var nowdate = new Date($('#calendertime').val());
        todayandyesterday(nowdate);
        openMessageWindowNoClick(sevenparams['vehicleId'], sevenparams['reportCondition'], sevenparams['deptId'], sevenparams['reportType'], sevenparams['startdate'], sevenparams['enddate'], sevenparams['reportdate']);//默认打开信息窗口
    }
});

class DataController {
    constructor(markerClickEvent) {
        this.getVehicleStateUrl = "http://office.che-mi.net:64109/data/getVehicleState.do";//获取设备最最新obd数据的
        this.isFirstLoad = true;//是否是第一次加载车辆数据
        this.isVehicleMarkerNeedClickEvent = markerClickEvent;//地图上的车辆标记是否需要点击事件
        this.vehicleNum = 0;//车辆数量
        this.runNum = 0;//行驶的车辆数量
        this.flameoutNum = 0;//熄火的车辆数量
        this.stopNum = 0;//停留的车辆数量
        this.repairNum = 0;//维修的车辆数量
        this.abnormalNum = 0;//离线的车辆数量
        this.faultNum = 0;//有故障的车辆数量;
        this.allVehicleList = [];//所有车辆信息的数组
        this.allVehicleMap = {};//key是车牌号的json对象
        this.allVehicleStateMap = {};//key是设备号(720)的json对象,value是车辆状态(包括gps,最后一次上传gps的时间距离当前时间的差值等)
        this.deptIdToVehicleMap = {};//{机构id1:[车辆1,车辆2...],机构id2:[车辆1,车辆2...].....}

        this.loadVehicleData = function () {//加载车辆数据
            //临时存储车辆数据,当车辆数很多时是分批加载的
            var tempVehicleList = [];
            var imeis = [];
            var deptId = ac.deptId;
            var url = ctx + "/monitoring/panoramicMonitor/queryVehicleCount.do";
            //不同状态的车辆数清0
            dataController.vehicleNum = 0;
            dataController.runNum = 0;
            dataController.flameoutNum = 0;
            dataController.stopNum = 0;
            dataController.repairNum = 0;
            dataController.abnormalNum = 0;
            dataController.faultNum = 0;
            var loadSize = 50;
            var rangeDate = Date.rangeByOffset(2, "d");
            //查询出机构的车辆数量分布加载
            $.ajax({
                type: "post",
                data: {'deptId': deptId},
                dataType: 'json',
                url: url,
                success: function (vehicleCount) {
                    if (vehicleCount <= 0) {
                        dell(false);
                        dataController.setNumOfVehiclesInDiffState();
                    }
                    for (var i = 1; i <= vehicleCount; i = i + loadSize) {
                        var loadEnd = i + loadSize;
                        $.ajax({
                            type: "post",
                            data: {
                                'deptId': deptId,
                                'loadStart': i,
                                'loadEnd': loadEnd,
                                'pageSize': loadSize,
                                'startTim': dateFormat(rangeDate[0], "YYYY-MM-DD"),
                                'endTime': dateFormat(rangeDate[1], "YYYY-MM-DD")
                            },
                            dataType: 'json',
                            url: ctx + "/monitoring/panoramicMonitor/vehicleRunMapInfo.do",
                            success: function (data) {
                                var countNum = data.countNum;
                                var list = data.vehicleInfo;
                                dataController.vehicleNum += countNum.vehicleNum;
                                for (var i = 0; i < list.length; i++) {
                                    // dataController.allVehicleList.push(list[i]);
                                    tempVehicleList.push(list[i]);
                                    //把设备号(720)保存到数组,请求车辆状态是需要用到.
                                    imeis.push({"imei": list[i].deviceCode});
                                }
                                //车辆基础数据加载完成,然后加载车辆的状态
                                dataController.allVehicleList = tempVehicleList;
                                dataController.loadVehicleState(imeis);

                            },
                            error: function () {
                                console.log("分批加载错误");
                            }
                        });
                    }
                },
                error: function () {
                    console.log("vehicleCount error");
                }
            });
        };
        this.loadVehicleState = function (imeis) {
            $.ajax({
                type: "post",
                data: JSON.stringify({'imeis': imeis}),
                dataType: 'json',
                url: dataController.getVehicleStateUrl,
                success: function (data) {

                    for (var i = 0; i < data.result.length; i++) {
                        var item = data.result[i];
                        //gps坐标转百度坐标
                        var result = GpsToBaiduPoints([{lat: item.lat, lng: item.lng}]);
                        item["lng"] = result[0].lng;
                        item["lat"] = result[0].lat;
                        //缓存所有车辆的状态信息
                        dataController.allVehicleStateMap[item.imei] = item;
                    }

                    for (var j = 0; j < dataController.allVehicleList.length; j++) {
                        var item = dataController.allVehicleList[j];
                        var state = dataController.allVehicleStateMap[item.deviceCode];
                        if (state != undefined) {
                            dataController.allVehicleList[j]["lng"] = state.lng;
                            dataController.allVehicleList[j]["lat"] = state.lat;
                            dataController.allVehicleList[j]["obdTime"] = state.insertTime * 1000;
                            dataController.allVehicleList[j]["obdSpeed"] = state.speed;
                            if (state.lastObdTimeDiff / 60 > 2) {
                                dataController.allVehicleList[j]["isStop"] = true;
                                dataController.allVehicleList[j]["state"] = 'flameout';
                                dataController.allVehicleList[j]["accStatus"] = 0;
                                dataController.flameoutNum++;
                            } else {
                                dataController.allVehicleList[j]["isStop"] = false;
                                dataController.allVehicleList[j]["state"] = 'run';
                                dataController.allVehicleList[j]["accStatus"] = 1;
                                dataController.runNum++;
                            }
                        } else {
                            dataController.allVehicleList[j]["isStop"] = true;
                            dataController.allVehicleList[j]["state"] = 'flameout';
                            dataController.allVehicleList[j]["accStatus"] = 0;
                            dataController.flameoutNum++;
                            dataController.allVehicleList[j]["obdSpeed"] = 0;
                            //表示从来没有上传过obd数据的设备,无法判断设备的行驶状态
                        }
                        //设置不同状态车辆的数量
                        dataController.setNumOfVehiclesInDiffState();
                        //暂时将查询结果存储在对象当中，方便定位使用
                        dataController.allVehicleMap[item.vehicleCode] = dataController.allVehicleList[j];
                        //把车辆按照机构分组
                        dataController.addDeptToVehicleMap(dataController.allVehicleList[j]);
                        //更新完缓存后立刻对机构树的车辆状态图标进行更新
                        reloadTreeData();
                    }

                },
                error: function () {
                    console.log("vehicleCount error");
                }
            });
        };

        this.getVehicleGps = function () {//获取GPS数据,从缓存的allVehicleMap和allVehicleStateMap

        };
        this.getVehicleState = function () {

        };
        this.setNumOfVehiclesInDiffState = function () {
            $("#vehicleNum").text(dataController.vehicleNum);
            $("#runNum").text(dataController.runNum);
            $("#flameoutNum").text(dataController.flameoutNum);
            $("#stopNum").text(dataController.stopNum);
            $("#repairNum").text(dataController.repairNum);
            $("#abnormalNum").text(dataController.abnormalNum);
            $("#_fault").text(dataController.faultNum);
        };
        this.addDeptToVehicleMap = function (vehicle) {//添加车辆,按照机构分组
            if (dataController.deptIdToVehicleMap[vehicle.deptId] == undefined) {
                var deptArr = [];
                deptArr.push(vehicle);
                dataController.deptIdToVehicleMap[vehicle.deptId] = deptArr;
            } else {
                dataController.deptIdToVehicleMap[vehicle.deptId].push(vehicle)
            }
        };
        this.addVehicleMarkerClickEvent = function () {
            if (dataController.isVehicleMarkerNeedClickEvent) {
                marker.addEventListener("click", function (e) {
                    var vehicleDetail = e.target.vehicleDetail;
                    openMessageWindowNoClick(e.target, vehicleDetail)
                });
            }
        };
    }
}