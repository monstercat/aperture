var express   = require('express')
var path      = require('path')
var fs        = require('fs')

var dir = process.cwd() + (process.env.NODE_ENV === 'production' ? '/bin' : '/src')
if (!path.isAbsolute(dir)) {
  dir = path.resolve(process.cwd(), dir)
}
var nodeModulesDir = path.join(process.cwd(), "node_modules")

var order = [
  'begin',
  'head',
  'begin-body',
  'body'
]
function buildHTML () {
  var str = ""
  var tdir = path.join(dir, 'templates') //Templates from the app
  var atdir = path.join(__dirname, 'templates') //Templates from aperture
  var hdir = path.join(dir, 'html')
  var arr = order.map(function (i) {
    return path.join(hdir, i + '.html')
  })
  arr = arr.concat(fs.readdirSync(atdir).map(function (i) {
    return path.join(atdir, i)
  }))
  arr = arr.concat(fs.readdirSync(tdir).map(function (i) {
    return path.join(tdir, i)
  }))
  arr.push(path.join(hdir, 'end.html'))
  arr.forEach(function (i) {
    str += fs.readFileSync(i, 'utf8')
  })
  return str
}

var app = express()
app.use(express.static(dir))
app.use(express.static(nodeModulesDir))
app.use((req, res) => {
  if (process.env.NODE_ENV === 'production') {
    res.sendFile(path.join(dir, 'index.html'))
  }
  else {
    res.status(200).send(buildHTML())
  }
})

app.listen(process.env.PORT || 6060)
