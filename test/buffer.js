var tape = require('tape')

var Atomic = require('../buffer')

var filename = '/tmp/test_atomic_file'+Date.now()+'.buffer'
var atomic = Atomic(filename, '~')

var bytes = require('crypto').randomBytes(1024)

tape('test, no file', function (t) {

  atomic.get(function (err, value) {
    t.ok(err)
    atomic.set(bytes, function (err) {
      if(err) throw err
      atomic.get(function (err, value) {
        if(err) throw err
        t.deepEqual(value, bytes)
        console.log(value)
        t.end()
      })
    })
  })

})


