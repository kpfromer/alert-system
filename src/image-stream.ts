import WebSocket from 'ws';
import http from 'http';
import fs from 'fs';
import path from 'path';

const createSocket = (websocketPort: number) => {
  const socketServer = new WebSocket.Server({ port: websocketPort, perMessageDeflate: false });
  let connectionCount = 0;

  socketServer.on('connection', (socket, upgradeReq) => {
    connectionCount++;
    console.log(`New WebSocket Connection: \n${upgradeReq.socket.remoteAddress}\n${upgradeReq.headers['user-agent']}\n(${connectionCount} total users.)`);
  
    socket.on('close', (code, message) => {
      connectionCount--;
      console.log(`Disconnected WebSocket reason "${message}" (${connectionCount} total users)`);
    });
  });

  const broadcast = data => {
    socketServer.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  }

  return { broadcast };
}

const { broadcast } = createSocket(8082);
const secret = 'secret';
const saveToFile = false;

const streamServer = http.createServer((req, res) => {
  if (typeof req.url !== 'string') {
    throw new TypeError(`A secret is needed.`);
  }
  const params = req.url.substr(1).split('/');

  let recording: fs.WriteStream | null = null;

  if (saveToFile) {
    const savePath = path.join('recordings', `${Date.now()}.ts`);
    recording = fs.createWriteStream(savePath);
  }
  
  if (params[0] !== secret) {
    console.log(`Failed Stream Connection: ${req.socket.remoteAddress}:${req.socket.remotePort} - wrong secret.`);
    res.end();
  }

  res.connection.setTimeout(0);

  console.log(`Stream Connected ${req.socket.remoteAddress}:${req.socket.remotePort}`);

  req.on('data', data => {
    broadcast(data);
    if (recording) {
      recording.write(data);
    }
  })

  req.on('end', () => {
    console.log('close');
    if (recording) {
      recording.close();
    }
  })
});

streamServer.listen(8081);

console.log('Listening for incomming MPEG-TS Stream on http://127.0.0.1:'+8001+'/<secret>');
console.log('Awaiting WebSocket connections on ws://127.0.0.1:'+8002+'/');