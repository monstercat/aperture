function hookArtistDropdowns () {
  var selects = findNodes('select[role=artist-dropdown]')

  if(selects.length == 0) {
    return
  }

  selects.forEach(function (el, index) {
    el.disabled = true
    el.innerHTML='<option>loading...</option>'
  })

  requestCached({
    url: endpoint + '/user/?filters=type,artist&sortOn=name',
    withCredentials: true
  }, function (err, data) {
    if(err) {
      selects.forEach(function (el, index) {
        el.disabled = true
        el.innerHTML='<option>error loading artists</option>'
      })
      return
    }

    var artists = data.results.sort(function (a, b) {
      if(a.name == b.name) return 0
      return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
    })

    var optionsHTML = artists.map(function (artist) {
      return '<option value="' + artist._id + '">' + artist.name + ' / ' + artist.realName + '/' + artist._id + '</option>'
    }).join("\n")

    selects.forEach(function (el, index) {
      el.disabled = false
      el.innerHTML = "<option>-select artist-</option>" + optionsHTML
    })
  })
}