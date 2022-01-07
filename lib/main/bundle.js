const http = require('http'),
  https = require('https'),
  defaults = {prefix: '/service/',encode: 'plain',wss: true,server: http.Server(),requestMiddleware: [],responseMiddleware: [],requestMiddlewares: [],responseMiddlewares: [],title: 'Service',debug: false,corrosion: [false, {}],},
  Request = require('./request'),
  Gateway = require('./gateway'),
  Encode = require('../encode'),
  Header = require('../header'),
  Url = require('../url')

class Rhodium {
  constructor(configuration) {
    Object.entries(Object.assign(defaults, configuration)).forEach(([key, value]) => {
      this[key] = value
    })
    this.encoding = Encode(this);
    this.url = Url(this);
    this.gateway = Gateway(this);
    this.request = Request(this);
    this.header = Header(this);
  }
}

module.exports = Rhodium;