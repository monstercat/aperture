function addMetaElement (el, key, value) {
  var mel = document.createElement('meta')
  mel.setAttribute('property', key)
  mel.setAttribute('content', value)
  el.insertBefore(mel, el.firstElementChild)
}

function removeMetaElement (el, key) {
  var target = el.querySelector('[property="' + key + '"]')
  if (target)
    target.parentElement.removeChild(target)
}

function setMetaData (meta) {
  var head = document.querySelector('head')
  if (!head) return
  var tags = head.querySelectorAll('meta[property*="og:"],meta[property*="music:"]')
  for(var i = 0; i < tags.length; i++) {
    tags[i].parentElement.removeChild(tags[i])
  }
  meta['og:site_name'] = 'Monstercat'
  appendMetaData(meta)
}

function appendMetaData (meta) {
  var head = document.querySelector('head')
  for (var key in meta) {
    removeMetaElement(head, key)
    var vals = typeof(meta[key]) == 'object' ? meta[key] : [meta[key]]
    for(var i = 0; i < vals.length; i++) {
      if(vals[i] !== undefined) {
        addMetaElement(head, key, vals[i])
      }
    }
  }
}

function zeroPad (num, size) {
  var str = num.toString()
  return repeatString('0', size).substr(0,size - str.length)+str
}

function repeatString(str, times) {
  if (typeof str.repeat == 'function') {
    return str.repeat(times)
  }
  return Array.apply(null, Array(times)).reduce(function (s) {
    return s + str
  }, "")
}

function formatDate (date) {
  if (!formatDate.months) {
    formatDate.months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December"
    ]
  }
  if (!(date instanceof Date)) date = new Date(date)
  return formatDate.months[date.getMonth()] + ' ' +
    date.getDate() + ', ' +
    date.getFullYear()
}

function formatDateTime (datetime) {
  if(datetime == undefined) {
    return 'No Date'
  }
  var date = new Date(datetime)
  var offset = date.getTimezoneOffset()/60
  return formatDate(date) + ' ' + zeroPad(date.getHours(),2) + ':' + zeroPad(date.getMinutes(),2) + ' (UTC' + (offset > 0 ? '+' : '') + offset + ')'
}

function formatCents (cents) {
  return '$' + (cents / 100).toFixed(2)
}

function transformDatedObj (obj, field) {
  field = field || 'date'

  var date = new Date(obj[field])
  obj.dateISO = date.toISOString()
  obj.dateStr = formatDate(date)
  obj.dateObj = date
  return obj
}

function dateObjSorter (a, b) {
  if(a.dateObj == b.dateObj) {
    return 0
  }
  return a.dateObj > b.dateObj ? -1 : 1
}

function isMongoDBObjectId (str) {
  return str.match(/^[a-f\d]{24}$/i)
}

function requestSimple (method, what, obj, done) {
  request({
    url: endpoint + '/' + what,
    method: method,
    data: obj,
    withCredentials: true
  }, done)
}

function create (what, obj, done) {
  requestSimple("POST", what, obj, done)
}

function update (what, id, obj, done) {
  var path = id ? what + '/' + id : what
  requestSimple("PATCH", path, obj, done)
}

function destroy (what, id, done) {
  requestSimple("DELETE", what + '/' + id, null, done)
}

function post (what, id, obj, done) {
  requestSimple("POST", what + '/' + id, obj, done)
}

//Takes form data with dots in the names and makes it an options
/*
{
  year: 2017,
  'user.name': 'Colin',
  'user.settings.email.optin': true,
}
||
||
|| becomes
||
\/
{
  year: 2017,
  user: {
    name: 'Colin',
    settings: {
      email: {
        optin: true
      }
    }
  }
}
*/
function dataDotReducer (inData) {
  return Object.keys(inData).reduce(function (data, key) {
    if(key.indexOf(".") > 0) {
      var parts = key.split(".")
      //Make objects at keys if they're not there
      var chain
      for(var i = 1; i < parts.length; i++) {
        var slice = parts.slice(0,i)
        chain = slice.join(".")
        var todo = "data." + chain + " = data." + chain + " || {}"
        eval(todo)
      }

      var chain = parts.slice(0,parts.length-1).join(".")
      var todo = "data." + chain + "." + parts[parts.length-1] + " = inData[key]";
      eval(todo)
    }
    else {
      data[key] = inData[key]
    }
    return data
  }, {})
}

