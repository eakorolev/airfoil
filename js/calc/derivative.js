define(function () {
    return function (f, x0, h) {
        h = +h || .00001;
        var res = [], isFinite = [];
        for (var i = -2; i <= 2; i++) {
            res[i] = f(x0 + i * h);
            isFinite[i] = Number.isFinite(res[i]);
        }

        if (!isFinite[0]) return NaN;

        if (isFinite[-2] && isFinite[-1] && isFinite[1] && isFinite[2]) {
            return (-res[2] + 8 * res[1] - 8 * res[-1] + res[-2]) / (12 * h)
        } else if (isFinite[-1] && isFinite[1]) {
            return (res[1] - res[-1]) / (2 * h);
        } else if (isFinite[1]) {
            return (res[1] - res[0]) / h;
        } else if (isFinite[-1]) {
            return (res[0] - res[-1]) / h;
        } else return NaN;
    };
});
