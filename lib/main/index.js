class Rhodium {
  constructor(ctx) {
    Object.entries(ctx).forEach(([e,v]) => {
      this[e] = v
    })
  }
  resetLocation() {
    window.rLocation = $Rhodium.Location()
    document.rLocation = window.rLocation
  }
  Location() {
    return new Proxy({}, {
      set(og, ob, val) {
        if (ob=='toString'||ob=='assign'||ob=='replace'||ob=='reload'||ob=='hash'||ob=='search' || ob=='protocol') return true;
        return location[ob] = URLParser.encode($Rhodium.Url.href.replace($Rhodium.Url[ob], val), $Rhodium);
      },
      get(og, ob) {
        if (ob=='toString'||ob=='assign'||ob=='replace'||ob=='reload'||ob=='hash'||ob=='search'||ob=='protocol') return {
          toString: () => $Rhodium.Url.href,
          assign: (a) => location.assign(URLParser.encode(a, $Rhodium)),
          replace: (a) => location.replace(URLParser.encode(a, $Rhodium)),
          reload: (a) => location.reload(a?a:null),
          hash: location.hash,
          search: location.search,
          protocol: location.protocol,
        }[ob]; else return $Rhodium.Url[ob];
      }
    });
  }
  fetch() {
    return new Proxy(window.fetch, {
      apply(t, g, a) {
        if (typeof a[0] !== 'object') {
          a[0] = URLParser.encode(a[0], $Rhodium)
          if ($Rhodium.replit) a[0] = a[0].replace('https://', 'https:/')
        }
        return Reflect.apply(t, g, a)
      }
    })
  }
  querySelectorAll() {
    return new Proxy(document.querySelectorAll, {
      apply(t, g, a) {
        if (a[0]=='script') return [...Reflect.apply(t, g, a)].splice(0, 1);
        return Reflect.apply(t, g, a)
      }
    })
  }
  getElementsByTagName() {
    return new Proxy(document.getElementsByTagName, {
      apply(t, g, a) {
        if (a[0]=='script') {
          var apply = Reflect.apply(t, g, a);
          [...apply].splice(0, 1);
          console.log(apply)
          return apply;
        }
        return Reflect.apply(t, g, a);
      }
    })
  };
  History() {
    return {
      pushState: new Proxy(window.History.prototype.pushState, {
        apply(t, g, a) {
          if ($Rhodium.Url.origin == 'https://discord.com' && a[2] == '/app') {
              a[2] = URLParser.encode(a[2], $Rhodium)
              Reflect.apply(t, g, a);
              $Rhodium.resetLocation();
              return window.location.reload();
          }
          if (a[2]) a[2] = URLParser.encode(a[2], $Rhodium)
          var a = Reflect.apply(t, g, a)
          $Rhodium.resetLocation();
          return a
        }
      }),
      replaceState: new Proxy(window.History.prototype.replaceState, {
        apply(t, g, a) {
          console.log(a)
          if (a[2]) a[2] = URLParser.encode(a[2], $Rhodium)
          var a = Reflect.apply(t, g, a)
          $Rhodium.resetLocation();
          return a
        }
      })
    } 
  }
  WebSocket() {
    return new Proxy(window.WebSocket, {
      construct(t, a) {
        if (a[0].includes('?')) {
          var origin = '&origin='+$Rhodium.Url.origin
        } else var origin = '?origin='+$Rhodium.Url.origin
        var hostnm = location.port ? location.hostname+':'+location.port : location.hostname
        a[0] = a[0].replace(location.host, rLocation.host)
        if (!a[0].startsWith('wss:')||!a[0].startsWith('ws:')) {
          //a[0] = location.protocol.replace('http', 'ws')+'//'+window.rLocation.hostname+(a[0].startsWith('/')?a[0]:'/'+a[0])
        }
        a[0] = location.protocol.replace('http', 'ws')+'//'+hostnm+$Rhodium.prefix+'?ws='+a[0]+origin
        return Reflect.construct(t, a)
      }
    })
  }
  XMLHttpRequest() {
    return new Proxy(window.XMLHttpRequest.prototype.open, {
      apply(t, g, a) {
        if (a[1]) a[1] = URLParser.encode(a[1], $Rhodium)
        if ($Rhodium.replit) a[1] = a[1].replace('https://', 'https:/')
        return Reflect.apply(t, g, a)
      }
    })
  }
  Worker() {
    return new Proxy(window.Worker, {
      construct(t, a) {
        if (a[0]) a[0] = URLParser.encode(a[0], $Rhodium)
        return Reflect.construct(t, a);
      }
    })
  }
  Eval() {
    return new Proxy(window.eval, {
      apply(t, g, a) {
        return Reflect.apply(t, g, a)
      }
    })
  }
  Open() {
    return new Proxy(window.open, {
      apply(t, g, a) {
        if (a[0]) a[0] = URLParser.encode(a[0], $Rhodium)
        return Reflect.apply(t, g, a)
      }
    })
  }
  PostMessage() {
    return new Proxy(window.postMessage, {
      apply(t, g, a) {
        if (a[1]) a[1] = location.origin;
        return Reflect.apply(t, g, a)
      }
    })
  }
  Navigator() {
    var oSBeacon = window.Navigator.prototype.sendBeacon
    return new Proxy(window.Navigator.prototype, {
      get(o, obj) {
        if (obj == 'sendBeacon') {
          return function(url, data) {
            if (url) url = URLParser.encode(url, $Rhodium)
            return oSBeacon.apply(this, arguments);
          };
        }
        if (obj=='userAgent') {
          return $Rhodium.userAgent || navigator[obj]
        }
        alert(obj)
        return navigator[obj]
      }
    })
  }
  ServiceWorkerRegister() {
    var oreg = window.navigator.serviceWorker.register
    return function() {
      arguments[0] = URLParser.encode(arguments[0])
      console.log(arguments[0])
      return oreg.apply(this, arguments)
    }
  }
  LinkRewrite() {
    document.querySelectorAll('a').forEach(node => {
      if (!node.getAttribute('data-rhodium')) {
        if (node.href) node.setAttribute('href', URLParser.encode(node.href, $Rhodium))
        node.setAttribute('data-rhodium', true)
      }
    })
  }
}

