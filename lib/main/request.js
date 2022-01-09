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
    ctx.clientRequest = request;
    ctx.clientResponse = response;
    try {new URL(url)} catch(e) {return response.writeHead(503).end(e.toString())}
    var Url = new URL(url)
    var headers = ctx.header.request(request, response)
    const httpRequest = eval(Url.protocol.replace(':','')).request(url, {method: request.method, headers: headers}, (res) => {
      var chunks=[]
      var textData = ''
      res.on('data',e=>chunks.push(e)).on('end',()=>{
        if (request.headers['x-replit-user-id']) url = url.replace('https://', 'https:/')
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
            textData = ctx.rewrite.CSS(textData.toString(), ctx)
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
    }).on('error', err => response.end('Error: '+err))
    if (!response.writableEnded) {
      request.on('data', (data) => httpRequest.write(data)).on('end', () => httpRequest.end())
    } else {
      httpRequest.end()
    }
  }
}

module.exports = Request