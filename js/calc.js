define(['./calc/derivative', 'vow'], function (der, Vow) {
    function Calc(params) {
        this.params = {
            c: params.c,
            M: params.M,
            alpha: params.alpha,
            x0: params.x0,
            N: params.N
        }
    }

    Calc.prototype.start = function() {
        return Vow.promise('ok');
    };

    Calc.foil_top = function (x, c) {
        return 2 * c * x * (1 - x);
    };

    Calc.foil_bottom = function (x, c) {
        return -2 * c * x * (1 - x);
    };

    return Calc;
});
