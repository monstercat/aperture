document.addEventListener('DOMContentLoaded', function () {
  if(window.Handlebars) {
    Handlebars.registerHelper('date', function (val) {
      return new Handlebars.SafeString('<abbr class="date" title="' + new Date(val).toISOString() + '">' + formatDate(val) + '</abbr>')
    })

    Handlebars.registerHelper('datetime', function (val) {
      return new Handlebars.SafeString('<abbr class="date" title="' + new Date(val).toISOString() + '">' + formatDateTime(val) + '</abbr>')
    })
  }
})