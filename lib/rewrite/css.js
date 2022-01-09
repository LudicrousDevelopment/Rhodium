function CSSRewriter(ctx) {
  return function CSS(data, context) {
    
    const cont = context;
    cont.Url = new URL(ctx.encoding.decode(context.clientRequest.url.replace(ctx.prefix, '')))
    var ndata = data.replace(/@import\s+url\(['"`]*([a-zA-Z0-9\-\/_\.\\]*)['"`]*\)/gm, (str, p1) => {
      return str.replace(p1, context.url.encode(p1, cont))
    }).replace(/[a-zA-Z0-9\-]+:\s*url\(['"`]*([a-zA-Z0-9\-\/_\.\\]*)['"`]*\)/gm, (str, p1) => {
      console.log(`url('${context.url.encode(p1, cont)}')`)
      return `url('${context.url.encode(p1, cont)}')`
    })
    return ndata
  }
}

module.exports = CSSRewriter