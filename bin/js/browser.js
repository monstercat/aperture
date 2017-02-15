function Browser (opts) {
  var defaults = {
    page: 1,
    limit: 50,
    baseUrl: '/',
    pagePadding: 10 //If you are on page 88, this will show links from (88-pagePadding) to (88+pagePadding)
  }
  this.options = opts
  for(var k in defaults) {
    if(!this.options.hasOwnProperty(k)) {
      this.options[k] = defaults[k]
    }
  }
  this.getSourceQueryObjectMiddleware = false
  this.data = {}
}

Browser.prototype.readUrl = function (qs) {
  this.urlData = queryStringToObject(qs)
}

Browser.prototype.getSourceQueryString = function () {
  return objectToQueryString(this.getSourceQueryObject())
}

Browser.prototype.getSourceQueryObject = function () {
  var qs = {
    fields: this.options.fields,
    sortValue: this.options.sortValue,
    sortOn: this.options.sortOn,
    limit: this.options.limit
  }

  if(this.urlData.search && this.options.fuzzyFields) {
    var fuzzyOrs = this.options.fuzzyFields.map(function (field) {
      return field + ',' + this.urlData.search
    }.bind(this))
    qs.fuzzyOr = fuzzyOrs.join(',')
  }

  var currentPage = this.getCurrentPage()
  console.log('currentPage', currentPage)
  qs.skip = (currentPage - 1) * this.options.limit

  if(this.getSourceQueryObjectMiddleware) {
    qs = this.getSourceQueryObjectMiddleware(qs)
  }

  return qs
}

/*
  What the server gives you back.
  data : {
    results: [],
    limit: 100,
    skip: 0,
    total: 4320432
  }
*/
Browser.prototype.setData = function (data) {
  this.data = data
}

Browser.prototype.getNumPages = function () {
  if(!this.data) {
    return 0
  }

  return Math.ceil(this.data.total / this.options.limit)
}

Browser.prototype.getPageUrl = function (page) {
  var qo = this.urlData
  if(page > 1) {
    qo.page = page
  }
  else {
    delete qo.page
  }
  return this.options.baseUrl + '?' + objectToQueryString(qo)
}

Browser.prototype.getCurrentPage = function () {
  var page = this.urlData.page || 1
  return parseInt(page)
}

Browser.prototype.getPagination = function () {
  var numPages = this.getNumPages()
  var currentPage = this.getCurrentPage()
  
  var prev = {
    label: 'Prev',
    href: this.getPageUrl(currentPage-1),
    disabled: currentPage == 1
  }
  var next = {
    label: 'Next',
    href: this.getPageUrl(currentPage+1),
    disabled: currentPage >= numPages
  }

  var links = []
  var start = Math.max(currentPage - this.options.pagePadding, 1)
  var end = Math.min(currentPage + this.options.pagePadding, numPages)

  if(start > 1) {
    links.push({
      label: 'First',
      href: this.getPageUrl(1)
    })
  }
  links.push(prev)
  for(var i = start; i <= end; i++) {
    links.push({
      label: i,
      href: this.getPageUrl(i),
      active: currentPage == i
    })
  }
  links.push(next)
  if(end < numPages) {
    links.push({
      label: 'Last',
      href: this.getPageUrl(numPages)
    })
  }
  return {
    links: links,
    numPages: numPages
  }
}