function JSRewriter(ctx) {
  return function JS(data) {
    var ndata = data.replace(/(window|document|this|\s|\+|\(|;|\[|,)\.location\.+/gm, (str, p1) => {
      return str.replace(/location/g, '$Rhodium.location')
    })
    ndata = ndata.replace(/(window|document|this)\[['"`]*location['"`]*\]/gm, (str, p1) => {
      return str.replace(/location/g, '$Rhodium.location')
    })
    ndata = ndata.replace(/(window|document|this|\s|\+|\(|;|\[|,)\.*location[ ]*=[ ]*/gm, (str) => {
      return str.replace(/location/g, '$Rhodium.location')
    });
    return ndata
    /*return `
(function(window) {
${data.replace(/(var|const|let)\s([a-z0-9A-Z]+=[a-zA-Z0-9"'`{}()\-+:,_\.=\s|/&*^%$#!<>?\]\[]+)/g,(s,p)=>`$Rhodium.setWindow(atob('${new Buffer.from(p,'utf-8').toString('base64')}'))${s.endsWith(';')?'':';'}`)}
})($Rhodium._window)
`*/
  }
}

module.exports = JSRewriter