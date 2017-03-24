document.addEventListener('DOMContentLoaded', function () {
  if(window.Handlebars) {
    console.log('register hler')
    Handlebars.registerHelper('date', function (val) {
      return new Handlebars.SafeString('<abbr class="date" title="' + new Date(val).toISOString() + '">' + formatDate(val) + '</abbr>')
    })
  }
})