var Layer = require('../')
var Rec2 = require('rec2')
var tape = require('tape')

tape('layer1 gets the right tiles', function (t) {
  var l = new Layer({scale: 1})
  var mapBounds = new Rec2().set(0, 0)
  mapBounds.bound.set(1000, 1000)
  console.log(l.tileRange(mapBounds))
  t.deepEqual(l.minTile.toJSON(), {x:0, y:0})
  t.deepEqual(l.maxTile.toJSON(), {x:1, y:1})
  t.end()
})

tape('layer1 gets the right tiles 2', function (t) {
  var l = new Layer({scale: 1})
  var mapBounds = new Rec2().set(500, 500)
  mapBounds.bound.set(1000, 1000)
  var b = l.tileRange(mapBounds)
  console.log(b)
  t.deepEqual(b.minTile.toJSON(), {x:1, y:1}, 'min tile')
  t.deepEqual(b.maxTile.toJSON(), {x:1, y:1}, 'max tile')
  t.end()
})

tape('layer1 gets the right tiles 3', function (t) {
  var l = new Layer({scale: 1})
  var mapBounds = new Rec2().set(0, 0)
  mapBounds.bound.set(1000, 1000)
  var b = l.tileRange(mapBounds)
  console.log(b)
  t.deepEqual(l.minTile.toJSON(), {x:0, y:0})
  t.deepEqual(l.maxTile.toJSON(), {x:1, y:1})
  t.end()
})


tape('layer2', function (t) {
  console.log('layer2')
  var l = new Layer({scale: 2})
  var mapBounds = new Rec2().set(0, 0)
  mapBounds.bound.set(1000, 1000)
  var b = l.tileRange(mapBounds)
  t.deepEqual(b.minTile.toJSON(), {x:0, y:0})
  t.deepEqual(b.maxTile.toJSON(), {x:3, y:3})
  t.end()
})


tape('layer2', function (t) {
  console.log('layer2')
  var l = new Layer({scale: 2})
  var mapBounds = new Rec2().set(250, 250)
  mapBounds.bound.set(750, 750)
  var b = l.tileRange(mapBounds)
  t.deepEqual(b.minTile.toJSON(), {x:1, y:1})
  t.deepEqual(b.maxTile.toJSON(), {x:2, y:2})
  t.end()
})

