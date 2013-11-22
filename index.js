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

require(['jquery', 'calc', 'draw', 'vow', 'zoom', 'inform'], function ($, Calc, Draw) {
    var canvas, paper, config, $config,
        params = {},
        $doc = $(document);

    $doc.ready(function () {
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

        var informer = $('.b-scroll-area__informer'),
            informerFn = require('inform');
        $doc.on('mouseenter click', '.b-point', function () {
            var $this = $(this),
                dataStr = $this.data('point'),
                data = {};
            if (dataStr.substr(0, 8) === 'return {') {
                data = Function(dataStr)();
            }

            informerFn(data, informer);
        });

        require('zoom').init();

        onConfigChange();
    });

    function onConfigChange() {
        if (!canvas || !paper) return;
        if ($(config.c).prop('disabled')) return;

        var c = +($(config.c).val()),
            M = +($(config.M).val()),
            alpha = +($(config.alpha).val()),
            k = +($(config.k).val()),
            x0 = +($(config.x0).val()),
            Nt = +($(config.Nt).val()),
            Nb = +($(config.Nb).val());

        if (c < 0.01) c = 0.01;
        if (c > 0.5) c = 0.5;
        if (M < 2) M = 2;
        if (M > 5) M = 5;
        if (alpha < -20) alpha = -20;
        if (alpha > 20) alpha = 20;
        if (x0 < 0.001) x0 = 0.001;
        if (x0 > 0.5) x0 = 0.5;
        if (Nt < 8) Nt = 8;
        if (Nt > 50) Nt = 50;
        if (Nb < 8) Nb = 8;
        if (Nb > 50) Nb = 50;

        if ((params.c != c) ||
            (params.M != M) ||
            (params.alpha != alpha) ||
            (params.k != k) ||
            (params.x0 != x0) ||
            (params.Nt != Nt) ||
            (params.Nb != Nb)) {

            params = {
                c: c,
                M: M,
                alpha: alpha,
                k: k,
                x0: x0,
                Nt: Nt,
                Nb: Nb
            };

            canvas.drawProblem({
                c: c,
                M: M,
                alpha: alpha * Math.PI / 180,
                k: k,
                x0: x0,
                Nt: Nt,
                Nb: Nb
            });
        }
    }

    function launchCalc() {
        canvas.clearProblem();
        canvas.clearResult();

        $config.find('input').prop('disabled', true);
        $(config.c).val(params.c);
        $(config.M).val(params.M);
        $(config.alpha).val(params.alpha);
        $(config.k).val(params.k);
        $(config.x0).val(params.x0);
        $(config.Nt).val(params.Nt);
        $(config.Nb).val(params.Nb);

        var calc = new Calc({
                c: params.c,
                M: params.M,
                alpha: params.alpha * Math.PI / 180,
                k: params.k,
                x0: params.x0,
                Nt: params.Nt,
                Nb: params.Nb
            }),
            pointAccumulator = [],
            accumulatorFlag = true,
            accumulatorInterval = setInterval(function () {
                if (!accumulatorFlag) return;
                accumulatorFlag = false;

                while (pointAccumulator.length) {
                    canvas.drawPoint(pointAccumulator.pop(), canvas.resultDrawArea);
                }

                accumulatorFlag = true;
            }, 100);

        canvas.drawResult(calc);

        var promise = calc.start(canvas);

        promise.progress(function (point) {
            pointAccumulator.push(point);
        });

        promise.always(function (p) {
            clearInterval(accumulatorInterval);
            canvas.clearResult();
            canvas.drawResult(calc);
            require('inform')(calc, $('#coef_result'));
            $config.find('input').removeProp('disabled');
            if (p.isRejected()) throw p.valueOf();
        });
    }
});
