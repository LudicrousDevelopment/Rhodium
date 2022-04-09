const http = require('http');
const https = require('https');
const WebSocketServer = require('ws').Server

const valid_chars = "!#$%&'*+-.0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ^_`abcdefghijklmnopqrstuvwxyz|~";
const reserved_chars = "%";

function valid_protocol(protocol){
	protocol = protocol.toString();

	for(let i = 0; i < protocol.length; i++){
		const char = protocol[i];

		if(!valid_chars.includes(char)){
			return false;
		}
	}
	
	return true;
}

function encode_protocol(protocol){
	protocol = protocol.toString();

	let result = '';
	
	for(let i = 0; i < protocol.length; i++){
		const char = protocol[i];

		if(valid_chars.includes(char) && !reserved_chars.includes(char)){
			result += char;
		}else{
			const code = char.charCodeAt();
			result += '%' + code.toString(16).padStart(2, 0);
		}
	}

	return result;
}

function decode_protocol(protocol){
	if(typeof protocol != 'string')throw new TypeError('protocol must be a string');

	let result = '';
	
	for(let i = 0; i < protocol.length; i++){
		const char = protocol[i];
		
		if(char == '%'){
			const code = parseInt(protocol.slice(i + 1, i + 3), 16);
			const decoded = String.fromCharCode(code);
			
			result += decoded;
			i += 2;
		}else{
			result += char;
		}
	}

	return result;
}

function WebSocket(ctx) {
    const wss = new WebSocketServer({server: ctx.server})
    wss.on('connection', (socket, req) => {
        try {
            let origin = ""
            let url = ""
            if (ctx.uv&&ctx.uv[0]==true&&req.url.startsWith('/bare/v1')) {
                const protocol = JSON.parse(decode_protocol(req.headers['sec-websocket-protocol'].split(', ')[1]))
                origin = protocol.headers.Origin
                url = protocol.remote.protocol+'//'+protocol.remote.host+protocol.remote.path
            } else if (ctx.corrosion[0]==true && req.url.startsWith(ctx.corrosion[1].prefix)) {
                origin = req.url.split('?origin=')[1]
                url = ctx.corrosion[1].url.unwrap(req.url).replace('http', 'ws')
            } else {
                origin = ctx.encoding.decode(req.url.replace(ctx.prefix, '').split('?ws=')[1]).split('origin=')[1]
                url = ctx.encoding.decode(req.url.replace(ctx.prefix, '').split('?ws=')[1]).split('origin=')[0].replace(/(\?|&)$/g, '')
            }
            console.log(origin, url) // debug
            const websocket = new (require('ws'))(url, { origin: origin })
            websocket.on('error', () => socket.terminate())
            socket.on('error', () => websocket.terminate())
            websocket.on('close', () => socket.close())
            socket.on('close', () => websocket.close())
            websocket.on('open', () => {
                socket.on('message', message => {
                    websocket.send(message.toString())
                    console.log("remote socket message:", message.toString()) // debug
                })
                websocket.on('message', message => {
                    message = message.toString().includes('�') ? message : message.toString()
                    socket.send(message)
                    console.log("local socket message:", message) // debug
                })
            })
        } catch {
            socket.close()
        }
    })
    /*
    const options = {
      host: url.hostname,
      port: url.port,
      path: url.pathname,
      method: clientRequest.method,
      headers: clientRequest.headers,
      origin: ctx.encoding.decode(clientRequest.url.replace(ctx.prefix, '')).split('?ws=')[1].split('?origin=')[1],
    };
    var request = https.request(options);
    request.on("upgrade", function(remoteResponse, remoteSocket, remoteHead) {

      let key = true;
      let headers = "HTTP/1.1 101 Web Socket Protocol Handshake\r\n";
      remoteResponse.rawHeaders.forEach(function (val) {
        headers += val + (key ? ": " : "\r\n");
        key = !key;
      });
      headers += "\r\n";

      clientSocket.write(headers);

      if (remoteHead && remoteHead.length) {
        clientSocket.write(remoteHead);
      }
      clientSocket.pipe(remoteSocket);
      remoteSocket.pipe(clientSocket);

      clientSocket.on("error", function (err) {
        remoteSocket.end();
        clientSocket.end();
      });

      remoteSocket.on("error", function (err) {
        clientSocket.end();
        remoteSocket.end();
      });
    })
    request.end();*/
}

module.exports = WebSocket