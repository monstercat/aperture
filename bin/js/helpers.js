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
  var date = new Date(datetime)
  var offset = date.getTimezoneOffset()/60
  return formatDate(date) + ' ' + zeroPad(date.getHours(),2) + ':' + zeroPad(date.getMinutes(),2) + ' (UTC' + (offset > 0 ? '+' : '') + offset + ')'
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

/* */

function getSession (done) {
  request({
    url: endpoint + '/self/session',
    withCredentials: true
  }, done)
}

function hasArtistAccess() {
  return session && session.permissions && session.user && session.user.type && session.user.type.indexOf('artist') >= 0
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

function processDefault (state, node, xhr) {
  renderContent(node.getAttribute('data-template'), transformPage())
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


function transformArtistsDropdown (obj) {
  var options = obj.results.map(function (details) {
    return {
      label: details.name,
      value: JSON.stringify({_id: details._id, name: details.name})
    }

  })
  options = options.sort(function (a, b) {
    if(a.label == b.label) {
      return -1
    }
    return a.label > b.label ? 1 : -1
  })
  return {
    options: options
  }
}