const $Rhodium = new Rhodium(JSON.parse(document.currentScript.getAttribute('data-config')))

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

Object.defineProperty(document, 'domain', {
  get() {
    return $Rhodium.Url.hostname;
  },
  set(val) {
    return val;
  }
});

const uagent = navigator.userAgent

Object.defineProperty(window.navigator, 'userAgent', {
  get() {
    return $Rhodium.userAgent || uagent
  }, 
  set(val) {
    return val
  }
})

var oCookie = document.cookie

Object.defineProperty(document, 'cookie', {
  get() {
    var cookie = Object.getOwnPropertyDescriptor(window.Document.prototype, 'cookie').get.call(this),
      new_cookie = [],
      cookie_array = cookie.split('; ');
    cookie_array.forEach(cookie => {
      const cookie_name = cookie.split('=').splice(0, 1).join(),
        cookie_value = cookie.split('=').splice(1).join();
      if ($Rhodium.Url.hostname.includes(cookie_name.split('@').splice(1).join())) new_cookie.push(cookie_name.split('@').splice(0, 1).join() + '=' + cookie_value);
    });
    return new_cookie.join('; ');;
  },
  set(val) {
    Object.getOwnPropertyDescriptor(Document.prototype, 'cookie').set.call(this, val);
  }
})

Object.defineProperty(window, "PLocation", {
  set: function(newValue){
    if (!newValue) return;
    rLocation.href = (newValue)
    resetLocation();
  },
  get: function(){
    return rLocation.href;
  }
});

if ($Rhodium.title) {
  var oTitle = Object.getOwnPropertyDescriptor(Document.prototype, 'title');
  document.title = $Rhodium.title
  Object.defineProperty(document, 'title', {
    set(value) {
      oTitle = $Rhodium.title
      return value
    },
    get() {
      return $Rhodium.title
    }
  })
}

window.Navigator.prototype.sendBeacon = $Rhodium.Navigator().sendBeacon
//window.navigator.serviceWorker.register = $Rhodium.ServiceWorkerRegister();
//window.navigator.userAgent = $Rhodium.Navigator().userAgent

const Encoding = (ctx) => {
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
}

function xor() {
  return {
    encode(str) {
      return encodeURIComponent(str.toString().split('').map((char, ind) => ind % 2 ? String.fromCharCode(char.charCodeAt() ^ 2) : char).join(''));
    },
    decode(str) {
      return decodeURIComponent(str).split('').map((char, ind) => ind % 2 ? String.fromCharCode(char.charCodeAt() ^ 2) : char).join('');
    }
  }
}

