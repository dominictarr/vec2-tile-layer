var Vec2 = require('vec2')
var Rec2 = require('rec2')
var h = require('hyperscript')
var vdom = require('vec2-dom')
module.exports = Layer

var L = null

function px(n) {
  if('number' === typeof n)
    return n + 'px'
  else return n || '0px'
}

function Layer (opts) {
  opts = opts || {}
  this.size = opts.size || new Vec2(1024, 1024)
  this.scale = opts.scale || 1
  
  //tile size on map scale
  //defaults to degrees lat and long?
  console.log('SCALE', this.scale,  Math.pow(2, this.scale), 1024 / Math.pow(2, this.scale))
  this.tileScale = new Vec2(1024/Math.pow(2, this.scale), 1024/Math.pow(2, this.scale))
                //south west to north east

  this.min = new Rec2().set(0, 0)
  this.max = this.min.bound.set(1024, 1024)

  this.minTile = new Vec2()
  this.maxTile = new Vec2()
  this.tileWidth = new Vec2()
  //tile size in pixels
  this.tileSize = new Vec2(256, 256)
  this.tiles = {}
  if('undefined' !== typeof window) {
    this.div = h('div', {
      style: {
        //'pointer-events' : 'none',
        left             : px(0),
        top              : px(0),
        'z-index'        : this.scale,
        position         : 'absolute',
        margin           : px(0),
        padding          : px(0),
        width            : px(this.size.x),
        height           : px(this.size.y),
        overflow         : 'hidden'
      }
    })
    var self = this
    this.size.change(function () {
      div.size.width  = px(self.size.x)
      div.size.height = px(self.size.y)
    })
  }
}

var l = Layer.prototype

l.tileRange = function (min, max) {
  max = min.bound || max

  var maxX = Math.floor((this.max.x - this.min.x) / this.tileScale.x) - 1
  var maxY = Math.floor((this.max.y - this.min.y) / this.tileScale.x) - 1

  this.minTile.set(
    Math.max(Math.floor(min.x / this.tileScale.x), 0),
    Math.max(Math.floor(min.y / this.tileScale.y), 0)
  )

  this.maxTile.set(
    Math.min(Math.floor(Math.max(max.x, 0) / this.tileScale.x), maxX),
    Math.min(Math.floor(Math.max(max.y, 0) / this.tileScale.y), maxY)
  )
  
  return this
}


l.getTile = function (x, y, z) {
  /*
  //baidu
  var src = 'http://online1.map.bdimg.com/tile/?qt=tile'
    + '&x=' + x
    + '&y=' + y
    + '&z=' + z
    + '&styles=pl&udt=20131108'
  ;
  */

  //google
  var src = 'https://khms1.google.com/kh/v=134&src=app'
          + '&x=' + x
          + '&y=' + y
          + '&z=' + z
          + '&s=G'
  ;

  var img
  return img = h('img', {src: src, style: { left: px(0), top: px(0) }})
}

l.add = function (x, y) {
  var id = x+':'+y
  if(this.tiles[id]) return false

  var z = this.scale

  var img = this.getTile(x, y, z)
  img.id = x+'_'+y+'_'+z
  img.style['pointer-events'] = 'none'

  this.div.appendChild(img)
  var r = vdom.absolute(img, true)

  img.screenOrigin = r
  this.tiles[id] = img

  img.pos = new Vec2(x, y)
  img.worldOrigin = new Vec2(
    this.min.x + this.tileScale.x*x,
    this.min.y + this.tileScale.y*y
  )
  return img
}

l.remove = function (x, y) {
  var k = x + ':' + y
  var img = this.tiles[k]
  delete this.tiles[k]
  this.div.removeChild(img)
  return this
}

l.show = function (show) {
  this.div.style.display = show ? 'block' : 'none'
}

var o = new Vec2()
  var unit = new Vec2(1, 1)

l.update = function (min, max, zoom) {

  this.tileRange(min, max)

  this.tileWidth.set(
    Math.floor(this.tileSize.x*zoom.x),
    Math.floor(this.tileSize.x*zoom.y)
  )

  var m = this.minTile, M = this.maxTile
  //NOTE.textContent += '\n' + JSON.stringify({min: m, max: M})

  for(var i =  m.x; i <= M.x; i++)
    for(var j =  m.y; j <= M.y; j++)
      this.add(i, j)

  for(var k in this.tiles) {
    var img = this.tiles[k]

    if(
      img.pos.x < m.x || img.pos.y < m.y ||
      img.pos.x > M.x || img.pos.y > M.y
    ) {
      this.remove(img.pos.x, img.pos.y)
    } else {

    var sx = this.tileScale.x/2
    var sy = this.tileScale.y/2

      img.screenOrigin.set(
        ((img.worldOrigin.x - min.x) / sx)
          * this.tileSize.x * zoom.x ,
        ((img.worldOrigin.y - (this.min.y - (this.min.y - min.y))) 
          / sy)
          * this.tileSize.y * zoom.y
      )

      img.screenOrigin.set(
        (img.worldOrigin.x - min.x) * zoom.x,
        (img.worldOrigin.y - min.y) * zoom.y
      )


      //TODO: create a vec2 thing that allows you to apply many calcs like this:
      // 
      //  V(img.worldOrigin, this.min, min, this.tileScale, this.tileSize, zoom,
      //    '((worldOrigin - (_min - (_min - min))) / tileScale) * tileSize * 1/zoom)' 
      //   )
      // it would generate a function that applies this directly, so you don't have
      // to type it out twice.


      var scaleFactor = Math.pow(2, this.scale - 1)

      img.screenOrigin.size.set(
        (this.tileSize.x * zoom.x * 2)/scaleFactor,
        (this.tileSize.y * zoom.y * 2)/scaleFactor
      )
    }
  }
  return this
}

