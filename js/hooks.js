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
    errMsg: 'error loading tracks',
    url: endpoint + '/track/?fields=title,artistsTitle',
    sortField: 'title',
    getLabel: function (obj) {
      return obj.title + ' by ' + obj.artistsTitle
    },
    promptMsg: '-select track-'
  })
}

function hookReleaseDropdowns (node) {
  return hookRemoteDropdowns(node, {
    selectRole: 'release-dropdown',
    errMsg: 'error loading releases',
    url: endpoint + '/release/?fields=title,renderedArtists',
    sortField: 'title',
    getLabel: function (obj) {
      return obj.title + ' by ' + obj.renderedArtists
    },
    promptMsg: '-select release-'
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

function hookValueRadioLists (lists) {
  lists = lists || document.querySelectorAll('[role=radio-list]')
  lists.forEach(function (list) {
    var value = list.getAttribute('value')
    var options = list.querySelectorAll('input[type=radio]')
    options.forEach(function (option) {
      option.checked = option.getAttribute('value') == value
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

var countries = ["Afghanistan","Åland","Albania","Algeria","American Samoa","Andorra","Angola","Anguilla","Antarctica","Antigua and Barbuda","Argentina","Armenia","Aruba","Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bermuda","Bhutan","Bolivia","Bosnia and Herzegovina","Botswana","Bouvet Island","Brazil","British Indian Ocean Territory","Brunei Darussalam","Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon","Canada","Cape Verde","Cayman Islands","Central African Republic","Chad","Chile","China","Christmas Island","Cocos (Keeling) Islands","Colombia","Comoros","Congo (Brazzaville)","Congo (Kinshasa)","Cook Islands","Costa Rica","Côte d'Ivoire","Croatia","Cuba","Cyprus","Czech Republic","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Ethiopia","Falkland Islands","Faroe Islands","Fiji","Finland","France","French Guiana","French Polynesia","French Southern Lands","Gabon","Gambia","Georgia","Germany","Ghana","Gibraltar","Greece","Greenland","Grenada","Guadeloupe","Guam","Guatemala","Guernsey","Guinea","Guinea-Bissau","Guyana","Haiti","Heard and McDonald Islands","Honduras","Hong Kong","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Isle of Man","Israel","Italy","Jamaica","Japan","Jersey","Jordan","Kazakhstan","Kenya","Kiribati","Korea North","Korea South","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Macau","Macedonia","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands","Martinique","Mauritania","Mauritius","Mayotte","Mexico","Micronesia","Moldova","Monaco","Mongolia","Montenegro","Montserrat","Morocco","Mozambique","Myanmar","Namibia","Nauru","Nepal","Netherlands","Netherlands Antilles","New Caledonia","New Zealand","Nicaragua","Niger","Nigeria","Niue","Norfolk Island","Northern Mariana Islands","Norway","Oman","Pakistan","Palau","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Pitcairn","Poland","Portugal","Puerto Rico","Qatar","Reunion","Romania","Russian Federation","Rwanda","Saint Barthélemy","Saint Helena","Saint Kitts and Nevis","Saint Lucia","Saint Martin (French part)","Saint Pierre and Miquelon","Saint Vincent and the Grenadines","Samoa","San Marino","Sao Tome and Principe","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands","Somalia","South Africa","South Georgia and South Sandwich Islands","Spain","Sri Lanka","Sudan","Suriname","Svalbard and Jan Mayen Islands","Swaziland","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand","Timor-Leste","Togo","Tokelau","Tonga","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Turks and Caicos Islands","Tuvalu","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States Minor Outlying Islands","United States of America","Uruguay","Uzbekistan","Vanuatu","Vatican City","Venezuela","Vietnam","Virgin Islands British","Virgin Islands U.S.","Wallis and Futuna Islands","Western Sahara","Yemen","Zambia","Zimbabwe"];
function hookCountrySelects (selects) {
  selects = selects || findNodes('select[role=country]')
  selects.forEach(function (sel) {
    sel.innerHTML = '<option></option>' + countries.map(function (c) {
      return '<option value="' + c + '">' + c + '</option>';
    });
  });
}