$Rhodium.encoding = Encoding($Rhodium)
const URLParser = (function URL(ctx, curl) {
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
        const rewritten = ctx.prefix + ctx.encoding.encode(validProtocol ? url : context.Url.origin + url);
        //throw new Error('');
        return rewritten.replace('http:', 'https:');
      } catch {
        console.log('breoken')
        return url
      }
    },
    decode(url) {
      return ctx.encoding.decode(url.replace(location.origin+ctx.prefix, ''))
    }
  }
})($Rhodium)
//const Rewrite = require('../rewrite/bundle')

if (document.querySelector('link[rel=icon]')||document.querySelector('link[rel="shortcut icon"]')) {
  var FavLinks = [...document.querySelectorAll('link[rel=icon]'), document.querySelectorAll('link[rel="shortcut icon"]')];
  console.log(FavLinks)
}

$Rhodium.Url = new URL($Rhodium.url)

/*$Rhodium.parseHTML = (function(rhodium) {

})($Rhodium)*/

const Proxify = (function(rhodium, URLParser) {
  var proxify = {};
  proxify.elementHTML = element_array => {
    element_array.forEach(element => {
      Object.defineProperty(element.prototype, 'innerHTML', {
          set(value) {
            const elem = new DOMParser().parseFromString(Object.getOwnPropertyDescriptor(window.Element.prototype, "outerHTML").get.call(this), 'text/html').body.querySelectorAll('*')[0];
            Object.getOwnPropertyDescriptor(window.Element.prototype, "innerHTML").set.call(elem, value);
            elem.querySelectorAll("script[src], iframe[src], embed[src], audio[src], img[src], input[src], source[src], track[src], video[src]").forEach(node => node.setAttribute('src', node.getAttribute('src')));
            elem.querySelectorAll("object[data]").forEach(node => node.setAttribute('data', node.getAttribute('data')));
            elem.querySelectorAll("a[href], link[href], area[href").forEach(node => node.setAttribute('href', node.getAttribute('href')));
            return Object.getOwnPropertyDescriptor(window.Element.prototype, "innerHTML").set.call(this, elem.innerHTML);
        },
        get() {
          return Object.getOwnPropertyDescriptor(window.Element.prototype, "innerHTML").get.call(this);
        }
      });
      Object.defineProperty(element.prototype, 'outerHTML', {
        set(value) {
          const elem = new DOMParser().parseFromString(Object.getOwnPropertyDescriptor(window.Element.prototype, "outerHTML").get.call(this), 'text/html').body;
          Object.getOwnPropertyDescriptor(window.Element.prototype, "outerHTML").set.call(elem.querySelectorAll('*')[0], value);
          elem.querySelectorAll("script[src], iframe[src], embed[src], audio[src], img[src], input[src], source[src], track[src], video[src]").forEach(node => node.setAttribute('src', node.getAttribute('src')));
          elem.querySelectorAll("object[data]").forEach(node => node.setAttribute('data', node.getAttribute('data')));
          elem.querySelectorAll("a[href], link[href], area[href").forEach(node => node.setAttribute('href', node.getAttribute('href')));
          return Object.getOwnPropertyDescriptor(window.Element.prototype, "outerHTML").set.call(this, elem.innerHTML);
        },
        get() {
          return Object.getOwnPropertyDescriptor(window.Element.prototype, "outerHTML").get.call(this);
        }
      });
    });
  };
  [
    {
      elements: [ HTMLScriptElement, HTMLMediaElement, HTMLImageElement, HTMLAudioElement, HTMLVideoElement, HTMLInputElement, HTMLEmbedElement, HTMLIFrameElement, HTMLTrackElement, HTMLSourceElement],
      properties: ['src'],
      handler: 'url',
    },
    {
      elements: [ HTMLFormElement ],
      properties: ['action'],
      handler: 'url',
    },
    {
      elements: [ HTMLAnchorElement, HTMLAreaElement, HTMLLinkElement, HTMLBaseElement ],
      properties: ['href'],
      handler: 'url',
    },
    {
      elements: [ HTMLImageElement, HTMLSourceElement ],
      properties: ['srcset'],
      handler: 'srcset',
    },  
    {
      elements: [ HTMLScriptElement ],
      properties: ['integrity'],
      handler: 'delete',
    },
    {
      elements: [ HTMLIFrameElement ],
      properties: ['contentWindow'],
      handler: 'window',  
    },
  ].forEach(entry => {
    entry.elements.forEach(element => {
      if (!element) return;
      entry.properties.forEach(property => {
        if (!element.prototype.hasOwnProperty(property)) return;
        const descriptor = Object.getOwnPropertyDescriptor(element.prototype, property);
        Object.defineProperty(element.prototype, property, {
          get: descriptor.get ? new Proxy(descriptor.get, {
            apply: (target, that, args) => {
              let val = Reflect.apply(target, that, args);
              switch(entry.handler) {
                case 'url':
                  val = URLParser.decode(val, $Rhodium);
                  break;
                case 'srcset':
                  val = RewriteSrcset(val);
                  break;
                case 'delete':
                  val = that.getAttribute(`data-rhodium`);
                  break;
                case 'window':
                  try {
                    if (!val.$Rhodium)  {
                      Object.entries(new $Window()).forEach(([e,v])=>val[e]=v)
                    };
                  } catch(e) {};
              };
              return val;
            }, 
          }) : undefined,
          set: descriptor.set ? new Proxy(descriptor.set, {
            apply(target, that, [ val ]) {
              let newVal = val;
              switch(entry.handler) {
                case 'url':
                  newVal = URLParser.encode(newVal, $Rhodium);
                  break;
                case 'srcset':
                  val = RewriteSrcset(val);
                  break;
                case 'delete':  
                  that.setAttribute(property, newVal);
                  return newVal;
              };
              return Reflect.apply(target, that, [ newVal ]);
            },
          }) : undefined,
        });
      });
    });
  });
  proxify.elementAttribute = function() {}
  /*proxify.elementAttribute = (element_array, attribute_array) => {
    element_array.forEach(element => {
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
      element.prototype.setAttribute = new Proxy(element.prototype.setAttribute, {
        apply(target, thisArg, [element_attribute, value]) {
          attribute_array.forEach(array_attribute => {
            if (array_attribute == 'srcset' && element_attribute.toLowerCase() == array_attribute) {
              var arr = [];
              value.split(',').forEach(url => {
                url = url.trimStart().split(' ');
                url[0] = URLParser.encode(url[0] || '', $Rhodium);
                arr.push(url.join(' '));
              });
              return Reflect.apply(target, thisArg, [element_attribute, arr.join(', ')]);
            };
            if (array_attribute == 'http-equiv' && element_attribute.toLowerCase() == array_attribute) {
              value = 'No-U-Content-Security-Policy'; if (array_attribute=='href') {console.log(target)};
              return Reflect.apply(target, thisArg, [element_attribute, value])
            }
            if (element_attribute.toLowerCase() == array_attribute) value = URLParser.encode(value || '', rhodium);
          });
          return Reflect.apply(target, thisArg, [element_attribute, value]);
        }
      });
      attribute_array.forEach(attribute => {
        try {
          var val = Object.getOwnPropertyDescriptor(element.prototype, `${attribute}`)
          Object.defineProperty(element.prototype, attribute, {
            set(value) {
              return this.setAttribute(attribute, value);
            },
            get() {
              if (attribute=='contentWindow') {
                const a = window
                Object.entries(new $Window()).forEach(([e,v])=>a[e]=v)
                return a
              }
              console.log(val)
              return URLParser.decode(this.getAttribute(attribute)||'')
            }
          });
        } catch(e) {
          console.log(e)
        }
      });
    });
  };*/
  /*proxify.elementAttribute = (element_array, attribute_array) => {
    element_array.forEach(element => {
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
      element.prototype.setAttribute = new Proxy(element.prototype.setAttribute, {
        apply(target, thisArg, [element_attribute, value]) {
          attribute_array.forEach(array_attribute => {
            if (array_attribute == 'srcset' && element_attribute.toLowerCase() == array_attribute) {
              var arr = [];
              value.split(',').forEach(url => {
                url = url.trimStart().split(' ');
                url[0] = URLParser.encode(url[0] || '', $Rhodium);
                arr.push(url.join(' '));
              });
              return Reflect.apply(target, thisArg, [element_attribute, arr.join(', ')]);
            };
            if (array_attribute == 'http-equiv' && element_attribute.toLowerCase() == array_attribute) {
              value = 'No-U-Content-Security-Policy'; if (array_attribute=='href') {console.log(target)};
              return Reflect.apply(target, thisArg, [element_attribute, value])
            }
            if (element_attribute.toLowerCase() == array_attribute) value = URLParser.encode(value || '', rhodium);
          });
          return Reflect.apply(target, thisArg, [element_attribute, value]);
        }
      })
      element.prototype.getAttribute = new Proxy(element.prototype.getAttribute, {
        apply(t, g, a) {
          //save for later
          return Reflect.apply(t, g, a);
        }
      })
      attribute_array.forEach(property => {
        const descriptor = Object.getOwnPropertyDescriptor(element.prototype, property);
        Object.defineProperty(element.prototype, property, {
          get: descriptor ? new Proxy(descriptor.get, {
              apply: (target, that, args) => {
                  let val = Reflect.apply(target, that, args);
                  try {
                    
                    if (property=='contentWindow') { 
                      console.log(val);
                      val = new $Window($Rhodium)
                    } else (property=='src'||property=='href'||property=='action') {
                      //console.log(val.getAttribute(property))
                      val = this.getAttribute(args[0])
                    } 
                  } catch(e) {};
                  return val;
              }, 
          }) : undefined,
          set(value) {
            return this.setAttribute(property, value)
          }
        })
      })
    })
  }*/
  return proxify
})($Rhodium, URLParser)

