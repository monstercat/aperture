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
