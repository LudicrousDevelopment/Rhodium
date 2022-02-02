const $RConfig = JSON.parse(document.currentScript.getAttribute('data-config'))
$RConfig.url = $RConfig.url.replace('https://', 'https:/').replace('https:/','https://')

class rLocation {
  get [Symbol.toPrimitive]() {
      return () => this.href;
  };
}

window.EncodingConfiguration = ((ctx) => {
    switch(ctx.encode) {
      case "xor":
        return xor()
        break;
      case "plain":
        return {
          encode(str) {
            return str
          },
          decode(str) {
            return str
          }
        }
        break;
      case "base64":
        return {
          encode(str) {
            return str
          },
          decode(str) {
            return str
          }
        }
        break;
      default:
        return {
          encode(str) {
            return str
          },
          decode(str) {
            return str
          }
        }
        break;
    }
  })($RConfig)

window.$Rhodium = {
  location: new rLocation(),
  encoding: EncodingConfiguration
}

function xor() {
  return {
    encode(str) {
      if (str.startsWith('http')) return encodeURIComponent(str.toString().split('').map((char, ind) => ind % 2 ? String.fromCharCode(char.charCodeAt() ^ 2) : char).join(''));
    },
    decode(str) {
      if (!str.startsWith('http')) return decodeURIComponent(str).split('').map((char, ind) => ind % 2 ? String.fromCharCode(char.charCodeAt() ^ 2) : char).join('');
    }
  }
}

Object.entries($RConfig).forEach(([e,v])=>$Rhodium[e]=v)

Object.defineProperty($Rhodium, 'hlocation', {
  get() {
    return $Rhodium.location.href
  },
  set(val) {
    location.href = $Rhodium.url.encode(val,{Url:new URL($Rhodium.location.href)})
  }
})

$Rhodium.RewriteSrcset = function(sample) {
  return sample.split(',').map(e => {
    return(e.split(' ').map(a => {
      if (a.startsWith('http')||(a.startsWith('/')&&!a.startsWith($RConfig.prefix))) {
        var url = $Rhodium.url.encode(a, {Url:new URL($Rhodium.location.href)})
      }
      return a.replace(a, (url||a))
    }).join(' '))
  }).join(',')
}

$RConfig.encoding = ($Rhodium.encoding)

