$(function() {

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
    function askAddQuestions(min, max) {
        var add1 = getRndInteger(min, max);
        var add2 = getRndInteger(min, max);
        return {
            surface: add1 + '+' + add2,
            answer: add1 + add2
        }
    }

    /**
     * 出减法题
     */
    function askSubsQuestions(min, max) {
        var add1 = getRndInteger(min, max);
        var add2 = getRndInteger(min, max);
        if (add1 >= add2) {
            return {
                surface: add1 + '-' + add2,
                answer: add1 - add2
            }
        } else {
            return {
                surface: add2 + '-' + add1,
                answer: add2 - add1
            }
        }
    }

    function showQuestion() {
        var addOrSubs = getRndInteger(0, 1);
        var min = 0;
        var max = 10;
        var question;
        if (addOrSubs == 1) {
            question = askAddQuestions(min, max);
        } else {
            question = askSubsQuestions(min, max)
        }
        $('#mainContext').html(question.surface).data('question', question);
    }

    $('#mainContext').on('click', showQuestion);
    $('#ansBtn').on('click', function() {
        var context = $('#mainContext')
        var que = context.data('question');
        if (que) {
            context.html(que.surface + '=' + que.answer);
        }
    });


    showQuestion();

});