#!/usr/bin/env node

var argparse  = require('argparse')
var express   = require('express')
var path      = require('path')
var fs        = require('fs')
var pkg       = require('./package.json')
var colors    = require('colors')

var parser = new argparse.ArgumentParser({
  version: pkg.version,
  addHelp: true,
  description: pkg.description
})
parser.addArgument('command', { help: '"build" or "serve".' })
parser.addArgument(['--config', '-c'], {help: 'JSON config file'})
parser.addArgument(['--static_dir', '-sd'], {help: 'Static directory for Express'})
parser.addArgument(['--template_dir', '-td'], {help: 'Directory of template HTML files'})
parser.addArgument(['--html_dir', '-hd'], {help: 'Directory of site HTML files: begin, head, begin-body, body'})
parser.addArgument(['--output', '-o'], {help: 'File to save the built HTML to. If not set, defaults to stdout', defaultValue: 'bin/index.html'})
var args = parser.parseArgs();
var config = {};
if(args.config) {
  var json = fs.readFileSync(args.config, 'utf8');
  console.log('Loading config file: ' + path.resolve(args.config).yellow);
  config = JSON.parse(json);
}
config = Object.assign(args, config);
var dir = getDirectories();
var port = config.port || 6060;

if(config.js_constants) {
  console.log('JavaScript Constants'.bgMagenta);
  for(var k in config.js_constants) {
    console.log(("var " + k + ' '.repeat(100)).substr(0, 20) + ' = ' + ('"' + config.js_constants[k] + '"').bold);
  }
  console.log()
}

switch (args.command) {
  case "build":
    if(config.output) {
      fs.writeFileSync(config.output, buildHTML(), 'utf8');
      console.log('HTML written to ' + path.resolve(config.output).green)
    }
    else {
      process.stdout.write(buildHTML())
    }
    break
  case "serve":
    startServer()
}

function getDirectories () {
  var dir = {
    static: config.static_dir || "",
    templates: config.template_dir || "",
    html: config.html_dir || "",
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
    if(path.basename(i) == 'head.html') {
      //Slip in some javascript constants above the header
      if(config.js_constants) {
        str += '<!-- JS Constants Built By Aperture -->\n<script type="text/javascript">\n';
        for(var k in config.js_constants) {
          str += 'var ' + k + ' = "' + config.js_constants[k] + '";\n';
        }
        str += '</script>\n';
      }
    }
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
  console.log("Lisenting on port", port.toString().cyan + ".")
}
