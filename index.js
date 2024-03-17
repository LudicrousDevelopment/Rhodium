var req = require,
  server = req("http").Server(),
  proxy = new (req("./"))({
    encode: "xor",
    title: "Rhodium",
    server: server,
    wss: true,
    corrosion: [false, {}],
    favicon: "https://discord.com/"
  });
proxy.init();
server
  .on("request", (e, r) =>
    e.url.startsWith(proxy.prefix)
      ? proxy.request(e, r)
      : r.end(req("fs").readFileSync("./index.html"))
  )
  .listen(process.env.PORT || 3000);

