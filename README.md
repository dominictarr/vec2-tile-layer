# vec2-tile-layer

A single layer of map tiles.

[![testling badge](https://ci.testling.com/dominictarr/vec2-tile-layer.png)](https://ci.testling.com/dominictarr/vec2-tile-layer)

used within [vec2-map](https://github.com/dominictarr/vec2-map)

Create a tile map at a given scale layer, with tiles as `<img>` tags.
Currently defaults to using google maps tiles.

``` js
var Layer = require('../')
var Vec2 = require('vec2')

var l = new Layer({scale:2, size: new Vec2(1000, 1000)})
        .update(new Vec2(0, 0), new Vec2(1000, 1000), new Vec2(1, 1))

document.body.appendChild(l.div)
```
map coordinates are between `0 - 1000` in both X and Y,
where `0,0` is in the top-left/north-west.

## License

MIT
