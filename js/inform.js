define(['jquery'], function ($) {
    var template = {
            x: "\\bar{x} = %%",
            y: "\\bar{y} = %%",
            M: "M = %%",
            theta: "\\Theta = %deg% ^{ \\circ}",
            Cp: "c_p = %%",
            Cx: " C_X = %%",
            Cy: " C_Y = %%",
            mz: " m_z = %%",
            Cxa: " C_{X_a} = %%",
            Cya: " C_{Y_a} = %%",
            mza: " m_{z_a} = %%"
        },
        templater = function (data) {
            var res = "", prop, d;
            for (prop in template) {
                if (!template.hasOwnProperty(prop) || !data.hasOwnProperty(prop)) continue;
                d = +data[prop];
                if(isNaN(d)) continue;
                res += "<p>\\( " + template[prop].replace("%%", d.toFixed(5)).replace("%deg%", (d*180/Math.PI).toFixed(5)) + " \\)</p>";
            }
            return res;
        };

    return function (data, object) {
        $(object).html(templater(data));
        MathJax && MathJax.Hub && MathJax.Hub.Queue && MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
    }
});