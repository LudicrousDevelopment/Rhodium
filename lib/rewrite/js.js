function JSRewriter(ctx) {
  return function JS(data) {
    /*data = data.replace(/(window|document|[a-zA-Z]*)*\.*location\.(href|host|hostname|pathname|origin)/gm, (str, p1) => {
      if (p1) {
        if (p1!=='window'&&p1!=='document') return str
      }
      return str.replace(/location/g, 'rLocation')
    }).replace(/(window|document|[a-zA-Z]*)\[['"`]*location['"`]*\]/gm, (str, p1) => {
      if (p1) {
        if (p1!=='window'&&p1!=='document') return str
      }
      return str.replace(/location/g, 'rLocation')
    }).replace(/(window|document)*\.*location\s*=\s*///gm, (str) => {
      //return str.replace(/location/g, 'RLocation')
    //});*/
    return data
  }
}

module.exports = JSRewriter