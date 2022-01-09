class Rhodium {
  constructor(ctx) {
    Object.entries(ctx).forEach(([e,v]) => {
      this[e] = v
    })
  }
  resetLocation() {
    console.log('reset')
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
          if (a[2]) a[2] = URLParser.encode(a[2], $Rhodium)
          return Reflect.apply(t, g, a)
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
        a[0] = location.protocol.replace('http', 'ws')+'//'+location.hostname+$Rhodium.prefix+'?ws='+a[0]+origin
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
}

$Rhodium = new Rhodium(JSON.parse(document.currentScript.getAttribute('data-config')))

const Encoding = require('../encode')
$Rhodium.encoding = Encoding($Rhodium)
const URLParser = require('../url')($Rhodium)
const Rewrite = require('../rewrite/bundle')

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