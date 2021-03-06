function processSignOut (state, o) {
  o = transformPage(o)
  renderContent('signout', o)
  signOut()
}


function signIn (e) {
  e.preventDefault()
  var data = formToObject(e.target)
  var errs = []
  if(!data.email || data.email.indexOf('@') <= 0) {
    errs.push('Please provide a valid email')
  }
  if(!data.password) {
    errs.push('Please enter your password')
  }
  if(errs.length > 0) {
    return formErrors(e.target, errs)
  }
  request({
    url: endhost + '/signin',
    method: 'POST',
    withCredentials: true,
    data: data
  }, function (err, obj, xhr) {
    if (err) {
      toasty(new Error(err.message))
      formErrors(e.target, err.message)
      return
    }
    if (xhr.status != 209)
      return onSignIn()
    go('/authenticate-token')
  })
}

function authenticateTwoFactorToken (e) {
  e.preventDefault()
  request({
    url: endhost + '/signin/token',
    method: 'POST',
    data: formToObject(e.target),
    withCredentials: true
  }, function (err, obj, xhr) {
    if (err) return formErrors(e.target, err.message)
    onSignIn()
  })
}

function resendTwoFactorToken (e) {
  request({
    url: endhost + '/signin/token/resend',
    method: 'POST',
    withCredentials: true
  }, function (err, obj, xhr) {
    if (err) return window.alert(err.message)
    toasty("Token resent")
  })
}

function onSignIn () {
  getSession(function (err, sess) {
    if (err) {
      toasty(new Error(err.message))
      return
    } 
    session = sess
    renderHeader()
    go(getRedirectTo())
  })
}

function signOut (e) {
  request({
    url: endhost + '/signout',
    method: 'POST',
    withCredentials: true
  }, function (err, obj, xhr) {
    if (err) return window.alert(err.message)
    session.user = null
    go("/")
  })
}

function updatePassword (e) {
  e.preventDefault()
  var data = formToObject(e.target)
  if (!data.password) {
    return formErrors(e.target, "Password missing")
  }
  if (data.password != data.password_confirm) {
    return formErrors(e.target, "Passwords don't match")
  }
  data.code = queryStringToObject(window.location.search).key
  request({
    url: endhost + '/password/reset',
    method: 'POST',
    withCredentials: true,
    data: data
  }, function (err, obj, xhr) {
    if (err) return formErrors(e.target, err.toString())
    toasty('Password saved')
    go('/signin')
  })
}

function recoverPassword (e) {
  e.preventDefault()
  var data = formToObject(e.target)
  if(!data.email || data.email.indexOf('@') <= 0) {
    return formErrors(e.target, "Valid email required")
  }
  data.returnUrl = location.protocol + '//' + location.host + '/reset-password?key=:code'
  request({
    url: endhost + '/password/send-verification',
    method: 'POST',
    withCredentials: true,
    data: data
  }, function (err, obj, xhr) {
    if (err) return window.alert(err.message)
    toasty("Password recovery email sent")
  })
}

function getRedirectTo () {
  return queryStringToObject(window.location.search).redirect || "/"
}
