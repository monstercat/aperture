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
    div.setAttribute("class", "hide alert alert-danger")
    div.setAttribute("role", "form-errors")
    form.insertBefore(div, form.firstChild)
    console.log('div', div)
    console.log('form', form)
    return formErrors(form, errs)
  }
  console.log('errDiv', errDiv)
  errDiv.innerHTML = errs.join("<br />")
  errDiv.classList.toggle('hide', errs.length == 0)
  return errs.length > 0
}