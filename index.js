var Vec2 = require('vec2')
var Rec2 = require('rec2')
var h = require('hyperscript')
var vdom = require('vec2-dom')
module.exports = Layer

var L = null

function Layer (scale) {
  this.scale = scale

  //tile size on map scale
  //defaults to degrees lat and long?
  this.tileScale = new Vec2(360/Math.pow(2, scale), 180/Math.pow(2, scale))
                    //south west to north east

  this.min = new Rec2().set(-180, -90, 360, 180)
  this.max = this.min.bound.set(180, 90)

  this.minTile = new Vec2()
  this.maxTile = new Vec2()
  //tile size in pixels
  this.tileSize = new Vec2(256, 256)
  this.tiles = {}
  if('undefined' !== typeof window)
    this.div = h('div', {
      'pointer-events' : 'none',
      left             : '0px',
      top              : '0px',
      'z-index'        : this.scale,
      position         : 'absolute'
    })
}

var l = Layer.prototype

l.tileRange = function (map) {
  console.log(JSON.stringify([[map, map.bound], [this.min, this.max], this.tileScale]))

  var maxX = Math.floor((this.max.x - this.min.x) / this.tileScale.x) - 1
  var maxY = Math.floor((this.max.y - this.min.y) / this.tileScale.y) - 1

  this.minTile.set(
    Math.max(Math.floor((map.x - this.min.x)/this.tileScale.x), 0),
    Math.max(Math.floor((map.y - this.min.y) / this.tileScale.y), 0)
  )

  this.maxTile.set(
    Math.min(Math.floor((map.bound.x - this.min.x) / this.tileScale.x) - 1, maxX),
    Math.min(Math.floor((map.bound.y - this.min.y) / this.tileScale.y) - 1, maxY)
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
  return img = h('img', {src: src, onload: function () {

  }, onerror: function (e) {
    img.style.opacity = 0.1
    img.style.display = 'none'
  }})
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

  img.origin = new Vec2(x, y)
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

l._update = function (min, max, zoom) {

  this.tileRange(min, max)

  this.tileWidth.set(
    Math.floor(this.tileSize.x*1/zoom.x),
    Math.floor(this.tileSize.x*1/zoom.y)
  )

  var m = this.minTile, M = this.maxTile

  for(var i =  m.x; i <= M.x; i++)
    for(var j =  m.y; j <= M.y; j++)
      this.add(i, j)

  for(var k in this.tiles) {
    var img = this.tiles[k]

    //take the center of the screen, 
    //subtract 

    //img.screenOrigin.set(

    //remove tiles that arn't in view anymore
    if(
      img.origin.x < m.x || img.origin.y < m.y ||
      img.origin.x > M.x || img.origin.y > M.y
    ) {
      this.remove(img.origin.x, img.origin.y)
    }
  }
}

l.update = function (min, max, view) {
  var scale =  Math.pow(2, this.scale)
  var z = Math.log(Math.round(view.zoom()/256))/Math.LN2

  var m = this.min = tiles.min(min, this.scale, this.min)
  var M = this.max = tiles.min(max, this.scale, this.max)

  var scale = Math.pow(2, this.scale - 1)

  for(var i =  m.x; i <= M.x; i++)
    for(var j =  m.y; j <= M.y; j++)
      this.add(i, j)

  for(var k in this.tiles) {
    var img = this.tiles[k]
    
    img.screenOrigin.set(
      o.set(img.origin)
        .divide(scale)
        .subtract(view.center)
        .multiply(Math.round(view.zoom()))
        .add(view._viewCenter)
    )

    img.style.width = Math.floor(view.zoom()/scale) + 'px'

    if(
      img.origin.x < m.x || img.origin.y < m.y ||
      img.origin.x > M.x || img.origin.y > M.y
    ) {
      this.remove(img.origin.x, img.origin.y)
    }
  }
}

