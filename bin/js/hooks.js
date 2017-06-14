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

/**
 * This hooks up a series of form inputs loaded using the 'date-time-picker' Handlebars helper.
 * There is a date picker, using a Bootstrap plugin, a time input, and a timezone dropdown
 * The final GMT date in ISO format is stored in a hidden form input
 */
function hookDateTimeFields (node, opts) {
  opts = opts || {};
  node = node || document;
  var fields = node.querySelectorAll('[role=date-time-picker]');
  console.log('node', node);
  console.log('fields', fields);
  var timezones = ['America/Vancouver', 'America/Toronto', 'Europe/London'];
  var defaultTimezone = 'America/Vancouver';
  fields.forEach(function (el) {
    var selectedTimezone = defaultTimezone;
    var $el = $(el);
    var $help= $el.find('.form-help');
    var isoInput = $el.find('input[role=iso-date]');
    var date = new Date(isoInput.val());
    var mdate;
        console.log('date.toString()', date.toString());
    if(date.toString() == 'Invalid Date') {
      mdate = moment(new Date()).tz(selectedTimezone);
    }
    else {
      mdate = moment(date).tz(selectedTimezone);
    }
    var dateInput = $el.find('[role=date-time-picker-date]');
    var timeInput = $el.find('[role=date-time-picker-time]');
    var zoneSelect = $el.find('[role=date-time-picker-timezone]');

    var updateDate = function () {
      var times = timeInput.val();
      var dateVal = dateInput.val();

      //Update based on the date picker
      if(dateVal) {
        var parts = dateVal.split(/[\-|\/]/);
        console.log('parts', parts);
        if(parts.length == 3) {
          mdate.year(parts[0]);
          mdate.month(parseInt(parts[1]) - 1); //Months are 0 to 11 index
          mdate.date(parts[2]);
        }
      }

      if(times) {
        var split = times.split(':');
        console.log('split', split);
        if(split.length > 0) {
          split[0] = split[0] || 0;
          mdate.hour(parseInt(split[0]));
          console.log('set hour', split[0]);
          if(split.length > 1) {
            mdate.minute(parseInt(split[1]));
          }
        }
        else {
          mdate.hour(0);
        }
      }
      else {
        mdate.hour(0);
      }

      isoInput.val(mdate.toISOString());
      $help.text(mdate.clone().tz(defaultTimezone).format('ddd MMM Do YYYY h:mm A z'));
    }

    var updateInputs = function () {
      //Update the view to match the date passed in to the handlebars helper
      if(mdate.format() == 'Invalid date') {
        dateInput.val('');
        timeInput.val('');
      }
      else {
        dateInput.val(mdate.format('YYYY-MM-DD'));
        timeInput.val(mdate.format('HH:mm'));
      }
      timeInput.ignoreChange = true
     }

    //dateInput.value = date.getDate() + '/' + date.getMonth() + '/' + date.getFullYear();
    dateInput.on('change', function () {
      console.log('dateinput thing');
      updateDate();
    });
    timeInput.on('change keyup', function (e) {
      var val = $(this).val();
      var replaced = val.replace(/[^0-9:]/g, '');
      
      if(val != replaced) {
        var start = this.selectionStart;
        var end = this.selectionEnd;
        $(this).val(replaced);
        this.setSelectionRange(start-1, end-1);
      }

      //Sometimes the code cahnges the value of this input because of timezone changes
      //and we just want to update the display without actually changing the data
      if(timeInput.ignoreChange) {
        timeInput.ignoreChange = false;
        console.log('ignored');
        return
      }
      updateDate();
    });
    zoneSelect.on('change', function (e) {
      selectedTimezone = zoneSelect.val();
      mdate = mdate.clone().tz(selectedTimezone); //Convert the moment date to the new timezone
      //updateDate();
      updateInputs();
    });
    $(dateInput).datepicker({
      format: 'yyyy-mm-dd',
      autoclose: true
    }).on('change', updateDate);

    updateInputs();
    updateDate();
    zoneSelect.html(timezones.map(function (tz) {
      return '<option value="' + tz + '">' + tz + '</option>'
    }))
  });
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