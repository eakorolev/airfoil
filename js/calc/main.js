define(['jquery', 'vow', 'calc/solve'], function (jQuery, Vow) {
        return function (fn, dfn, params, N, sgnY, grid, mainPromise, draw) {
            var side = Math.sgn(sgnY),
                c = params.c,
                Mi = params.M,
                k = params.k,
                x0 = params.x0,
                alpha = side * params.alpha,
                f = function (x) {
                    return side * fn(x, c);
                },
                df = function (x) {
                    return side * dfn(x, c);
                },
                kCp = 2 / (k * Math.sq(Mi));

            callCalc(0, 0) // вычисляем точки за скачком
                .done(function () {
                    callCalc(1, 0).done(); // запускаем рекуррентный расчет по профилю
                });

            function callCalc(i, j) { // "асинхронный" вызов расчета точки
                var promise = Vow.promise();
                setTimeout(function () {
                    calcPoint(i, j, promise);
                }, 0);
                return promise;
            }

            function calcPoint(i, j, promise) {
                if (i < 0 || j < 0 || j > N) {
                    promise.reject(Error('Point is out of grid'));
                    return;
                }
                var tmp = getPoint(i, j);
                if (tmp) {
                    promise.fulfill(tmp);
                } else if (i == 0) { // точка непосредственно за скачком
                    calcShock();
                    promise.fulfill(getPoint(0, j));
                } else if (j == 0) { // точка на профиле
                    Vow.all([
                            callCalc(i - 1, 1),
                            callCalc(i - 1, 0)
                        ]).done(function (ps) {
                            var point = p3(ps[0]);
                            storePoint(i, 0, point);
                            promise.fulfill(point);
                            if (2 * point.x - ps[1].x < 1) {
                                callCalc(i + 1, 0).done(); // вызываем расчет следующего слоя
                            } else {
                                promise.fulfill({});
                                mainPromise.fulfill(true);
                            }
                        }
                    )
                    ;
                }
                else if (j == N) { // точка на скачке уплотнения
                    Vow.all([
                            callCalc(i, j - 1),
                            callCalc(i - 1, j)
                        ]).done(function (ps) {
                            var point = p5(ps[0], ps[1]);
                            storePoint(i, j, point);
                            promise.fulfill(point);
                        });
                } else { // точка между профилем и скачком
                    Vow.all([
                            callCalc(i, j - 1),
                            callCalc(i - 1, j + 1)
                        ]).done(function (ps) {
                            var point = p2(ps[0], ps[1]);
                            storePoint(i, j, point);
                            promise.fulfill(point);
                        });
                }
            }

            function calcShock() { // первый ряд точек за скачком
                var omega0 = Math.atan2(f(x0), x0),
                    epsilon = omega0 - alpha,
                    beta = require('calc/solve')(
                        function (b) {
                            return shockLH(b, epsilon)
                        }, epsilon, 1e-3, 1e-8),
                    point = {};
                point.V = Math.sqrt(Math.sq(Math.cos(beta)) * (1 + Math.sq(Math.tan(beta - epsilon))));
                point.Vx = point.V * Math.cos(omega0);
                point.Vy = point.V * Math.sin(omega0);
                point.rho = Math.tan(beta) / Math.tan(beta - epsilon); // ρ/ρ∞
                point.p = 2 * k / (k + 1) * Math.sq(Mi * Math.sin(beta)) - (k - 1) / (k + 1); // p/p∞
                point.T = point.p / point.rho; // T/T∞
                point.a = Math.sqrt(point.T) / Mi;
                point.M = point.V / point.a;
                point.mu = Math.asin(1 / point.M);
                grid.p0 = point.p * Math.pow((1 + (k - 1) / 2 * Math.sq(point.M)), k / (k - 1)); // p0/p∞
                point.Cp = kCp * ((Math.pow(1 + (k - 1) / 2 * Math.sq(point.M), -k / (k - 1))) * grid.p0 - 1);

                var k1 = Math.tan(beta + side * params.alpha),
                    k2 = Math.tan(point.mu + omega0),
                    yA = f(x0),
                    xB = (yA - k2 * x0) / (k1 - k2),
                    yB = k1 * xB,
                    dx = (xB - x0) / N,
                    dy = (yB - yA) / N;
                for (var iteratorJ = 0; iteratorJ <= N; iteratorJ++) {
                    if (iteratorJ > 0) delete point.Cp;
                    point.x = x0 + iteratorJ * dx;
                    point.y = yA + iteratorJ * dy;
                    storePoint(0, iteratorJ, point);
                }
            }

            function L1(point) {
                return (-point.Vx * point.Vy - point.a * Math.sqrt(Math.sq(point.V) - Math.sq(point.a))) / (Math.sq(point.a) - Math.sq(point.Vx));
            }

            function L2(point) {
                return (-point.Vx * point.Vy + point.a * Math.sqrt(Math.sq(point.V) - Math.sq(point.a))) / (Math.sq(point.a) - Math.sq(point.Vx));
            }

            function p3(p) {
                var L2p = L2(p),
                    B = L2p / (2 * c) - 1,
                    C = (p.y - p.x * L2p) / (2 * c),
                    Z = -L2p * (Math.sq(p.a) - Math.sq(p.Vx)) / (Math.sq(p.a) - Math.sq(p.Vy)),
                    point = {};

                point.x = 0.5 * (-B - Math.sqrt(Math.sq(B) - 4 * C));
                point.y = f(point.x);
                var dfx = df(point.x);
                point.Vx = (p.Vy - Z * p.Vx) / (dfx - Z);
                point.Vy = dfx * point.Vx;
                point.V = Math.sqrt(Math.sq(point.Vx) + Math.sq(point.Vy));
                point.a = Math.sqrt((1 + 0.5 * (k - 1) * Math.sq(Mi)) / Math.sq(Mi) - 0.5 * (k - 1) * Math.sq(point.V));
                point.M = point.V / point.a;
                point.Cp = kCp * ((Math.pow(1 + (k - 1) / 2 * Math.sq(point.M), -k / (k - 1))) * grid.p0 - 1);
                return point;
            }

            function p2(q, n) {
                var point = {},
                    L1q = L1(q),
                    L2n = L2(n),
                    Zq = -L1q * (Math.sq(q.a) - Math.sq(q.Vx)) / (Math.sq(q.a) - Math.sq(q.Vy)),
                    Zn = -L2n * (Math.sq(n.a) - Math.sq(n.Vx)) / (Math.sq(n.a) - Math.sq(n.Vy));
                point.x = (q.y - n.y - L1q * q.x + L2n * n.x) / (L2n - L1q);
                point.y = (L1q * L2n * (n.x - q.x) + L2n * q.y - L1q * n.y) / (L2n - L1q);
                point.Vx = (q.Vy - n.Vy - Zq * q.Vx + Zn * n.Vx) / (Zn - Zq);
                point.Vy = (Zq * Zn * (n.Vx - q.Vx) + Zn * q.Vy - Zq * n.Vy) / (Zn - Zq);
                point.V = Math.sqrt(Math.sq(point.Vx) + Math.sq(point.Vy));
                point.a = Math.sqrt((1 + 0.5 * (k - 1) * Math.sq(Mi)) / Math.sq(Mi) - 0.5 * (k - 1) * Math.sq(point.V));
                point.M = point.V / point.a;
                return point;
            }

            function rotate(p, angle) {
                var r = jQuery.extend(true, {}, p);
                r.x = p.x * Math.cos(angle) + p.y * Math.sin(angle);
                r.y = -p.x * Math.sin(angle) + p.y * Math.cos(angle);
                r.Vx = p.Vx * Math.cos(angle) + p.Vy * Math.sin(angle);
                r.Vy = -p.Vx * Math.sin(angle) + p.Vy * Math.cos(angle);
                return r;
            }

            function shockVy(n, Vx) {
                return n.Vy + ( -L1(n) * (Math.sq(n.a) - Math.sq(n.Vx)) / (Math.sq(n.a) - Math.sq(n.Vy))) * (Vx - n.Vx);
            }

            function shockLH(b, e) {
                var mb = Math.sq(Mi * Math.sin(b));
                return (Math.tan(b) / Math.tan(b - e) - 0.5 * (k + 1) * mb) / (1 + 0.5 * (k - 1) * mb);
            }

            function shockVLH(T, Vx) {
                var acr2 = 2 * (1 + 0.5 * (k - 1) * Math.sq(Mi)) / (Math.sq(Mi) * (k + 1));
                return Math.sq(shockVy(T, Vx)) - Math.sq(1 - Vx) * (Vx - acr2) / (2 / (k + 1) + acr2 - Vx);
            }

            function p5(n, a) {
                var na = rotate(n, alpha),
                    aa = rotate(a, alpha),
                    ra = {};

                ra.Vx = require('calc/solve')(
                    function (Vx) {
                        return shockVLH(na, Vx)
                    }, 1, -1e-3, 1e-8);
                ra.Vy = shockVy(na, ra.Vx);
                var e = Math.atan2(ra.Vy, ra.Vx),
                    b = require('calc/solve')(
                        function (b) {
                            return shockLH(b, e)
                        }, e, 1e-4, 1e-8),
                    L1na = L1(na);

                ra.x = (na.y - aa.y - L1na * na.x + Math.tan(b) * aa.x) / (Math.tan(b) - L1na);
                ra.y = aa.y + Math.tan(b) * (ra.x - aa.x);
                ra.V = Math.sqrt(Math.sq(ra.Vx) + Math.sq(ra.Vy));
                ra.rho = Math.tan(b) / Math.tan(b - e);
                ra.p = 2 * k / (k + 1) * Math.sq(Mi * Math.sin(b)) - (k - 1) / (k + 1);
                ra.T = ra.p / ra.rho;
                ra.a = Math.sqrt(ra.T) / Mi;
                ra.M = ra.V / ra.a;

//                n.theta = Math.atan2(n.Vy, n.Vx);
//                na.theta = Math.atan2(na.Vy, na.Vx);
//                a.theta = Math.atan2(a.Vy, a.Vx);
//                aa.theta = Math.atan2(aa.Vy, aa.Vx);
//                ra.theta = Math.atan2(ra.Vy, ra.Vx);
//                console.log(n, na);
//                console.log(a, aa);
//                console.log(ra);
//
////                draw.drawPoint(n);
////                draw.drawPoint(a);
//                draw.drawPoint(na);
//                draw.drawPoint(aa);
//                draw.drawPoint(ra);
//
                return rotate(ra, -alpha);
            }

            function getPoint(i, j) {
                if (!(grid[i] && grid[i][j])) return;
                var point = jQuery.extend(true, {}, grid[i][j]);
                point.y *= sgnY;
                point.Vy *= sgnY;
                delete point.theta;
                return point;
            }

            function storePoint(i, j, point, rewrite) {
                if (grid[i] === undefined) grid[i] = [];
                if (grid[i][j] === undefined || !!rewrite) {
                    var p = grid[i][j] = jQuery.extend(true, {}, point);
                    p.y *= side;
                    p.Vy *= side;
                    p.theta = Math.atan2(grid[i][j].Vy, grid[i][j].Vx);
                    if (isNaN(p.x) ||
                        isNaN(p.y) ||
                        isNaN(p.M) ||
                        isNaN(p.theta)) {
                        mainPromise.reject(Error('Point [' + i + '][' + j + '] was calculated incorrect'));
                    } else {
                        mainPromise.notify(grid[i][j]);
                    }
                }
            }
        };
    }
)
;
