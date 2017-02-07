function processSignOut (state, o) {
  o = transformPage(o)
  renderContent('signout', o)
  signOut()
}


function signIn (e) {
  e.preventDefault()
  requestJSON({
    url: endhost + '/signin',
    method: 'POST',
    withCredentials: true,
    data: getDataSet(e.target)
  }, function (err, obj, xhr) {
    if (err) return window.alert(err.message)
    if (xhr.status != 209)
      return onSignIn()
    go('/authenticate-token')
  })
}

function authenticateTwoFactorToken (e) {
  e.preventDefault()
  requestJSON({
    url: endhost + '/signin/token',
    method: 'POST',
    data: getDataSet(el),
    withCredentials: true
  }, function (err, obj, xhr) {
    if (err) return window.alert(err.message)
    onSignIn()
  })
}

function resendTwoFactorToken (e) {
  requestJSON({
    url: endhost + '/signin/token/resend',
    method: 'POST',
    withCredentials: true
  }, function (err, obj, xhr) {
    if (err) return window.alert(err.message)
    toasty("Token resent")
  })
}

function onSignIn() {
  getSession(function (err, sess) {
    if (err) return window.alert(err.message)
    session = sess
    go(getRedirectTo())
  })
}

function signOut (e) {
  requestJSON({
    url: endhost + '/signout',
    method: 'POST',
    withCredentials: true
  }, function (err, obj, xhr) {
    if (err) return window.alert(err.message)
    session.user = null
    go("/")
  })
}

function recoverPassword (e) {
  e.preventDefault()
  var data = getDataSet(e.target)
  if(!data.email || data.email.indexOf('@') <= 0) {
    return formErrors(e.target, "Valid email required")
  }
  data.returnUrl = location.protocol + '//' + location.host + '/reset-password?key=:code'
  requestJSON({
    url: endhost + '/password/send-verification',
    method: 'POST',
    withCredentials: true,
    data: data
  }, function (err, obj, xhr) {
    if (err) return window.alert(err.message)
    window.alert(strings.passwordResetEmail)
  })
}

function getRedirectTo() {
  return queryStringToObject(window.location.search).redirect || "/"
}
