define(['jquery', 'calc', 'jquery.svg'], function ($, Calc) {
    function Draw(el) {
        this.paper = $(el).svg().svg('get');
        this.resultDrawArea = $(this.paper.group({class: 'b-result__result'}));
        this.problemDrawArea = $(this.paper.group({class: 'b-result__problem'}));
    }

    Draw.params = {
        foilXStep: 0.01,
        fixScale: 1000,
        fixAccuracy: 3,
        machScale: 0.04,
        machArrowLenght: 0.025,
        machArrowWidth: 0.0025,
        pointRadius: 3,
        shockWidth: 3
    };

    Draw.fix = function (v) {
        return +(v * Draw.params.fixScale).toFixed(Draw.params.fixAccuracy);
    };

    Draw.prototype.getFoil = function (params, parent) {
        var points = this.paper.createPath().move(0, 0);
        for (var x = 0; x <= 1; x += Draw.params.foilXStep)
            points.line(Draw.fix(x), -Draw.fix(Calc.foil_top(x, params.c)));
        for (x = 1; x >= 0; x -= Draw.params.foilXStep)
            points.line(Draw.fix(x), -Draw.fix(Calc.foil_bottom(x, params.c)));
        points.close();
        return  this.paper.path(parent, points, {
            stroke: 'black',
            strokeWidth: 3,
            fill: 'url(#hatch0_45)'
        });
    };

    Draw.prototype.getMachArrow = function (params, parent) {
        var gr = this.paper.group(parent, {
                transform: 'rotate(' + (-params.alpha * 180 / Math.PI) + ')'
            }),
            arrowLenght = Draw.fix(params.M * Draw.params.machScale);
        this.paper.path(
            gr,
            this.paper.createPath().move(-arrowLenght, 2).line(-47, 2).line(-50, 5).line(-10, 0).line(-50, -5).line(-47, -2).line(-arrowLenght, -2).close(), {
                stroke: 'white',
                strokeWidth: 1
            }
        );
        this.paper.text(gr, -arrowLenght - 50, 10, this.paper.createText().string('M').span('∞', { 'baseline-shift': 'sub'}));
        return gr;
    };

    Draw.prototype.drawProblem = function (params) {
        this.clearProblem();

        this.paper.change(this.getFoil(params, this.problemDrawArea), {
            stroke: 'grey',
            strokeWidth: '2',
            fill: 'none'
        });

        this.paper.change(this.getMachArrow(params, this.problemDrawArea), {
            fill: 'grey'
        });

        this.paper.circle(this.problemDrawArea, Draw.fix(params.x0), -Draw.fix(Calc.foil_top(params.x0, params.c)), Draw.params.pointRadius + 1, {
            stroke: 'grey',
            fill: 'white'
        });

        this.paper.circle(this.problemDrawArea, Draw.fix(params.x0), -Draw.fix(Calc.foil_bottom(params.x0, params.c)), Draw.params.pointRadius + 1, {
            stroke: 'grey',
            fill: 'white'
        });
    };

    Draw.prototype.clearProblem = function () {
        this.problemDrawArea.empty();
    };

    Draw.prototype.clearResult = function () {
        this.resultDrawArea.empty();
    };

    Draw.prototype.drawResult = function (calc) {
        var that = this;

        that.clearProblem();
        that.paper.change(that.getFoil(calc.params, that.resultDrawArea));
        that.paper.change(that.getMachArrow(calc.params, that.resultDrawArea));

        drawGrid(calc.grid_top, calc.params.Nt);
        drawGrid(calc.grid_bottom, calc.params.Nb);

        function drawGrid(grid, N) {
            for (var i = 0; grid[i]; i++) drawRow(grid, i);
            drawShock(grid, N);
        }

        function drawShock(grid, N) {
            var shock = that.paper.createPath().move(Draw.fix(0), -Draw.fix(0));
            for (var i = 0; grid[i] && grid[i][N]; i++) {
                shock.line(Draw.fix(grid[i][N].x), -Draw.fix(grid[i][N].y));
            }
            that.paper.path(
                that.resultDrawArea,
                shock,
                {
                    stroke: 'black',
                    strokeWidth: Draw.params.shockWidth,
                    fill: 'none',
                    class: 'b-result__shock'
                }
            );
        }

        function drawRow(grid, i) {
            for (var j = 0; grid[i][j]; j++) {
                that.drawPoint(grid[i][j], that.resultDrawArea, j == 0);
            }
        }
    };

    Draw.prototype.drawPoint = function (point, parent, hole) {
        var M = point.M * Draw.params.machScale,
            ctheta = Math.cos(point.theta),
            stheta = Math.sin(point.theta),
            x = Draw.fix(point.x),
            y = Draw.fix(point.y),
            dx = (M - Draw.params.machArrowLenght) * ctheta,
            dy = (M - Draw.params.machArrowLenght) * stheta,
            dx1 = -Draw.params.machArrowLenght * ctheta - 0.5 * Draw.params.machArrowWidth * stheta,
            dy1 = 0.5 * Draw.params.machArrowWidth * ctheta - Draw.params.machArrowLenght * stheta,
            dx2 = Draw.params.machArrowWidth * stheta,
            dy2 = -Draw.params.machArrowWidth * ctheta;
        var pt = this.paper.group(parent, {
            class: 'b-result__point b-point',
            'data-point': 'return ' + JSON.stringify(point)
        });
        this.paper.path(
            pt,
            this.paper.createPath().move(x, -y).line(Draw.fix(dx), -Draw.fix(dy), true),
            {
                stroke: 'grey',
                fill: 'none',
                class: 'b-point__vector'
            }
        );
        this.paper.path(
            pt,
            this.paper.createPath().move(Draw.fix(point.x + M * ctheta), -Draw.fix(point.y + M * stheta))
                .line(Draw.fix(dx1), -Draw.fix(dy1), true)
                .line(Draw.fix(dx2), -Draw.fix(dy2), true)
                .close(),
            {
                stroke: 'silver',
                fill: 'silver',
                class: 'b-point__vector'
            }
        );
        var point = this.paper.circle(pt, x, -y, Draw.params.pointRadius);
        if (hole) this.paper.change(point, {
            stroke: 'black',
            fill: 'white'
        })
    };

    return Draw;
});
