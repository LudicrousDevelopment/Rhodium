var req=require,
  server=req("http").Server(),
  proxy=new(req("./"))({title:"Rhodium",server:server, wss: true, corrosion: [false, {}], favicon: 'https://discord.com/', userAgent: undefined});proxy.init();server.on("request",(e,r)=>(e.url.startsWith(proxy.prefix)?proxy.request(e,r):r.end(req("fs").readFileSync("./index.html")))).listen(process.env.PORT||8080);