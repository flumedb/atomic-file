'use strict'
var fs = require('fs')

function isFunction (f) {
  return 'function' === typeof f
}

function onceAtATime (fn, queue) {
  queue = queue || []
  return function () {
    var args = [].slice.call(arguments)
    if(queue.length)
      return queue.push(function () {
        fn.apply(null, args)
      })
    //should be a the callback...
    var cb = args.pop()
    if(!isFunction(cb)) throw new Error('cb must be provided')
    queue.push(cb)
    args.push(function done (err) {
      var _queue = queue
      queue = []
      while(_queue.length) _queue.shift()(err)
    })

    fn.apply(null, args)
  }
}


module.exports = function (store, _codec) {
  var codec = _codec || require('flumecodec/json')
  var queue = []
  var value

  return {
    get: function (cb) {
      if(value) return cb(null, value)
      else store.get(function (err, _value) {
        if(err) return cb(err)
        try {
          value = codec.decode(_value)
        } catch (err) {
          return cb(err)
        }
        cb(null, value)
      })
    },
    //only allow one update at a time.
    set: onceAtATime(function put (_value, cb) {
      store.set(codec.encode(_value), function (err) {
        if(err) return cb(err)
        else cb(null, value=_value)
      })
    }, queue),
    destroy: onceAtATime(function destroy (cb) {
      store.destroy(function (err) {
        cb(err, value=null)
      })
    }, queue)
  }
}

