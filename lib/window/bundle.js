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
        if (a[0]) {
          a[0] = URLParser.encode(a[0], $Rhodium)
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
      pushState: new Proxy(history.pushState, {
        apply(t, g, a) {
          if (a[2]) a[2] = URLParser.encode(a[2], $Rhodium)
          Reflect.apply(t, g, a)
          return $Rhodium.resetLocation();
        }
      }),
      replaceState: new Proxy(history.replaceState, {
        apply(t, g, a) {
          console.log(a[2])
          if (a[2]) a[2] = location.origin + URLParser.encode(a[2], $Rhodium)
          Reflect.apply(t, g, a)
          return $Rhodium.resetLocation();
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
        a[0] = location.protocol.replace('http', 'ws')+'//'+hostnm+$Rhodium.prefix+'?ws='+a[0]+origin
        return Reflect.construct(t, a)
      }
    })
  }
  XMLHttpRequest() {
    return new Proxy(window.XMLHttpRequest.prototype.open, {
      apply(t, g, a) {
        if (a[1]) a[1] = URLParser.encode(a[1], $Rhodium)
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
    var oSBeacon = window.navigator.sendBeacon
    return new Proxy(window.navigator, {
      get(o, obj) {
        if (obj = 'sendBeacon') {
          return function(url, data) {
            if (url) url = URLParser.encode(url, $Rhodium)
            return oSBeacon.apply(this, arguments);
          };
        }
        return navigator[obj]
      }
    })
  }
}

Object.defineProperty(document, 'domain', {
  get() {
    return $Rhodium.Url.hostname;
  },
  set(val) {
    return val;
  }
});

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

window.Navigator.prototype.sendBeacon = function(url, data) {
  if (url) url = new Base(ctx).url(url);
  return oSBeacon.apply(this, arguments);
};

$Rhodium = new Rhodium(JSON.parse(document.currentScript.getAttribute('data-config')))

const Encoding = require('../encode')
$Rhodium.encoding = Encoding($Rhodium)
const URLParser = require('../url')($Rhodium)
//const Rewrite = require('../rewrite/bundle')

$Rhodium.Url = new URL($Rhodium.url)

const Proxify = require('./element')($Rhodium, URLParser)

Proxify.elementHTML([ window.HTMLDivElement]);Proxify.elementAttribute([ window.HTMLAnchorElement, window.HTMLAreaElement, window.HTMLLinkElement], [ 'href']);Proxify.elementAttribute([ window.HTMLScriptElement, window.HTMLIFrameElement, window.HTMLEmbedElement, window.HTMLAudioElement, window.HTMLInputElement, window.HTMLTrackElement], [ 'src']);Proxify.elementAttribute([ window.HTMLImageElement, HTMLSourceElement], [ 'src', 'srcset']);Proxify.elementAttribute([ window.HTMLObjectElement], [ 'data']);Proxify.elementAttribute([ window.HTMLFormElement], [ 'action']); 

document.querySelectorAll = $Rhodium.querySelectorAll();
document.getElementsByTagName = $Rhodium.getElementsByTagName();

window.fetch = $Rhodium.fetch();
window.history.pushState = $Rhodium.History().pushState;
window.history.replaceState = $Rhodium.History().replaceState;
window.WebSocket = $Rhodium.WebSocket();
window.XMLHttpRequest.prototype.open = $Rhodium.XMLHttpRequest();
window.Worker = $Rhodium.Worker();
window.open = $Rhodium.Open();
window.rLocation = $Rhodium.Location();
document.rLocation = rLocation;
window.postMessage = $Rhodium.PostMessage();
window.navigator = $Rhodium.Navigator();
window.eval = $Rhodium.Eval();

class Function {
  constructor() {
    console.log(
      'no'
    )
  }
};

document.currentScript.remove()