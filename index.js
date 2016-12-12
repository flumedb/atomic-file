var fs = require('fs')

function isFunction (f) {
  return 'function' === typeof f
}

module.exports = function (filename, suffix, _codec) {
  var codec = _codec || require('./codec')
  suffix = suffix || '~'
  var queue = []
  var value
  return {
    get: function (cb) {
      if(value) return cb(null, value)
      else fs.readFile(filename, 'utf8', function (err, _value) {
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
    set: function put (_value, cb) {
      if(!isFunction(cb)) throw new Error('cb must be function')
      if(queue.length) {
        return queue.push(function retry () {
          put(_value, cb)
        })
      }
      queue.push(cb)

      function done (err) {
        var _queue = queue
        queue = []
        while(_queue.length) _queue.shift()(err)
      }

      fs.writeFile(filename+suffix, codec.encode(_value), function (err) {
        if(err) return done(err)
        fs.rename(filename+suffix, filename, function (err) {
          if(err) done(err)
          else done(null, value = _value)
        })
      })
    }
  }
}


