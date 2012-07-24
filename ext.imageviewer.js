Ext.define('ImageViewer', {
    extend: 'Ext.container.Container',

    layout: {
        type: 'vbox',
        align: 'stretch'
    },

    config: {
        isMoving: false,
        originalWidth: null,
        originalHeight: null,
        clickX: null,
        clickY: null,
        lastMarginX: null,
        lastMarginY: null,
        rotation: 0
    },

    initComponent: function () {
        var me = this;

        me.items = [{
            xtype: 'toolbar',
            defaults: {
                tooltipType: 'title'
            },
            items: [{
                xtype: 'button',
                tooltip: 'Stretch horizonally',
                icon: 'resources/images/imageviewer/stretch_horizontally.png',
                listeners: { el: { click: me.stretchHorizontally, scope: me } }
            }, {
                xtype: 'button',
                tooltip: 'Stretch vertically',
                icon: 'resources/images/imageviewer/stretch_vertically.png',
                listeners: { el: { click: me.stretchVertically, scope: me } }
            }, {
                xtype: 'button',
                tooltip: 'Stretch optimally',
                icon: 'resources/images/imageviewer/stretch_optimally.png',
                listeners: { el: { click: me.stretchOptimally, scope: me } }
            }, {
                xtype: 'button',
                tooltip: 'Zoom in',
                icon: 'resources/images/imageviewer/zoom_in.png',
                listeners: { el: { click: me.zoomIn, scope: me } }
            }, {
                xtype: 'button',
                tooltip: 'Zoom out',
                icon: 'resources/images/imageviewer/zoom_out.png',
                listeners: { el: { click: me.zoomOut, scope: me } }
            }, {
                xtype: 'button',
                tooltip: 'Rotate clockwise',
                icon: 'resources/images/imageviewer/arrow_rotate_clockwise.png',
                listeners: { el: { click: me.rotateClockwise, scope: me } }
            }, {
                xtype: 'button',
                tooltip: 'Rotate anti-clockwise',
                icon: 'resources/images/imageviewer/arrow_rotate_anticlockwise.png',
                listeners: { el: { click: me.rotateAntiClockwise, scope: me } }
            }]
        }, {
            xtype: 'container',
            itemId: 'imagecontainer',
            flex: 1,
            style: {
                overflow: 'hidden',
                backgroundColor: '#f2f1f0',
                padding: '10px',
                cursor: 'move'
            },
            listeners: { el: { mousedown: me.mousedown, scope: me } },
            items: {
                xtype: 'image',
                mode: 'element',
                src: me.src,
                style: {
                    boxShadow: '0 0 5px 5px #888'
                },
                listeners: {
                    render: function (image) {
                        image.el.dom.onload = function () {
                            me.setOriginalWidth(image.el.dom.width);
                            me.setOriginalHeight(image.el.dom.height);
                        };
                    }
                }
            }
        }];

        Ext.EventManager.addListener(window, 'mouseup', me.mouseup, me);
        Ext.EventManager.addListener(window, 'mousemove', me.mousemove, me);

        me.callParent();
    },

    stretchHorizontally: function () {
        var me = this;

        me.setImageSize({
            width: me.getImageContainer().getWidth() - 20,
            height: me.getOriginalHeight() * (me.getImageContainer().getWidth() - 20) / me.getOriginalWidth()
        });

        me.centerImage();
    },

    stretchVertically: function () {
        var me = this;

        me.setImageSize({
            width: me.getOriginalWidth() * (me.getImageContainer().getHeight() - 20) / me.getOriginalHeight(),
            height: me.getImageContainer().getHeight() - 20
        });

        me.centerImage();
    },

    stretchOptimally: function () {
        var me = this;

        if (me.getImageWidth() * me.getImageContainer().getHeight() / me.getImageHeight() > me.getImageContainer().getWidth()) {
            me.stretchHorizontally();
        } else {
            me.stretchVertically();
        }
    },

    centerImage: function () {
        var me = this;

        me.setMargins({
            top: (me.getImageContainer().getHeight() - me.getImageHeight() - 20) / 2,
            left: (me.getImageContainer().getWidth() - me.getImageWidth() - 20) / 2
        });
    },

    mousedown: function (event) {
        var me = this,
            margins = this.getMargins();

        event.stopEvent();

        me.setClickX(event.getPageX());
        me.setClickY(event.getPageY());
        me.setLastMarginY(margins.top);
        me.setLastMarginX(margins.left);

        me.setIsMoving(true);
    },

    mousemove: function (event) {
        var me = this;

        if (me.getIsMoving()) {
            me.setMargins({
                top: me.getLastMarginY() - me.getClickY() + event.getPageY(),
                left: me.getLastMarginX() - me.getClickX() + event.getPageX()
            });
        }
    },

    mouseup: function () {
        var me = this;

        if (me.getIsMoving()) {
            me.setClickX(null);
            me.setClickY(null);
            me.setLastMarginX(null);
            me.setLastMarginY(null);
            me.setIsMoving(false);
        }
    },

    zoomOut: function (event) {
        var me = this,
            margins = this.getMargins();

        event.stopEvent();

        me.setMargins({
            top: margins.top + me.getImageHeight() * 0.05,
            left: margins.left + me.getImageWidth() * 0.05
        });

        me.setImageSize({
            width: me.getImageWidth() * 0.9,
            height: me.getOriginalHeight() * me.getImageWidth() * 0.9 / me.getOriginalWidth()
        });
    },

    zoomIn: function (event) {
        var me = this,
            margins = this.getMargins();

        event.stopEvent();

        me.setMargins({
            top: margins.top - me.getImageHeight() * 0.05,
            left: margins.left - me.getImageWidth() * 0.05
        });

        me.setImageSize({
            width: me.getImageWidth() * 1.1,
            height: me.getOriginalHeight() * me.getImageWidth() * 1.1 / me.getOriginalWidth()
        });
    },

    rotateClockwise: function () {
        var me = this;

        me.setRotation(me.getRotation() + 90);

        if (me.getRotation() > 360) {
            me.setRotation(me.getRotation() - 360);
        }

        me.rotateImage();
    },

    rotateAntiClockwise: function () {
        var me = this;

        me.setRotation(me.getRotation() - 90);

        if (me.getRotation() < 0) {
            me.setRotation(me.getRotation() + 360);
        }

        me.rotateImage();
    },

    rotateImage: function () {
        var me = this,
            tmpOriginalWidth;

        tmpOriginalWidth = me.getOriginalWidth();
        me.setOriginalWidth(me.getOriginalHeight());
        me.setOriginalHeight(tmpOriginalWidth);

        me.getImage().getEl().setStyle('transform', 'rotate(' + me.getRotation() + 'deg)');
        me.getImage().getEl().setStyle('-o-transform', 'rotate(' + me.getRotation() + 'deg)');
        me.getImage().getEl().setStyle('-ms-transform', 'rotate(' + me.getRotation() + 'deg)');
        me.getImage().getEl().setStyle('-moz-transform', 'rotate(' + me.getRotation() + 'deg)');
        me.getImage().getEl().setStyle('-webkit-transform', 'rotate(' + me.getRotation() + 'deg)');

        me.setMargins(me.getMargins());
    },

    setMargins: function (margins) {
        var me = this;

        if (me.getImageWidth() > me.getImageContainer().getWidth() - 20) {
            if (margins.left > 0) {
                margins.left = 0;
            } else if (margins.left < me.getImageContainer().getWidth() - me.getImageWidth() - 20) {
                margins.left = me.getImageContainer().getWidth() - me.getImageWidth() - 20;
            }
        } else {
            if (margins.left < 0) {
                margins.left = 0;
            } else if (margins.left > me.getImageContainer().getWidth() - me.getImageWidth() - 20) {
                margins.left = me.getImageContainer().getWidth() - me.getImageWidth() - 20;
            }
        }

        if (me.getImageHeight() > me.getImageContainer().getHeight() - 20) {
            if (margins.top > 0) {
                margins.top = 0;
            } else if (margins.top < me.getImageContainer().getHeight() - me.getImageHeight() - 20) {
                margins.top = me.getImageContainer().getHeight() - me.getImageHeight() - 20;
            }
        } else {
            if (margins.top < 0) {
                margins.top = 0;
            } else if (margins.top > me.getImageContainer().getHeight() - me.getImageHeight() - 20) {
                margins.top = me.getImageContainer().getHeight() - me.getImageHeight() - 20;
            }
        }

        if (me.getRotation() === 90 || me.getRotation() === 270) {
            margins.top = margins.top - (me.getImage().getHeight() - me.getImage().getWidth()) / 2;
            margins.left = margins.left + (me.getImage().getHeight() - me.getImage().getWidth()) / 2;
        }

        me.getImage().getEl().setStyle('margin-left', margins.left + 'px');
        me.getImage().getEl().setStyle('margin-top', margins.top + 'px');
    },

    getMargins: function () {
        var me = this;

        var margins = {
            top: parseInt(me.getImage().getEl().getStyle('margin-top'), 10),
            left: parseInt(me.getImage().getEl().getStyle('margin-left'), 10)
        };

        if (me.getRotation() === 90 || me.getRotation() === 270) {
            margins.top = margins.top + (me.getImage().getHeight() - me.getImage().getWidth()) / 2;
            margins.left = margins.left - (me.getImage().getHeight() - me.getImage().getWidth()) / 2;
        }

        return margins;
    },

    getImageHeight: function () {
        var me = this;

        if (me.getRotation() === 90 || me.getRotation() === 270) {
            return me.getImage().getWidth();
        } else {
            return me.getImage().getHeight();
        }
    },

    getImageWidth: function () {
        var me = this;

        if (me.getRotation() === 90 || me.getRotation() === 270) {
            return me.getImage().getHeight();
        } else {
            return me.getImage().getWidth();
        }
    },

    setImageSize: function (size) {
        var me = this;

        if (me.getRotation() === 90 || me.getRotation() === 270) {
            me.getImage().setWidth(size.height);
            me.getImage().setHeight(size.width);
        } else {
            me.getImage().setWidth(size.width);
            me.getImage().setHeight(size.height);
        }
    },

    getImage: function () {
        return this.query('image')[0];
    },

    getImageContainer: function () {
        return this.query('#imagecontainer')[0];
    }
});
