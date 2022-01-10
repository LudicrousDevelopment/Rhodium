function CSSRewriter(ctx) {
  return function CSS(data, context) {
    const cont = context;
    cont.Url = new URL(ctx.encoding.decode(context.clientRequest.url.replace(ctx.prefix, '')))
    return data.replace(/url\("(.*?)"\)/gi, str => {var url = str.replace(/url\("(.*?)"\)/gi, '$1');return `url("${context.url.encode(url, cont)}")`;}).replace(/url\('(.*?)'\)/gi, str => {var url = str.replace(/url\('(.*?)'\)/gi, '$1');return `url('${context.url.encode(url, cont)}')`;}).replace(/url\((.*?)\)/gi, str => {var url = str.replace(/url\((.*?)\)/gi, '$1');if (url.startsWith(`"`) || url.startsWith(`'`)) return str;return `url("${context.url.encode(url, cont)}")`;}).replace(/@import (.*?)"(.*?)";/gi, str => {var url = str.replace(/@import (.*?)"(.*?)";/, '$2');return `@import "${context.url.encode(url, cont)}";`}).replace(/@import (.*?)'(.*?)';/gi, str => {var url = str.replace(/@import (.*?)'(.*?)';/, '$2');return `@import '${context.url.encode(url, cont)}';`})
  }
}

module.exports = CSSRewriter