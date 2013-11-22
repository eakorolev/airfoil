define(function () {
    return function (F, x0, dx, accuracy) {
        var x = x0 + Math.sgn(dx) * accuracy,
            s0 = Math.sgn(F(x0));
        while (Math.sgn(F(x)) == s0) x += dx;
        var xl = x - dx,
            xr = x;
        while (Math.abs(xr - xl) > accuracy) {
            x = 0.5 * (xl + xr);
            if (Math.sgn(F(xl)) == Math.sgn(F(x))) {
                xl = x;
            } else {
                xr = x;
            }
        }
        return x;
    };
});
