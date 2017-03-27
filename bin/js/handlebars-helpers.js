document.addEventListener('DOMContentLoaded', function () {
  if(window.Handlebars) {
    Handlebars.registerHelper('date', function (val) {
      if(!val) {
        return new Handlebars.SafeString('<abbr class="invalid-date">no date</abbr>')
      }
      var dateStr = new Date(val).toISOString() 
      return new Handlebars.SafeString('<abbr class="date" title="' + dateStr + '">' + formatDate(val) + '</abbr>')
    })

    Handlebars.registerHelper('datetime', function (val) {
      if(!val) {
        return new Handlebars.SafeString('<abbr class="invalid-date">no datetime</abbr>')
      }
      return new Handlebars.SafeString('<abbr class="date" title="' + new Date(val).toISOString() + '">' + formatDateTime(val) + '</abbr>')
    })
  }
})