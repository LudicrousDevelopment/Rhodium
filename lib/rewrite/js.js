function JSRewriter(ctx) {
  return function JS(data) {
    var ndata = data.replace(/(window|document|this|\s|\+|\(|;|\[|,)+\.*location\.+/gm, (str, p1) => {
      return str.replace(/location/g, 'rLocation')
    })
    ndata = ndata.replace(/(window|document|this)\[['"`]*location['"`]*\]/gm, (str, p1) => {
      return str.replace(/location/g, 'rLocation')
    })
    ndata = ndata.replace(/(window|document)*\.*location[ ]*=[ ]*/gm, (str) => {
      return str.replace(/location/g, 'RLocation')
    });
    return ndata
  }
}

module.exports = JSRewriter