Proxify.elementHTML([ window.HTMLDivElement ]);Proxify.elementAttribute([ window.HTMLAnchorElement, window.HTMLAreaElement, window.HTMLLinkElement], [ 'href']);Proxify.elementAttribute([ window.HTMLScriptElement, window.HTMLIFrameElement, window.HTMLEmbedElement, window.HTMLAudioElement, window.HTMLInputElement, window.HTMLTrackElement], [ 'src']);Proxify.elementAttribute([ window.HTMLImageElement, HTMLSourceElement], [ 'src', 'srcset']);Proxify.elementAttribute([ window.HTMLObjectElement], [ 'data']);Proxify.elementAttribute([ window.HTMLFormElement], [ 'action']); Proxify.elementAttribute([ window.HTMLIFrameElement ], [ 'contentWindow' ]);

setInterval($Rhodium.LinkRewrite, 100)

//document.querySelectorAll = $Rhodium.querySelectorAll();
//document.getElementsByTagName = $Rhodium.getElementsByTagName();

window.fetch = $Rhodium.fetch();
window.History.prototype.pushState = $Rhodium.History().pushState;
window.History.prototype.replaceState = $Rhodium.History().replaceState;
window.WebSocket = $Rhodium.WebSocket();
window.XMLHttpRequest.prototype.open = $Rhodium.XMLHttpRequest();
window.Worker = $Rhodium.Worker();
window.open = $Rhodium.Open();
window.rLocation = $Rhodium.Location();
document.rLocation = rLocation;
window.postMessage = $Rhodium.PostMessage();
//window.Navigator.prototype = $Rhodium.Navigator();
//window.eval = $Rhodium.Eval();

