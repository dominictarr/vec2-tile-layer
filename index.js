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
  this.size = opts.size || new Vec2(1000, 1000)
  this.scale = opts.scale || 1
  
  //tile size on map scale
  //defaults to degrees lat and long?
  this.tileScale = new Vec2(1000/Math.pow(2, this.scale), 1000/Math.pow(2, this.scale))
                    //south west to north east

  this.min = new Rec2().set(0, 0)
  this.max = this.min.bound.set(1000, 1000)

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
//  console.log(JSON.stringify([[min, max], [this.min, this.max], this.tileScale]))

  var maxX = Math.floor((this.max.x - this.min.x) / this.tileScale.x)
  var maxY = Math.floor((this.max.y - this.min.y) / this.tileScale.y)

  this.minTile.set(
    Math.max(Math.floor(min.x / this.tileScale.x) , 0),
    Math.max(Math.floor(min.y / this.tileScale.y) , 0)
  )

  this.maxTile.set(
    Math.min(Math.floor(Math.max(max.x, 0) / this.tileScale.x), maxX),
    Math.min(Math.floor(Math.max(max.y, 0) / this.tileScale.y), maxY)
  )
  
  return this
}


l.getTile = function (x, y, z) {
  //console.log('get tile', x, y, z)
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
  return img = h('img', {src: src, onload: function () {

  }, onerror: function (e) {
  //  img.style.opacity = 0.1
//    img.style.display = 'none'
  }, style: { left: px(0), top: px(0) }})
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

//  this.tileWidth.set(
//    Math.floor(this.tileSize.x*1/zoom.x),
//    Math.floor(this.tileSize.x*1/zoom.y)
//  )

  this.tileWidth.set(
    Math.floor(this.tileSize.x*zoom.x),
    Math.floor(this.tileSize.x*zoom.y)
  )

  var m = this.minTile, M = this.maxTile
  NOTE.textContent += '\n' + JSON.stringify({min: m, max: M})
  console.log(JSON.stringify([m, M]))

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

//      img.screenOrigin.set(
//        ((img.worldOrigin.x - (this.min.x - (this.min.x - min.x))) / this.tileScale.x)
//          * this.tileSize.x * 1/zoom.x,
//        ((img.worldOrigin.y - (this.min.y - (this.min.y - min.y))) / this.tileScale.y)
//          * this.tileSize.y * 1/zoom.y
//      )

      img.screenOrigin.set(
        ((img.worldOrigin.x - (this.min.x - (this.min.x - min.x))) / this.tileScale.x)
          * this.tileSize.x * zoom.x,
        ((img.worldOrigin.y - (this.min.y - (this.min.y - min.y))) / this.tileScale.y)
          * this.tileSize.y * zoom.y
      )

//      img.screenOrigin.set(
//        ((img.worldOrigin.x +  min.x) / this.tileScale.x)
//          * this.tileSize.x * 1/zoom.x,
//        ((img.worldOrigin.y + min.y) / this.tileScale.y)
//          * this.tileSize.y * 1/zoom.y
//      )

      //TODO: create a vec2 thing that allows you to apply many calcs like this:
      // 
      //  V(img.worldOrigin, this.min, min, this.tileScale, this.tileSize, zoom,
      //    '((worldOrigin - (_min - (_min - min))) / tileScale) * tileSize * 1/zoom)' 
      //   )
      // it would generate a function that applies this directly, so you don't have
      // to type it out twice.

//      img.screenOrigin.size.set(
//        this.tileSize.x * 1/zoom.x,
//        this.tileSize.y * 1/zoom.y
//      )
      img.screenOrigin.size.set(
        this.tileSize.x * zoom.x,
        this.tileSize.y * zoom.y
      )

    }
  }
  return this
}

