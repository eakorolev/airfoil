define(['jquery'], function ($) {
    var res = {
        init: init
    };

    return res;

    function init() {
        $('.b-scroll-area__controls').each(function () {
            var that = this,
                $that = $(that);
            that.zoomTarget = $($that.data('zoom-selector'));
            that.minZoom = +$that.data('zoom-min') || 80;
            that.maxZoom = +$that.data('zoom-max') || 1000;

            $that.find('.b-scroll-area__zoom-control')
                .click(onClick)
                .each(function () {
                    var $this = $(this),
                        dZoom = $this.data('zoom-delta'),
                        aZoom = $this.data('zoom-value') || 100;
                    this.parent = that;
                    if (dZoom) {
                        this.zoom = +dZoom;
                        this.relative = true;
                    } else {
                        this.zoom = +aZoom;
                        this.relative = false;
                    }
                })
        });
    }

    function onClick() {
        var parent = this.parent,
            val = +$(parent.zoomTarget).data('zoom-value') || 100;

        if (this.relative) {
            val += this.zoom;
        } else {
            val = this.zoom;
        }

        if(val < parent.minZoom) val = parent.minZoom;
        if(val > parent.maxZoom) val = parent.maxZoom;

        $(parent.zoomTarget).data('zoom-value', val).css({
            width: val+"%",
            height: val+"%"
        });
    }
});
