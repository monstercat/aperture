#!/usr/bin/env node

var argparse  = require('argparse')
var express   = require('express')
var path      = require('path')
var fs        = require('fs')
var pkg       = require('./package.json')

var parser = new argparse.ArgumentParser({
  version: pkg.version,
  addHelp: true,
  description: pkg.description
})
parser.addArgument('command', { help: '"build" or "serve"' }
)
var args = parser.parseArgs()
var dir = getDirectories()
var port = process.env.PORT || 6060

switch (args.command) {
  case "build":
    process.stdout.write(buildHTML())
    break
  case "serve":
    startServer()
}

function getDirectories () {
  var dir = {
    static: process.env.STATIC_DIR || "",
    templates: process.env.TEMPLATE_DIR || "",
    html: process.env.HTML_DIR || "",
    aperture_templates: path.join(__dirname, 'templates')
  }
  Object.keys(dir).forEach((key)=> {
    var url = dir[key]
    if (!url || path.isAbsolute(url)) return
    dir[key] = path.resolve(process.cwd(), url)
  })
  return dir
}

function buildHTML () {
  var order = [
    'begin',
    'head',
    'begin-body',
    'body'
  ]
  var str = ""
  var arr = []
  if (dir.html) {
    arr = arr.concat(order.map(function (i) {
      return path.join(dir.html, i + '.html')
    }))
  }
  arr = arr.concat(fs.readdirSync(dir.aperture_templates).map(function (i) {
    return path.join(dir.aperture_templates, i)
  }))
  if (dir.templates) {
    arr = arr.concat(fs.readdirSync(dir.templates).map(function (i) {
      return path.join(dir.templates, i)
    }))
  }
  if (dir.html) arr.push(path.join(dir.html, 'end.html'))
  arr.filter((i)=> {
    return path.basename(i).indexOf('.') != 0;
  })
  .forEach((i)=> {
    str += fs.readFileSync(i, 'utf8');
  });
  return str
}

function startServer () {
  var app = express()
  app.use(express.static(dir.static))
  app.use((req, res) => {
    if (process.env.NODE_ENV === 'production') {
      res.sendFile(path.join(dir.static, 'index.html'))
    }
    else {
      res.status(200).send(buildHTML())
    }
  })
  app.listen(port)
  console.log("Lisenting on port", port + ".")
}
