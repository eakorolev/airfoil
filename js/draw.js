define(['jquery', 'calc', 'jquery.svg'], function ($, Calc) {
    function Draw(el) {
        this.paper = $(el).svg().svg('get');
        this.resultDrawArea = $(this.paper.group({class: 'b-result__result'}));
        this.problemDrawArea = $(this.paper.group({class: 'b-result__problem'}));
    }

    Draw.params = {
        foilXStep: 0.01
    };

    Draw.prototype.getFoil = function(params, parent) {
        var points = this.paper.createPath().move(0, 0);
        for (var x = 0; x <= 1; x += Draw.params.foilXStep)
            points.line(+(x * 1000).toFixed(3), -(Calc.foil_top(x, params.c) * 1000).toFixed(3));
        for (x = 1; x >= 0; x -= Draw.params.foilXStep)
            points.line(+(x * 1000).toFixed(3), -(Calc.foil_bottom(x, params.c) * 1000).toFixed(3));
        points.close();
        return  this.paper.path(parent, points, {
            stroke: 'black',
            strokeWidth: 3,
            fill: 'url(#hatch0_45)'
        });
    };

    Draw.prototype.getMachArrow = function(params, parent) {
        var gr = this.paper.group(parent, {
            transform: 'rotate('+(-params.alpha)+')'
        });
        this.paper.path(
            gr,
            this.paper.createPath().move(-200, 2).line(-47,2).line(-50,5).line(-10,0).line(-50,-5).line(-47,-2).line(-200,-2).close(), {
                stroke: 'white',
                strokeWidth: 1
            }
        );
        this.paper.text(gr, -250, 10, this.paper.createText().string('M').span('∞', { 'baseline-shift': 'sub'}));
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

        this.paper.circle(this.problemDrawArea, +(params.x0 * 1000).toFixed(3), -(Calc.foil_top(params.x0, params.c) * 1000).toFixed(3), 3, {
            stroke: 'grey',
            fill: 'white'
        });

        this.paper.circle(this.problemDrawArea, +(params.x0 * 1000).toFixed(3), -(Calc.foil_bottom(params.x0, params.c) * 1000).toFixed(3), 3, {
            stroke: 'grey',
            fill: 'white'
        })
    };

    Draw.prototype.clearProblem = function () {
        this.problemDrawArea.empty();
    };

    Draw.prototype.clearResult = function () {
        this.resultDrawArea.empty();
    };

    Draw.prototype.drawResult = function(calc) {
        this.clearProblem();
        this.paper.change(this.getFoil(calc.params, this.resultDrawArea));
        this.paper.change(this.getMachArrow(calc.params, this.resultDrawArea));
    };

    return Draw;
});
