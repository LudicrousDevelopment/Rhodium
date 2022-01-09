var Rhodium$Config = document.currentScript.getAttribute('data-config')

class $location {
  get [Symbol.toPrimitive]() {
    return () => this.href;
  };
};

// thx duce you are so epic!

class Window {
  constructor(ctx) {
    ctx.browser = {}
    var creators = {
      Location(url) {
        try {
          ctx.browser.location = new $location();
          ['href', 'host', 'hostname', 'search', 'hash', 'pathname', 'origin'].forEach((e) => ctx.browser.location[e] = new URL(url)[e])
          return ctx.browser.location
        } catch {

        }
      },
      History() {
        try {
          ctx.browser.history = {
            pushState: new Proxy(window.history.pushState, {
              apply(t, g, a) {
                console.log(a)
                return Reflect.apply(t, g, a)
              }
            }),
            replaceState: new Proxy(window.history.replaceState, {
              apply(t, g, a) {
                console.log(a)
                return Reflect.apply(t, g, a)
              }
            }),
          }
        } catch {
          
        }
      },
      Document(doc) {
        ctx.browser.document = {
          write: function() {
            return document.write.apply(this, arguments)
          }
        }
      }
    }
    ctx.browser.Location = creators.Location(Rhodium$Config.url)
    ctx.browser.document = document
    ctx.browser.History = creators.History()
    Object.entries(window).forEach(([e,a]) => {
      if (!ctx.browser[e]) ctx.browser[e] = a
    })
    return new Proxy(ctx.browser, {
      set(ob, name, value) {
        if (!value) {
          
          if (!_window[name] && window[name]) {_window[name] = window[name]; return window[name]}
          return _window[name]
        };
        window[name] = value
      }
    })
  }
}

var _window = new Window({});

//globalThis.Rhodium = Window