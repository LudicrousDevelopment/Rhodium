const http = require('http'),
  https = require('https'),
  fs = require('fs'),
  path = require('path'),
  webpack = require('webpack'),
  defaults = {prefix: '/service/',encode: 'plain',wss: true,server: http.Server(),requestMiddleware: [],responseMiddleware: [],requestMiddlewares: [],responseMiddlewares: [],title: 'Service',debug: false,corrosion: [false, {}],cors:false,},
  Request = require('./request'),
  Gateway = require('./gateway'),
  Rewrite = require('../rewrite/bundle')
  //Window = require('../window/bundle'),
  Encode = require('../encode'),
  Header = require('../header'),
  Url = require('../url'),
  Base64 = require('../base64'),
  Decompress = require('../decompress'),
  WebSocket = require('./websocket')

class Rhodium {
  constructor(configuration) {
    Object.entries(Object.assign(defaults, configuration)).forEach(([key, value]) => {
      this[key] = value
    })
    this.encoding = Encode(this);
    this.urlS = Url;
    this.base64 = Base64(this);
    this.decompress = Decompress(this);
    this.rewrite = new Rewrite(this)
    this.gateway = Gateway(this);
    //this.Window = new Window(this);
    this.header = Header(this);
    this.request = Request(this);
    this.upgrade = WebSocket(this);
  };
  init() {
    webpack({
      mode: 'none',
      entry: path.join(__dirname, '../../lib/window/bundle.js'),
      output: {
        path: __dirname,
        filename: 'index.js',
      }
    }, err => 
      console.log(err || 'Bundled scripts')
    );
  };
  get index() {
    return fs.readFileSync(path.join(__dirname, 'index.js'), 'utf-8')
  };
}

module.exports = Rhodium;