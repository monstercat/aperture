function hookRemoteDropdowns (node, opts) {
  opts = opts || {}
  opts.idField = opts.idField || '_id'
  opts.sortField = opts.sortField || 'name'
  node = node || document

  if(!opts.getLabel) {
    opts.getLabel = function (obj) {
      return obj.name + obj.title
    }
  }

  if(!opts.getAttributes) {
    opts.getAttributes = function (obj) {
      return ""
    }
  }

  var selects = findNodes('select[role=' + opts.selectRole + ']')

  if(selects.length == 0) {
    return
  }

  selects.forEach(function (el, index) {
    el.disabled = true
    el.innerHTML='<option>loading...</option>'
  })


  requestCached({
    url: opts.url,
    withCredentials: true
  }, function (err, data) {
    if(err) {
      selects.forEach(function (el, index) {
        el.disabled = true
        el.innerHTML='<option>' + opts.errMsg + '</option>'
      })
      return
    }

    var trans = opts.transform || function (data) {
      data.results = data.results || []
      return data
    }

    data = trans(data)

    var results = data.results.sort(function (a, b) {
      if(a[opts.sortField] == b[opts.sortField]) return 0
      
      return a[opts.sortField].toLowerCase() > b[opts.sortField].toLowerCase() ? 1 : -1
    })

    var optionsHTML = results.map(function (obj) {
      return '<option value="' + obj[opts.idField] + '" ' + opts.getAttributes(obj) + '>' + opts.getLabel(obj) + '</option>'
    }).join("\n")

    selects.forEach(function (el, index) {
      el.disabled = false
      el.innerHTML = '<option value="">' + opts.promptMsg + '</option>' + optionsHTML
    })
    hookValueSelects(selects)
  })
}

function hookArtistDropdowns (node) {
  return hookRemoteDropdowns(node, {
    selectRole: 'artist-dropdown',
    errMsg: 'error loading artists',
    url: endpoint + '/user/?filters=type,artist&sortOn=name',
    getLabel: function (obj) {
      return obj.name + ' / ' + obj.realName + ' / ' + obj._id
    },
    getAttributes: function (obj) {
      return 'data-name="' + obj.name + '"'
    },
    promptMsg: '-select artist-'
  })
}

function hookWebsiteDetailsDropdowns (node) {
  return hookRemoteDropdowns(node, {
    selectRole: 'website-details-dropdown',
    errMsg: 'error website details',
    url: endpoint + '/website/?filters=public,1&fields=name,vanityUri',
    getLabel: function (obj) {
      return obj.name + ' / ' + obj.vanityUri 
    },
    promptMsg: '-select website details-'
  })
}

function hookTrackDropdowns (node) {
  return hookRemoteDropdowns(node, {
    selectRole: 'track-dropdown',
    errMsg: 'error website details',
    url: endpoint + '/track/?fields=title,artistsTitle',
    sortField: 'title',
    getLabel: function (obj) {
      return obj.title + ' by ' + obj.artistsTitle
    },
    promptMsg: '-select track-'
  })
}

function hookGenreDropdowns (node) {
  return hookRemoteDropdowns(node, {
    selectRole: 'genre',
    idField: 'name',
    errMsg: 'error getting genres',
    url: endpoint + '/catalog/browse/filters',
    getLabel: function (obj) {
      return obj.name
    },
    transform: function (response) {
      return {
        results: response.genres
      }
    },
    promptMsg: '-select genre-'
  })
}

function hookValueSelects (selects) {
  selects = selects || findNodes('select[value]')
  selects.forEach(function (el) {
    var selected = el.querySelector('option[value="' + el.getAttribute('value') + '"]')
    if(selected) {
      selected.setAttribute('selected', true)
    }
  })
}

function hookDateFields (node) {
  node = node || document
  var dateFields = document.querySelectorAll('input[type=date],input[type=datetime]')
  dateFields.forEach(function (el) {
    var parent = findParentWith(el, '.form-group', false)
    var feedback = makeFormControlFeedback(el)

    el.addEventListener('keyup', function () {
      var val = this.value
      var date = new Date(val)
      var str = date.toString()

      if(!val || el.disabled) {
        feedback.innerHTML =''
        parent.classList.toggle('has-danger', false)
        return
      }

      if(str == 'Invalid Date') {
        if(parent) {
          parent.classList.toggle('has-danger', true)
          feedback.classList.toggle('text-muted', false)
        }
        feedback.innerHTML = 'Invalid Date'
      }
      else {
        parent.classList.toggle('has-danger', false)
        feedback.classList.toggle('text-muted', true)
        feedback.innerHTML = formatDateTime(date)
      }
    })
    var e = new Event('keyup')
    el.dispatchEvent(e)
  })
}