window.Function = new Proxy(window.Function, {
  construct(t, a) {
    return Reflect.construct(t, a)
  }
})

var _window = window

class $Window {
  constructor(window = {}) {
    window.$Rhodium = new _window.Rhodium(JSON.parse(_window.document.currentScript.getAttribute('data-config')))
    [
      'XMLHttpRequest',
      'History',
      'Navigator',
      'navigator',
      'history',
      'document',
      'Document',
      'Function'
    ].forEach(e => window[e] = _window[e])
    setInterval($Rhodium.LinkRewrite, 100)

    //document.querySelectorAll = $Rhodium.querySelectorAll();
    //document.getElementsByTagName = $Rhodium.getElementsByTagName();

    window.fetch = $Rhodium.fetch();
    window.History.prototype.pushState = $Rhodium.History().pushState;
    window.History.prototype.replaceState = $Rhodium.History().replaceState;
    window.WebSocket = $Rhodium.WebSocket();
    window.XMLHttpRequest.prototype.open = $Rhodium.XMLHttpRequest();
    window.Worker = $Rhodium.Worker();
    window.open = $Rhodium.Open();
    window.rLocation = $Rhodium.Location();
    document.rLocation = rLocation;
    window.postMessage = $Rhodium.PostMessage();
    //window.Navigator.prototype = $Rhodium.Navigator();
    //window.eval = $Rhodium.Eval();

    window.Function = new Proxy(window.Function, {
      construct(t, a) {
        return Reflect.construct(t, a)
      }
    })
  }
}

document.currentScript.remove()