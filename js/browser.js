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
  this.sourceQueryString = {}
}

Browser.prototype.readUrl = function (qs) {
  this.urlData = queryStringToObject(qs)
  if(this.options.defaultUrlData) {
    for(var key in this.options.defaultUrlData) {
      if(!this.urlData.hasOwnProperty(key)) {
        this.urlData[key] = this.options.defaultUrlData[key]
      }
    }
  }
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

  if(this.sourceQueryString) {
    for(var i in this.sourceQueryString) {
      qs[i] = this.sourceQueryString[i]
    }
  }

  if(this.urlData.search && this.options.fuzzyFields) {
    var fuzzyOrs = this.options.fuzzyFields.map(function (field) {
      return field + ',' + this.urlData.search
    }.bind(this))
    qs.fuzzyOr = fuzzyOrs.join(',')
  }

  if(this.options.filterFields) {
    var filters = this.options.filterFields
      .filter(function (field) {
        return this.urlData.hasOwnProperty(field)
      }.bind(this))
      .map(function (field) {
        return field + ',' + this.urlData[field]
      }.bind(this))
    
    if(filters.length > 0) {
      qs.filters = filters.join(',')
    }
  }

  qs.skip = this.getSkip()

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

Browser.prototype.getSkip = function () {
  var currentPage = this.getCurrentPage()
  return (currentPage - 1) * this.options.limit
}

Browser.prototype.getNumPages = function () {
  if(!this.data) {
    return 0
  }

  return Math.ceil(this.data.total / this.options.limit)
}

Browser.prototype.getPageUrl = function (page) {
  var qo = JSON.parse(JSON.stringify(this.urlData))
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

  var frm = this.getSkip() + 1
  var to = Math.min(this.data.total, frm + this.options.limit - 1)

  return {
    links: links,
    numPages: numPages,
    currentPage: currentPage,
    from: frm,
    to: to
  }
}