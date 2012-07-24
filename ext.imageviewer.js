Ext.define('ImageViewer', {
    extend: 'Ext.container.Container',

    layout: {
        type: 'vbox',
        align: 'stretch'
    },

    config: {
        isMoving: false,
        imageWidth: null,
        imageHeight: null,
        originalImageWidth: null,
        originalImageHeight: null,
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
                            me.setRotation(0);
                            me.rotateImage();
                            me.setOriginalImageWidth(image.el.dom.width);
                            me.setOriginalImageHeight(image.el.dom.height);
                            me.setImageWidth(image.el.dom.width);
                            me.setImageHeight(image.el.dom.height);
                            me.stretchOptimally();
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
            height: me.getOriginalImageHeight() * (me.getImageContainer().getWidth() - 20) / me.getOriginalImageWidth()
        });

        me.centerImage();
    },

    stretchVertically: function () {
        var me = this;

        me.setImageSize({
            width: me.getOriginalImageWidth() * (me.getImageContainer().getHeight() - 20) / me.getOriginalImageHeight(),
            height: me.getImageContainer().getHeight() - 20
        });

        me.centerImage();
    },

    stretchOptimally: function () {
        var me = this;

        if (me.getAdjustedImageWidth() * me.getImageContainer().getHeight() / me.getAdjustedImageHeight() > me.getImageContainer().getWidth()) {
            me.stretchHorizontally();
        } else {
            me.stretchVertically();
        }
    },

    centerImage: function () {
        var me = this;

        me.setMargins({
            top: (me.getImageContainer().getHeight() - me.getAdjustedImageHeight() - 20) / 2,
            left: (me.getImageContainer().getWidth() - me.getAdjustedImageWidth() - 20) / 2
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
            top: margins.top + me.getAdjustedImageHeight() * 0.05,
            left: margins.left + me.getAdjustedImageWidth() * 0.05
        });

        me.setImageSize({
            width: me.getAdjustedImageWidth() * 0.9,
            height: me.getOriginalImageHeight() * me.getAdjustedImageWidth() * 0.9 / me.getOriginalImageWidth()
        });
    },

    zoomIn: function (event) {
        var me = this,
            margins = this.getMargins();

        event.stopEvent();

        me.setMargins({
            top: margins.top - me.getAdjustedImageHeight() * 0.05,
            left: margins.left - me.getAdjustedImageWidth() * 0.05
        });

        me.setImageSize({
            width: me.getAdjustedImageWidth() * 1.1,
            height: me.getOriginalImageHeight() * me.getAdjustedImageWidth() * 1.1 / me.getOriginalImageWidth()
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

        tmpOriginalWidth = me.getOriginalImageWidth();
        me.setOriginalImageWidth(me.getOriginalImageHeight());
        me.setOriginalImageHeight(tmpOriginalWidth);

        me.getImage().getEl().setStyle('transform', 'rotate(' + me.getRotation() + 'deg)');
        me.getImage().getEl().setStyle('-o-transform', 'rotate(' + me.getRotation() + 'deg)');
        me.getImage().getEl().setStyle('-ms-transform', 'rotate(' + me.getRotation() + 'deg)');
        me.getImage().getEl().setStyle('-moz-transform', 'rotate(' + me.getRotation() + 'deg)');
        me.getImage().getEl().setStyle('-webkit-transform', 'rotate(' + me.getRotation() + 'deg)');

        me.setMargins(me.getMargins());
    },

    setMargins: function (margins) {
        var me = this;

        if (me.getAdjustedImageWidth() > me.getImageContainer().getWidth() - 20) {
            if (margins.left > 0) {
                margins.left = 0;
            } else if (margins.left < me.getImageContainer().getWidth() - me.getAdjustedImageWidth() - 20) {
                margins.left = me.getImageContainer().getWidth() - me.getAdjustedImageWidth() - 20;
            }
        } else {
            if (margins.left < 0) {
                margins.left = 0;
            } else if (margins.left > me.getImageContainer().getWidth() - me.getAdjustedImageWidth() - 20) {
                margins.left = me.getImageContainer().getWidth() - me.getAdjustedImageWidth() - 20;
            }
        }

        if (me.getAdjustedImageHeight() > me.getImageContainer().getHeight() - 20) {
            if (margins.top > 0) {
                margins.top = 0;
            } else if (margins.top < me.getImageContainer().getHeight() - me.getAdjustedImageHeight() - 20) {
                margins.top = me.getImageContainer().getHeight() - me.getAdjustedImageHeight() - 20;
            }
        } else {
            if (margins.top < 0) {
                margins.top = 0;
            } else if (margins.top > me.getImageContainer().getHeight() - me.getAdjustedImageHeight() - 20) {
                margins.top = me.getImageContainer().getHeight() - me.getAdjustedImageHeight() - 20;
            }
        }

        if (me.getRotation() === 90 || me.getRotation() === 270) {
            margins.top = margins.top - (me.getImageHeight() - me.getImageWidth()) / 2;
            margins.left = margins.left + (me.getImageHeight() - me.getImageWidth()) / 2;
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
            margins.top = margins.top + (me.getImageHeight() - me.getImageWidth()) / 2;
            margins.left = margins.left - (me.getImageHeight() - me.getImageWidth()) / 2;
        }

        return margins;
    },

    getAdjustedImageHeight: function () {
        var me = this;

        if (me.getRotation() === 90 || me.getRotation() === 270) {
            return me.getImageWidth();
        } else {
            return me.getImageHeight();
        }
    },

    getAdjustedImageWidth: function () {
        var me = this;

        if (me.getRotation() === 90 || me.getRotation() === 270) {
            return me.getImageHeight();
        } else {
            return me.getImageWidth();
        }
    },

    setImageSize: function (size) {
        var me = this;

        if (me.getRotation() === 90 || me.getRotation() === 270) {
            me.setImageWidth(size.height);
            me.setImageHeight(size.width);
        } else {
            me.setImageWidth(size.width);
            me.setImageHeight(size.height);
        }
    },

    applyImageWidth: function (width) {
        var me = this;
        me.getImage().setWidth(width);
        return width;
    },

    applyImageHeight: function (height) {
        var me = this;
        me.getImage().setHeight(height);
        return height;
    },

    getImage: function () {
        return this.query('image')[0];
    },

    getImageContainer: function () {
        return this.query('#imagecontainer')[0];
    }
});
