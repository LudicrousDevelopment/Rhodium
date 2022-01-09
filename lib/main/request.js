const http = require('http'),
  https = require('https')

function Request(ctx) {
  return function(request, response) {
    if (request.url.startsWith(ctx.prefix+'gateway')) {
      return ctx.gateway(request, response)
    }
    if (request.url.startsWith(ctx.prefix+'index')) {
      return response.writeHead(200, {'content-type': 'application/javascript'}).end(ctx.index)
    }
    var url = ctx.encoding.decode(request.url.replace(ctx.prefix, '')).replace('https://','https:/').replace('https:/','https://').replace('.map', '')
    ctx.url = ctx.urlS(ctx, url)
    try {new URL(url)} catch(e) {return response.writeHead(503).end(e.toString())}
    var Url = new URL(url)
    eval(Url.protocol.replace(':','')).request(url, {method: request.method, headers: ctx.header.request(request, response)}, (res) => {
      var chunks=[]
      var textData = ''
      res.on('data',e=>chunks.push(e)).on('end',()=>{
        textData = ctx.decompress(res, chunks)
        switch((res.headers['content-type']||'text/plain').split(';')[0]) {
          case "text/html":
            textData = ctx.rewrite.HTML(textData.toString(), request)
            break;
          case "application/javascript":
            textData = ctx.rewrite.JS(textData.toString())
            break;
          case "text/javascript":
            textData = ctx.rewrite.JS(textData.toString())
            break;
          case "text/css":
            textData = ctx.rewrite.CSS(textData.toString())
            break;
          case "text/plain":
            textData = textData.toString()
            break;
          default:
            break;
        }
        res.headers['rhodium-url'] = url
        response.writeHead(res.statusCode, ctx.header.response(request, res)).end(textData)
      })
    }).end()
  }
}

module.exports = Request