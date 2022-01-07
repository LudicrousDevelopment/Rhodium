function URL(ctx) {
  return {
    encode(url) {
      if (url.startsWith('data:')) return url;
      else if (url.startsWith('./')) url = url.splice(2);
      const validProtocol = url.startsWith('http://') || url.startsWith('https://') || url.startsWith('ws://') || url.startsWith('wss://');
      const rewritten = prefix + (validProtocol ? url : ctx.url.origin + url);
      console.log(rewritten);
      return rewritten;
    },
    decode(url) {
      return ctx.encoding.decode(url.replace(ctx.prefix, ''))
    }
  }
}

module.exports = URL