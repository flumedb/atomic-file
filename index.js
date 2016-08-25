var fs = require('fs')
var createMutex = require('read-write-lock')

var codec = {
  encode: function (obj) {
    return JSON.stringify(obj)
  },
  decode: function (b) {
    return JSON.parse(b.toString())
  }
}

module.exports = function (filename, suffix) {
  var locker = createMutex()
  suffix = suffix || '~'
  var value
  return {
    get: function (cb) {
      if(value) return cb(null, value)
      else fs.readFile(filename, 'utf8', function (err, _value) {
        if(err) return cb(err)
        cb(null, value = JSON.parse(_value))
      })
    },
    //only allow one update at a time.
    set: function put (_value, cb) {
      locker.writeLock(function(unlock) {
        fs.writeFile(filename+suffix, codec.encode(_value), function (err) {
          if(err) return unlock(), cb(err)
          fs.rename(filename+suffix, filename, function (err) {
            unlock()
            if(err) cb(err)
            else cb(null, value = _value)
          })
        })
      })
    }
  }
}