function checkboxesToCSV (values) {
  if(!values) {
    return ""
  }
  return Object.keys(values).filter(function (key) {
    return values[key] !== false
  }).join(',')
}

function randomChooser(n){
  return Math.floor(Math.random() * n+1);
}

function randomItem (items) {
  return items[randomChooser(items.length) - 1]
}

function fixTextareaNewLines (text) {
  if(!text) {
    return ""
  }
  if(text.indexOf("\r\n") >= 0) {
    return listToText(text.split("\r\n"))
  }
  return listToText(text.split("\n"))
}

function listToText (list) {
  return list ? list.join('&#13;&#10;') : ''
}

function listToCSV (list) {
  return list ? list.join(',') : ''
}

/* New Line Separated Values to Text */
function nlsvToList (text) {
  if(!text) {
    return []
  }
  return text.split("\n").map(function (url) {
    return url.trim()
  }).filter(function(url) {
    return url && url.length > 0
  })
}

function csvToList (csv) {
  if(!csv) {
    return []
  }
  return csv
    .split(",")
    .filter(function (val) {
      return val && val.length > 0
    })
    .map(function (val) {
      return val.trim()
    })
}

/* */

function getSession (done) {
  request({
    url: endpoint + '/self/session',
    withCredentials: true
  }, done)
}

function hasArtistAccess() {
  return session && session.permissions && userIsArtist(session.user)
}

function hasAdminAccess() {
  if(session && session.permissions && session.user && session.user.type) {
    for(var i = 0; i < session.user.type.length; i++) {
      if (session.user.type[i].indexOf('admin') >= 0) {
        return true
      }
    }
  }
  return false
}

function userIsArtist (user) {
  return user && user.type && user.type.indexOf('artist') >= 0
}

function hasEventAccess() {
  return session.permissions && session.permissions.event && session.permissions.event.create == true
}

function isSignedIn () {
  return !!(session && session.user)
}

function getSessionName () {
  var names = []
  if(session.user) {
    names = names.concat([session.user.realName, session.user.name, session.user.email.substr(0, session.user.email.indexOf('@'))])
  }
  for(var i = 0; i < names.length; i++) {
    if(names[i] && names[i].length > 0) {
      return names[i]
    }
  }
  return 'guest'
}

function transformPage (obj) {
  obj = obj || {}
  obj.isSignedIn = isSignedIn()
  obj.sessionName = getSessionName()
  obj.hasArtistAccess = hasArtistAccess()
  return obj
}

function arrayToMustacheArray (arr) {
  if(!arr) {
    return []
  }
  return arr.map(function (val, index) {
    return {
      index: index,
      value: val
    }
  })
}

function processDefault (state, node, xhr) {
  renderContent(node.getAttribute('data-template'), transformPage())
}

/**
 * Renders the content of a template into the [role=content] element
 *
 * @arg {String}  name The name of template to look up.
 * @arg {Object}  scope The object of data to use to render with.
 * @arg {Object}  partials The partials to be used in rendering.
 * 
 * @returns {Element}
 */
function renderContent (name, scope, partials) {
  var content = findNode('[role=content]')
  render(name, scope, content, partials)
  loadNodeSources(content)
}

function renderLoading (obj) {
  renderContent('loading', transformPage(obj))
}

function renderError (err) {
  renderContent('error', {error: err.toString()})
}

function renderHeader (obj) {
  var node = findNode('[role=header]')
  render('header', transformPage(obj), node)
}

function renderBreadcrumbs (obj) {
  var node = findNode('[role=breadcrumbs]')
  render('breadcrumbs', transformPage(obj), node)
}
