var req=require,
  server=req("http").Server(),
  proxy=new(req("./"))({server:server, wss: true, corrosion: [false, {}], favicon: 'https://discord.com/'});proxy.init();server.on("request",(e,r)=>(e.url.startsWith(proxy.prefix)?proxy.request(e,r):r.end(req("fs").readFileSync("./index.html")))).listen(8080);