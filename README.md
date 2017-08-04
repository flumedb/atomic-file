# atomic-file

store data in a file, but gaurantee there is never a partial write.

This uses a simple trick to make writes to the file system atomic:
first write the file to `{filename}~`, then `mv {filename}~ {filename}`
although it's possible a program to crash while it's part way through writing a file,
the rename operation (`mv`) can only either succeed or fail.

``` js
var AtomicFile = require('atomic-file') //default, json encoding
// var AtomicFile = require('atomic-file/buffer') //binary

var af = AtomicFile(filename)
//get the current contents
af.get(function (err, value) {
  //write a new value
  af.set(value, function (err) {

  })
})
```

note, get stores the read value in memory, so subsequent
calls to get will be instant. Successful writes will update the value.

## License

MIT


