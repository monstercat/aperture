function toast (opts) {
  var container = findNode('[role="toasts"]')
  if (!container) return
  var div = document.createElement('div')
  render('toast', opts, div)
  var el = div
  container.appendChild(el)
  setTimeout(function () {
    container.removeChild(el)
  }, opts.time || 3000)
}

function toasty (obj, time) {
  if (obj instanceof Error) {
    return toast({
      error: true,
      message: obj.message,
      time: time
    })
  }
  if (typeof obj == 'string') {
    return toast({
      message: obj,
      time: time
    })
  }
  toast(obj)
}

function reloadPage () {
  stateChange(location.pathname + location.search)
}

function formErrors (form, errs) {
  var errDiv = form.querySelector('[role=form-errors]')
  if(!errDiv) {
    var div = document.createElement('div')
    div.setAttribute("class", "hidden-xs-up alert alert-danger")
    div.setAttribute("role", "form-errors")
    form.insertBefore(div, form.firstChild)
    return formErrors(form, errs)
  }

  errs = errs || []
  if(errs.constructor != Array) {
    errs = [errs]
  }
  errs = errs.map(function (err) {
      console.log('err', err);
    if(typeof(err) == 'string') {
      err = {
        msg: err
      }
    }
    else if(!err.hasOwnProperty('msg')) {
      err = {
        msg: err.toString()
      }
    }
    else if(err.hasOwnProperty('field')) {
      err.selector = '[name=' + err.field + ']'
    }

    return err
  })
  var messages = errs.map(function (err) {
    return err.msg
  })
  errDiv.innerHTML = messages.join("<br />")
  errDiv.classList.toggle('hidden-xs-up', errs.length == 0)

  //Remove all the existing messages
  var highlighted = form.querySelectorAll('.has-warning, .has-success, .has-danger')
  if(highlighted) {
    highlighted.forEach(function (el) {
      el.classList.toggle('has-warning', false)
      el.classList.toggle('has-success', false)
      el.classList.toggle('has-danger', false)
      var feedback = el.querySelector('.form-control-feedback')
      if(feedback) {
        feedback.innerHTML = ''
      }
    })
  }

  //Add warnings to fields
  errs.forEach(function (err) {
    if(err.selector) {
      //Grab the actual offending input, textarea
      //Can be any element type
      var field = form.querySelector(err.selector)
      if(!field) {
        console.warn('Could not find field with err', err)
        return
      }
      
      //Find the containing form element. Usually a .form-group
      var parent = findParentWith(field, '.form-group', false)
      if(parent) {
        parent.classList.toggle('has-danger', true)
      }

      //Find or create the div that will contain the message
      var feedback = makeFormControlFeedback(field)

      feedback.innerHTML = err.msg
    }
  })

  return errs.length > 0
}

function makeFormControlFeedback (field) {
  var parent = findParentWith(field, '.form-group', false)
  var feedback = parent.querySelector('.form-control-feedback')
  if(feedback == null) {
    var div = document.createElement('div')
    div.setAttribute("class", "form-control-feedback")
    parent.appendChild(div, field)
    feedback = parent.querySelector('.form-control-feedback')
  }
  return feedback
}

function bindFileInputs () {
  var inputs = findNodes('input[type=file]')
  inputs.forEach(function (input) {
    input.addEventListener('change', function (e) {
      var input = e.target
      var files = input.files
      var span = input.nextElementSibling
      if(files.length == 0) {
        span.textContent = ''
        span.classList.toggle('has-file', false)
      }
      var names = []
      for(var i = 0; i < files.length; i++) {
        names.push(files[i].name)
      }
      names = names.join(", ")
      span.textContent = names
      span.classList.toggle('has-file', true)
    })
  })
}

function processWebsiteDetailsDropdown (state, sel, err, data) {
  if (state == 'start') {
    return sel.innerHTML = '<option>loading...</option>'
  }
  var obj = transformWebsiteDetailsDropdown(data, sel.getAttribute('data-value'))
  render('website-details-dropdown-options', obj, sel)
}

function processArtistsDropdown (state, sel, err, data) {
  if(state == 'start') {
    return sel.innerHTML='<option>loading...</option>'
  }
  var obj = transformArtistsDropdown(data)
  render('artists-dropdown', obj, sel)
}


function transformWebsiteDetailsDropdown (obj, selectedValue) {
  var options = obj.results.map(function (details) {
    var parts = [details.name || 'no name']
    parts.push(details.vanityUri || 'no uri')
    parts.push(details.public ? 'Public' : 'Private')
    parts.push(details._id)

    label = parts.join(' / ')

    return {
      label: label,
      name: details.name,
      value: details._id,
      selected: details._id == selectedValue
    }

  })
  options = options.sort(function (a, b) {
    if(a.name == b.name) {
      return -1
    }
    return a.name > b.name ? 1 : -1
  })
  return {
    options: options
  }
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
