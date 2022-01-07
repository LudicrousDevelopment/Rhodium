var req=require,
  server=req("http").Server(),
  proxy=new(req("./"))({server:server, wss: true, corrosion: [false, {}]});server.on("request",(e,r)=>(e.url.startsWith(proxy.prefix)?proxy.request(e,r):r.end(req("fs").readFileSync("./index.html"))));server.listen(80,()=>console.log('80'));