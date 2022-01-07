const http = require('http'),
  https = require('https')

function Request(ctx) {
  return function(request, response) {
    if (request.url.startsWith(ctx.prefix+'gateway')) {
      return ctx.gateway(request, response)
    }
    var url = ctx.url.decode(request.url)
    console.log(url)
  }
}

module.exports = Request