$Rhodium.url = (function URL(ctx, curl) {
  return {
    encode(url, context) {
      try {
        url = url.toString()
        if (url.match(/^(data:|about:|javascript:|blob:)/g)) return url;
        else if (url.startsWith('./')) url = url.splice(2);
        if (url.startsWith(ctx.prefix)) return url
        url = url.replace(/^\/\//g, 'https://')
        const validProtocol = url.startsWith('http://') || url.startsWith('https://') || url.startsWith('ws://') || url.startsWith('wss://');
        if (!context.Url.origin.endsWith('/') && !url.startsWith('/') && !url.startsWith('http:') && !url.startsWith('https:')) {
          url = '/'+url
        }
        var rewritten = ctx.prefix + ctx.encoding.encode(validProtocol ? url : context.Url.origin + url);
        //throw new Error('');
        if ($RConfig.replit) rewritten = rewritten.replace('https://', 'https:/')
        return rewritten.replace('http:', 'https:');
      } catch(e) {
        console.log(e)
        return url
      }
    },
    decode(url) {
      return url?$Rhodium.encoding.decode(url.replace($Rhodium.prefix, '')):undefined
    }
  }
})({...$RConfig,$Rhodium})

$Rhodium.Location = function(url) {
  $Rhodium.location.href = url.href
  $Rhodium.location.hostname = url.hostname
  $Rhodium.location.host = url.host
  $Rhodium.location.origin = url.origin
  $Rhodium.location.port = url.port
  $Rhodium.location.pathname = url.pathname
  $Rhodium.location.protocol = location.protocol
  $Rhodium.location.search = url.search
  $Rhodium.location.hash = url.hash
  $Rhodium.location.assign = (a) => window.location.assign(a)
  $Rhodium.location.replace = (a) => window.location.replace(a)
  $Rhodium.location.toString = () => $Rhodium.location.href.toString()
  $Rhodium.location.reload = (a) => location.reload(a?a:null)
  console.log($Rhodium.location)
}

$Rhodium.css = function(body) {
  function CSSRewriter(ctx) {
    return function CSS(data, context) {
      const cont = context;
      cont.Url = new URL(ctx.encoding.decode($RConfig.url.replace(ctx.prefix, '')))
      return data.replace(/url\("(.*?)"\)/gi, str => {var url = str.replace(/url\("(.*?)"\)/gi, '$1');return `url("${context.url.encode(url, cont)}")`;}).replace(/url\('(.*?)'\)/gi, str => {var url = str.replace(/url\('(.*?)'\)/gi, '$1');return `url('${context.url.encode(url, cont)}')`;}).replace(/url\((.*?)\)/gi, str => {var url = str.replace(/url\((.*?)\)/gi, '$1');if (url.startsWith(`"`) || url.startsWith(`'`)) return str;return `url("${context.url.encode(url, cont)}")`;}).replace(/@import (.*?)"(.*?)";/gi, str => {var url = str.replace(/@import (.*?)"(.*?)";/, '$2');return `@import "${context.url.encode(url, cont)}";`}).replace(/@import (.*?)'(.*?)';/gi, str => {var url = str.replace(/@import (.*?)'(.*?)';/, '$2');return `@import '${context.url.encode(url, cont)}';`})
    }
  }
  return CSSRewriter($Rhodium)(body, arguments[1]?arguments[1]:$Rhodium)
}

$Rhodium.html = function(body) {
  //if (typeof window == 'undefined') var { JSDOM } = require('jsdom');
  //else {var DomParser = new DOMParser();var { JSDOM: parseFromString} = DomParser;}

  function HTMLRewriter(ctx) {
    return function HTML(data, request, context) {

      const cont = ctx;
      cont.Url = new URL(ctx.encoding.decode(request.url.replace(ctx.prefix, '')))

      var HTML_REWRITE_CONFIG = [
        {
          tags: ['http-equiv'],
          action: ['replace'],
          new: 'No-U-Content-Security-Policy',
        },
        {
          tags: ['href', 'src', 'action'],
          action: ['rewrite'],
        },
        {
          tags: ['srcset'],
          action: ['srcset'],
        },
        {
          tags: ['integrity'],
          action: ['replace'],
          newtag: 'nointegrity',
        },
        {
          tags: ['nonce'],
          action: ['replace'],
          newtag: 'nononce'
        },
        {
          elements: ['style'],
          tags: ['style'],
          action: ['css']
        },
        {
          elements: ['script'],
          tags: ['onclick'],
          action: ['js']
        }
      ]

      var injectData = {
        prefix: ctx.prefix,
        url: ctx.encoding.decode(request.url.replace(ctx.prefix, '')),
        title: ctx.title,
        encode: ctx.encode,
        userAgent: ctx.userAgent,
      }

      //JSDOM.prototype.removeAttribute=function(attr) {}

      var parser = new DOMParser();

      var html = parser.parseFromString(data, 'text/html')//, document = html.window.document;

      HTML_REWRITE_CONFIG.forEach((_config) => {
        if (_config.action[0]=='css') {
          _config.elements.forEach((el) => {
            document.querySelectorAll(`${el}`).forEach(node => {
              if (node.textContent) node.textContent = $Rhodium.css(node.textContent||'', context);
            })
          })
          _config.tags.forEach((tag) => {
            document.querySelectorAll(`*[${tag}]`).forEach(node => {
              //if (node[tag]) node[tag] = $Rhodium.css(node[tag]||'', context);
            })
          })
        }
        if (_config.action[0]=='js') {
          _config.elements.forEach((el) => {
            document.querySelectorAll(`${el}`).forEach(node => {
              if (node.textContent) node.textContent = ctx.rewrite.JS(node.textContent);
            })
          })
          _config.tags.forEach((tag) => {
            document.querySelectorAll(`*[${tag}]`).forEach(node => {
              if (node[tag]) node[tag] = ctx.rewrite.JS(node[tag]);
            })
          })
        }
        if (_config.action[0]=='rewrite') {
          _config.tags.forEach((tag) => {
            document.querySelectorAll(`*[${tag}]`).forEach(node => {
              node.setAttribute('data-rhodium', node.getAttribute(tag))
              node.setAttribute(tag, ctx.url.encode(node.getAttribute(tag), cont))
            })
          })
        }
        if (_config.action[0]=='srcset') {
          _config.tags.forEach((tag) => {
            document.querySelectorAll(`*[${tag}]`).forEach(node => {
              node.setAttribute('data-rhodium', node.getAttribute(tag))
              node.setAttribute(tag, RewriteSrcset(node.getAttribute(tag)))
            })
          })
        }
        if (_config.action[0]=='replace') {
          _config.tags.forEach((tag) => {
            document.querySelectorAll(`*[${tag}]`).forEach(node => {
              if (_config.new) {
                node.setAttribute(tag, _config.new)
                node.removeAttribute(tag)
              }
              if (_config.newtag) {
                node.setAttribute(_config.newtag, node.getAttribute(tag))
                node.removeAttribute(tag)
              }
            })
          })
        }
      })

      return html
    }
  }
  HTMLRewriter($Rhodium)(body, $RConfig, $Rhodium)
}

function RewriteSrcset(sample) {
  return sample.split(',').map(e => {
    return(e.split(' ').map(a => {
      if (a.startsWith('http')||(a.startsWith('/')&&!a.startsWith(ctx.prefix))) {
        var url = ctx.url.encode(a, cont)
      }
      return a.replace(a, (url||a))
    }).join(' '))
  }).join(',')
}

$Rhodium.Element = function() {
  [
    'innerHTML',
    'outerHTML',
  ].forEach(prop => {
    try {
      const original = Object.getOwnPropertyDescriptor(window.Element.prototype, prop);
      console.log(original)
      Object.defineProperty(window.Element.prototype, prop, {
        get: original?new Proxy(original.get, {
          apply: (target, that, args) => {
            var body = Reflect.apply(target, that, args);
            return $Rhodium.html(body)
          },
        }):undefined,
        set: original?new Proxy(original.set, {
          apply(target, that, [ val ]) {
            return Reflect.apply(target, that, [ val ]);
          },
        }):undefined, 
      });
    } catch(e) {console.log(e)}
  });
  var element = window.Element
  element.prototype.setAttribute = new Proxy(element.prototype.setAttribute, {
    apply(target, thisArg, [ element_attribute, value ]) {

        // Customized "srcset" rewriting.
      if (element_attribute=='srcset') {
        value = RewriteSrcset(value)

        return Reflect.apply(target, thisArg, [ element_attribute, value ]);
      };

      if (['src', 'srcset', 'data', 'href', 'action'].indexOf(element_attribute.toLowerCase())>-1) value = $Rhodium.url.encode(value, {Url: new URL($RConfig.url)});
      //console.log(element_attribute)
      return Reflect.apply(target, thisArg, [ element_attribute, value ]);
    }
  });
  [
    {
      "elements": [window.HTMLScriptElement, window.HTMLIFrameElement, window.HTMLEmbedElement, window.HTMLAudioElement, window.HTMLInputElement, window.HTMLTrackElement, window.HTMLVideoElement],
      "tags": ['src'],
      "action": "url"
    },
    {
      "elements": [window.HTMLAnchorElement, window.HTMLLinkElement, window.HTMLAreaElement],
      "tags": ['href'],
      "action": "url"
    },
    {
      "elements": [window.HTMLIFrameElement],
      "tags": ['contentWindow'],
      "action": "window"
    }
  ].forEach(config => {
    config.elements.forEach(element => {
      if (element == window.HTMLScriptElement) {
        Object.defineProperty(element.prototype, 'integrity', {
          set(value) {
            return this.removeAttribute('integrity')
          },
          get() {
            return this.getAttribute('integrity');
          }
        });
        Object.defineProperty(element.prototype, 'nonce', {
          set(value) {
            return this.removeAttribute('nonce')
          },
          get() {
            return this.getAttribute('nonce');
          }
        });
      }
      config.tags.forEach(prop => {
        try {
          var original = Object.getOwnPropertyDescriptor(element.prototype, prop)
          Object.defineProperty(element.prototype, prop, {
            get: original?new Proxy(original.get, {
              apply(t, g, a) {
                var toSend = Reflect.get(t, g, a)
                switch (config.action) {
                  case'url':
                    toSend = $Rhodium.url.decode(toSend)
                    break;
                  case'window':
                    break;
                }
                console.log(toSend)
                return toSend
              }
            }):null,
            set: original?new Proxy(original.set, {
              apply(t, g, a) {
                switch (config.action) {
                  case'url':
                    a[0] = $Rhodium.url.encode(a[0], {Url: new URL($RConfig.url)})
                    break;
                }
                var toSend = Reflect.set(t, g, a)
                return toSend
              }
            }):null
          })
        } catch {
          Object.defineProperty(element.prototype, prop, {
            set(val) {
              return this.setAttribute(prop, val)
            },
            get() {
              return this.getAttribute(prop)
            }
          })
        }
      })
    })
  })
}

$Rhodium.Location(new URL($RConfig.url))
$Rhodium.Element()

window.Worker = new Proxy(window.Worker, {
  construct(t, a) {
    a[0] = $Rhodium.url.encode(a[0], {Url:new URL($RConfig.url)})
    console.log(a[0])
    return Reflect.construct(t,a)
  }
})

window.History.prototype.pushState = new Proxy(window.History.prototype.pushState, {
  apply(t, g, a) {
    return Reflect.apply(t, g, a)
  }
})

window.XMLHttpRequest.prototype.open = new Proxy(window.XMLHttpRequest.prototype.open, {
  apply(t, g, a) {
    a[1] = $Rhodium.url.encode(a[1], {Url: new URL($RConfig.url)})
    return Reflect.apply(t, g, a)
  }
})

window.fetch = new Proxy(window.fetch, {
  apply(t, g, a) {
    if (a[0]) a[0] = $Rhodium.url.encode(a[0], {Url: new URL($RConfig.url)})
    return Reflect.apply(t, g, a)
  }
})

document.$Rhodium=$Rhodium