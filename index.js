require.config({
    baseUrl: 'js',
    paths: {
        vow: '../vendor/vow',
        jquery: '../vendor/jquery',
        'jquery.svg': '../vendor/jquery.svg'
    },
    shim: {
        'jquery.svg': ['jquery']
    }
});

require(['jquery', 'calc', 'draw', 'vow'], function ($, Calc, Draw) {
    var canvas, paper, config, $config,
        params = {};

    $(document).ready(function () {
        canvas = new Draw($('#b-result'));
        paper = canvas.paper;
        config = document.config;
        $config = $(config);

        $config.find('input').keyup(onConfigChange);

        $config.find('.b-config__extraparams').click(function (e) {
            $config.toggleClass('b-config_extra-params_visible');
            e.preventDefault();
            return false;
        });

        $config.find('.b-config__launch').click(launchCalc);

        onConfigChange();
    });

    function onConfigChange() {
        if (!canvas || !paper) return;
        if ($(config.c).prop('disabled')) return;

        var c = +($(config.c).val()),
            M = +($(config.M).val()),
            alpha = +($(config.alpha).val()),
            x0 = +($(config.x0).val()),
            N = +($(config.N).val());

        if (c < 0.01) c = 0.01;
        if (c > 0.5) c = 0.5;
        if (M < 2) M = 2;
        if (M > 5) M = 5;
        if (alpha < -20) alpha = -20;
        if (alpha > 20) alpha = 20;
        if (x0 < 0.001) x0 = 0.001;
        if (x0 > 0.5) x0 = 0.5;
        if (N < 2) N = 2;
        if (N > 50) N = 50;

        if ((params.c != c) ||
            (params.M != M) ||
            (params.alpha != alpha) ||
            (params.x0 != x0) ||
            (params.N != N)) {

            params = {
                c: c,
                M: M,
                alpha: alpha,
                x0: x0,
                N: N
            };

            canvas.drawProblem(params);
        }
    }

    function launchCalc() {
        var Vow = require('vow');
        canvas.clearProblem();
        canvas.clearResult();

        $config.find('input').prop('disabled', true);
        $(config.c).val(params.c);
        $(config.M).val(params.M);
        $(config.alpha).val(params.alpha);
        $(config.x0).val(params.x0);
        $(config.N).val(params.N);

        var calc = new Calc(params),
            pointAccumulator = [],
            accumulatorFlag = true,
            accumulatorInterval = setInterval(function(){
                if(!accumulatorFlag) return;
                accumulatorFlag = false;

                while(pointAccumulator.length) {
                    canvas.drawResultPoint(pointAccumulator.pop());

                    console.log('another point');
                }

                accumulatorFlag = true;
            }, 100);

        canvas.drawResult(calc);

        var promise = calc.start();

        promise.progress(function(point){
            pointAccumulator.push(point);
        });

        promise.then(function(){
            clearInterval(accumulatorInterval);
            canvas.clearResult();
            canvas.drawResult(calc);
            $config.find('input').removeProp('disabled');
            MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
        });
    }
});
