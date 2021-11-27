/****************
 * 保存配置信息类
 ****************/
function Config() {

    /**
     * 配置信息，给定了一些初始值
     */
    var config = {
        min: 0,
        max: 10,
        addition: true,
        subtraction: true,
        times: 0,
        timesUnit: 's',
        topicCnt: 0
    };

    /**
     * 保存配置信息
     */
    this.saveConfig = function() {
        localStorage.setItem('config', JSON.stringify(config));
    }

    this.get = function(key) {
        return config[key];
    }

    this.set = function(key, val) {
        config[key] = val;
    }

    var p_config = localStorage.getItem('config');
    var cfg;
    if (p_config) {
        try {
            cfg = JSON.parse(p_config);
            if ($.isPlainObject(cfg)) {
                $.extend(true, config, cfg);
            }
        } catch (error) {}
    }

}

/*******************
 * 算术工具和其他工具
 *******************/
function MathTool() {
    /**
     * 在min-max之间产生随机数
     * @param {number} min 最小值（包括）
     * @param {number} max 最大值（包括）
     * @returns 返回随机数
     */
    function getRndInteger(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * 出加法题
     */
    function askAddQuestions(sumMin, sumMax) {
        var sum = getRndInteger(sumMin, sumMax);
        var add1 = getRndInteger(0, sum);
        var add2 = sum - add1;
        return {
            surface: add1 + '+' + add2,
            answer: add1 + add2
        }
    }

    /**
     * 出减法题
     */
    function askSubsQuestions(minusMin, minusMax) {
        var minus1 = getRndInteger(minusMin, minusMax);
        var minus2 = getRndInteger(0, minus1);
        return {
            surface: minus1 + '-' + minus2,
            answer: minus1 - minus2
        }

    }

    /**
     * 格式化时间
     * @param {Number} sesc 单位秒
     */
    function formatTime(sesc) {
        if (sesc < 60) {
            return sesc + '秒';
        } else if (sesc < 3600) {
            return Math.floor(sesc / 60) + '分' + (sesc % 60) + '秒';
        } else {
            var h = Math.floor(sesc / 3600);
            var ms = sesc % 3600;
            return h + '时' + Math.floor(ms / 60) + '分' + (ms % 60) + '秒';
        }
    }

    /**
     * 格式化时间
     * @param {Number} sesc 单位毫秒
     */
    function formatMsecTime(msec) {
        var sesc = Math.floor(msec / 1000);
        return formatTime(sesc);
    }

    return {
        formatTime: formatTime,
        formatMsecTime: formatMsecTime,
        getRndInteger: getRndInteger,
        askAddQuestions: askAddQuestions,
        askSubsQuestions: askSubsQuestions
    };
}


$(function() {

    var isTest = false; //是否在测试
    var isTestNext = false; //是否时测试完成后
    var testTime = 0; //测试时间
    var testInterval; // 定时器

    var config = new Config();
    var MT = MathTool();

    // 一些初始操作
    (function() {
        // 调整histroy高度
        var mainCtx = $('#mainContext');
        var history = $('#history');
        var top = mainCtx.position().top;
        var htop = history.position().top;
        var marginTop = parseInt($('#mainContext').css('margin-top'));
        history.height(top - htop + marginTop - 5);

        // 将配置信息设置到界面
        $('#minnum').val(config.get('min'));
        $('#maxnum').val(config.get('max'));
        $('#addition').prop('checked', config.get('addition'));
        $('#subtraction').prop('checked', config.get('subtraction'));
        $('#times').val(config.get('times'));
        $('#timesUnit').val(config.get('timesUnit'));
        $('#topicCnt').val(config.get('topicCnt'));
    })();

    /**
     * 显示题目
     * @param {Number} min 
     * @param {Number} max 
     */
    function showQuestion() {
        var min = config.get('min'),
            max = config.get('max');
        min = parseInt(min);
        max = parseInt(max);
        if (min > max) {
            setMainContext('最小值大于最大值');
            return;
        }
        var questions = [];
        if (config.get('addition')) {
            questions.push(MT.askAddQuestions);
        }
        if (config.get('subtraction')) {
            questions.push(MT.askSubsQuestions);
        }
        if (questions.length) {
            var idx = MT.getRndInteger(0, questions.length - 1);
            var question = questions[idx](min, max);
            $('#mainContext').data('question', question).data('reply', []);
            setMainContext(question.surface);
            testCallback();
        } else {
            setMainContext('请勾选算法类型');
            $('#mainContext').removeData('reply').removeData('question');
        }
    }

    /**
     * 在mainContext里显示内容
     */
    function setMainContext(msg) {
        var div = $('#mainContext');
        var width = div.width();
        var txt = $('<span>' + msg + '</span>');
        div.empty().append(txt);
        var txtWidth = txt.width();
        if (width < txtWidth) {
            txt.css('font-size', (4.75 * width / txtWidth) + 'rem');
        }
    }

    $('#keys td').on('click', function() {
        var btn = $(this);
        var val = btn.data('val');
        var context = $('#mainContext');
        var reply = context.data('reply');
        if (reply) {
            if (val === 'cls') {
                reply = [];
            } else if (val === 'bks') {
                if (reply.length) {
                    reply.splice(reply.length - 1, 1);
                }
            } else {
                reply.push(val);
            }
            context.data('reply', reply);
            var que = context.data('question');
            if (reply.length) {
                if (replyResult(reply) == que.answer) {
                    var his = $('#history');
                    his.append('<div>' + que.surface + '=' + que.answer + '</div>');
                    his.scrollTop(his.prop("scrollHeight"));
                    // 出下一题
                    showQuestion();
                    return;
                }
            }
            if (que) {
                var asr = reply.join('');
                if (asr) {
                    setMainContext(que.surface + '=' + asr);
                } else {
                    setMainContext(que.surface);
                }
            }
        }
    });

    function replyResult(reply) {
        var res = 0;
        for (var i = 0; i < reply.length; i++) {
            res = res + parseInt(reply[i]) * Math.pow(10, reply.length - 1 - i);
        }
        return res;
    }

    // 键盘按下变色
    $('#keys td').on('touchstart', function() {
        var btn = $(this);
        btn.css('background-color', 'khaki');
    }).on('touchend', function() {
        var btn = $(this);
        btn.css('background-color', 'transparent');
    });

    // 下一题按钮
    $('#nextBtn').on('click', function() {
        showQuestion();
    });
    // 显示答案按钮
    $('#ansBtn').on('click', function() {
        var context = $('#mainContext');
        var que = context.data('question');
        if (que) {
            setMainContext(que.surface + '=' + que.answer);
        }
    });

    // 显示配置界面
    $('#configBtn').on('click', function() {
        $('#configDiv').show();
    });
    // 关闭配置界面
    $('#configClose').on('click', function() {
        $('#configDiv').hide();
    });

    // 开始测试按钮
    $('#startBtn').on('click', function() {
        var times = $('#times');
        var timesUnit = $('#timesUnit');
        var topicCnt = $('#topicCnt');

        var timesVal = parseInt(times.val() * (timesUnit.val() === 'm' ? 60 : 1));
        var topicCntVal = parseInt(topicCnt.val());

        if (timesVal || topicCntVal) {
            startTest(timesVal, topicCntVal);
            config.set('times', times.val());
            config.set('timesUnit', timesUnit.val());
            config.set('topicCnt', topicCntVal);
            config.saveConfig();
        } else {
            alert('[时间]和[题目数]至少填一个');
        }
    });

    function testCallback() {
        if (isTest) {
            var topicNo = $('#topicNo');
            var cnt = topicNo.data('cnt');
            var max = topicNo.data('max');
            if (max) {
                if (cnt == max) {
                    endTest('完成' + max + '道题！耗时：' + MT.formatMsecTime(Date.now() - testTime));
                    return;
                }
                topicNo.html('第' + (++cnt) + '/' + max + '题');
            } else {
                topicNo.html('第' + (++cnt) + '题');
            }
            topicNo.data('cnt', cnt);
        } else {
            if (isTestNext) {
                clsTestTips();
                isTestNext = false;
            }
        }
    }

    function clsTestTips() {
        $('#topicNo').html('');
        $('#timeCnt').html('');
        $('#timeMax').html('');
    }

    function startTest(timesVal, topicCntVal) {
        isTest = true;
        testTime = Date.now();
        clsTestTips();
        $('#topicNo').data('cnt', 0).data('max', topicCntVal);
        $('#timeConsume').data('max', timesVal);

        if (timesVal) {
            $('#timeMax').html('/' + MT.formatTime(timesVal)).show();
        } else {
            $('#timeMax').hide();
        }
        clearInterval(testInterval);
        testInterval = setInterval(function() {
            $('#timeCnt').html(MT.formatMsecTime(Date.now() - testTime));
            if (timesVal) {
                if ((Date.now() - testTime) >= timesVal * 1000) {
                    endTest('时间到，共完成' + ($('#topicNo').data('cnt') - 1) + '道题');
                }
            }
        }, 1000);

        $('#history').html('');
        $('#configDiv').hide();
        showQuestion();
    }

    function endTest(msg) {
        clearInterval(testInterval);
        isTest = false;
        isTestNext = true;
        alert(msg);
    }



    function configChange(e) {
        var input = $(e.target);
        var inputId = input.attr('id');
        if (inputId === 'subtraction') {
            config.set('subtraction', input.prop('checked'));
        } else if (inputId === 'addition') {
            config.set('addition', input.prop('checked'));
        } else if (inputId === 'minnum') {
            config.set('min', input.val());
        } else if (inputId === 'maxnum') {
            config.set('max', input.val());
        }
        config.saveConfig();
    }

    $('#minnum').on('change', configChange);
    $('#maxnum').on('change', configChange);
    $('#addition').on('change', configChange);
    $('#subtraction').on('change', configChange);

    showQuestion();

});