const { app, BrowserWindow } = require('electron')
const SerialCommunication = require('./serial_communication')
const { ReadlineParser } = require('@serialport/parser-readline')

// コマンドライン引数からシリアルポートのパスを取得
const portPath = process.argv[2];
console.log('portPath:', portPath);

// Webサーバーを起動
const express = require('express');
const path = require('path');
const localServer = express();
const PORT = 3000;

// FlutterビルドのWebアプリケーションをホスティング
localServer.use(express.static(path.join(__dirname, '../roastwave_flutter/build/web')));

localServer.listen(PORT, '127.0.0.1', () => {
  console.log(`App is running on http://localhost:${PORT}`);
});

// WebSocketサーバーを起動
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });
let activePort; // シリアルポートを保持する変数

wss.on('connection', function connection(ws) {
  console.log('A client connected');
  
  // クライアントからのメッセージ受信時に実行されるイベント
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);

    // クライアントからのメッセージが「get_serial_port」の場合
    // シリアルポートのリストを取得してクライアントに送信
    if (message == 'get_serial_port') {
      console.log('event: get_serial_port');
      SerialCommunication.getSerialPortList().then(
        ports => {
          console.log('ports:', ports);
          ws.send(JSON.stringify({type: 'serial_port_list', data: ports}));
        },
        err => {
          console.error('Error listing ports', err);
        }
      );
    }

    // クライアントからのメッセージが「open_serial_port」の場合
    // シリアルポートを開く
    if (message == 'open_serial_port') {
      console.log('event: open_serial_port');
      activePort = SerialCommunication.openSerialPort();
      const parser = SerialCommunication.getSerialPortParser(activePort);
      ws.send(JSON.stringify({type: 'serial_port_opened'}));
      parser.on('data', (data) => {
        console.log('Received:', data.toString());
        // シリアルポートからのデータをWebSocketを通じてクライアントに送信
        // 送信する際のフォーマットはJSON形式
        ws.send(JSON.stringify({type: 'serial_data', data: data.toString()}));
      });
      activePort.on('error', function(err) {
        console.log('Error: ', err.message)
      });
    }

    // クライアントからのメッセージが「close_serial_port」の場合
    // シリアルポートを閉じる
    if (message == 'close_serial_port') {
      console.log('event: close_serial_port');
      SerialCommunication.closeSerialPort(activePort);
      ws.send(JSON.stringify({type: 'serial_port_closed'}));
    }
  });

  // シリアルポートからのデータをWebSocketを通じてクライアントに送信
  // ここでは例として「Hello Client」メッセージを送信しています
  ws.send('Hello Client');
  // let count = 0;
  // setInterval(() => {
  //   ws.send(count++);
  // }, 1000);
});

//SerialCommunicationを一通り動作確認する
// SerialCommunication.getSerialPortList().then(
//   ports => {
//     ports.forEach(port => {
//       console.log(port.path);
//       if (port.path === portPath) {
//         const port = SerialCommunication.openSerialPort();
//         const parser = SerialCommunication.getSerialPortParser(port);
//         parser.on('data', (data) => {
//           console.log('Received:', data.toString());
//         });
//         port.on('error', function(err) {
//           console.log('Error: ', err.message)
//         });
//       }
//     });
//   },
//   err => {
//     console.error('Error listing ports', err);
//   }
// );



function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })

  // win.loadFile('../roastwave_flutter/build/web/index.html') // ここにFlutterビルドのWebアプリケーションのパスを指定
  win.loadURL(`http://localhost:${PORT}`);

  // win.loadFile('/Users/mn/development/RoastWave/roastwave_flutter/build/web/index.html');
  win.webContents.openDevTools()


}

app.whenReady().then(createWindow)
