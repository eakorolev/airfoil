define(['vow', 'calc/main'], function (Vow) {
    if (!Math.sgn) Math.sgn = function (x) {
        return (x < 0) ? -1 : +1;
    };
    if (!Math.sq) Math.sq = function (x) {
        return x * x;
    };

    function Calc(params) {
        this.params = params;
        this.grid_top = [];
        this.grid_bottom = [];
    }

    Calc.prototype.start = function (canvas) {
        var that = this,
            vow1 = Vow.promise(),
            vow2 = Vow.promise(),
            vow = Vow.all([vow1, vow2]).then(function () {
                that.Cx = integr(that.grid_top, Calc.foil_top_der) - integr(that.grid_bottom, Calc.foil_bottom_der);
                that.Cy = -integr(that.grid_top, _1) + integr(that.grid_bottom, _1);
                that.mz = that.mza = integr(that.grid_top, _x) - integr(that.grid_bottom, _x);
                that.Cxa = that.Cx * Math.cos(that.params.alpha) + that.Cy * Math.sin(that.params.alpha);
                that.Cya = -that.Cx * Math.sin(that.params.alpha) + that.Cy * Math.cos(that.params.alpha);
            });

        vow1.progress(function (val) {
            vow.notify(val);
        });
        vow2.progress(function (val) {
            vow.notify(val);
        });

        setTimeout(function () {
            require('calc/main')(Calc.foil_top, Calc.foil_top_der, that.params, that.params.Nt, +1, that.grid_top, vow1, canvas);
        }, 0);
        setTimeout(function () {
            require('calc/main')(Calc.foil_bottom, Calc.foil_bottom_der, that.params, that.params.Nb, -1, that.grid_bottom, vow2, canvas);
        }, 0);

        return vow;

        function integr(grid, mult) {
            var res = 0,
                x = 0,
                x0 = 0,
                i = 0;
            while (grid[i] && x < 1) {
                x = grid[i][0].x;
                res += grid[i][0].Cp * mult(x, that.params.c) * (x - x0);
                x0 = x;
                i++;
            }
            x = 1;
            res += grid[i - 1][0].Cp * mult(x, that.params.c) * (x - x0);
            return res;
        }

        function _1() {
            return 1;
        }

        function _x(x) {
            return x;
        }
    };

    Calc.foil_top = function (x, c) {
        return 2 * c * x * (1 - x);
    };

    Calc.foil_top_der = function (x, c) {
        return 2 * c * (1 - 2 * x);
    };

    Calc.foil_bottom = function (x, c) {
        return -2 * c * x * (1 - x);
    };

    Calc.foil_bottom_der = function (x, c) {
        return -2 * c * (1 - 2 * x);
    };

    return Calc;
});
