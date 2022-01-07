function Header(ctx) {
  return {
    request(request, response) {
      delete response.headers['host']
      delete response.headers['accept-encoding']
      delete response.headers['cache-control']
      delete response.headers['upgrade-insecure-requests']
      return response.headers
    },
    response(request, response) {

    }
  }
}

module.exports = Header