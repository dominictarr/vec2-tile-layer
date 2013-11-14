
var Layer = require('../')
var Vec2 = require('vec2')

var l = new Layer({scale:2, width: 1000, height: 1000})
        .update(new Vec2(0, 0), new Vec2(1000, 1000), new Vec2(1, 1))


document.body.appendChild(l.div)


