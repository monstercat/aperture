function hookArtistDropdowns (node) {
  node = node || document
  var selects = findNodes('select[role=artist-dropdown]')

  if(selects.length == 0) {
    return
  }

  selects.forEach(function (el, index) {
    //el.disabled = true
    el.innerHTML='<option>loading...</option>'
  })

  requestCached({
    url: endpoint + '/user/?filters=type,artist&sortOn=name',
    withCredentials: true
  }, function (err, data) {
    if(err) {
      selects.forEach(function (el, index) {
        //el.disabled = true
        el.innerHTML='<option>error loading artists</option>'
      })
      return
    }

    var artists = data.results.sort(function (a, b) {
      if(a.name == b.name) return 0
      return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
    })

    var optionsHTML = artists.map(function (artist) {
      return '<option value="' + artist._id + '" data-name="' + artist.name + '">' + artist.name + ' / ' + artist.realName + '/' + artist._id + '</option>'
    }).join("\n")

    selects.forEach(function (el, index) {
     // el.disabled = false
      el.innerHTML = "<option>-select artist-</option>" + optionsHTML
    })
  })
}

function hookWebsiteDetailsDropdowns (node) {
  node = node || document
  var selects = findNodes('select[role=website-details-dropdown]')

  if(selects.length == 0) {
    return
  }

  selects.forEach(function (el, index) {
    el.disabled = true
    el.innerHTML='<option>loading...</option>'
  })

  requestCached({
    url: endpoint + '/website/?filters=public,1&fields=name,vanityUri',
    withCredentials: true
  }, function (err, data) {
    if(err) {
      console.error(err)
      selects.forEach(function (el, index) {
        el.disabled = true
        el.innerHTML='<option>error loading website details</option>'
      })
      return
    }

    var details = data.results.sort(function (a, b) {
      if(a.name == b.name) return 0
      return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
    })

    var optionsHTML = details.map(function (detail) {
      return '<option value="' + detail._id + '">' + detail.name + ' / ' + detail.vanityUri  + '</option>'
    }).join("\n")

    selects.forEach(function (el, index) {
      el.disabled = false
      el.innerHTML = "<option>-select website details-</option>\n" + optionsHTML
    })
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