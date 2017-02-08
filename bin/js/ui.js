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
  errs = errs || []
  if(errs.constructor != Array) {
    errs = [errs]
  }
  var errDiv = form.querySelector('[role=form-errors]')
  if(!errDiv) {
    var div = document.createElement('div')
    div.setAttribute("class", "hidden-xs-up alert alert-danger")
    div.setAttribute("role", "form-errors")
    form.insertBefore(div, form.firstChild)
    return formErrors(form, errs)
  }
  errDiv.innerHTML = errs.join("<br />")
  errDiv.classList.toggle('hidden-xs-up', errs.length == 0)
  return errs.length > 0
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