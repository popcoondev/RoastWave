const { app, BrowserWindow } = require('electron')
const { SerialCommunication } = require('./serial_communication')

// コマンドライン引数からシリアルポートのパスを取得
const portPath = process.argv[2];
console.log('portPath:', portPath);

// WebSocketサーバーを起動
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', function connection(ws) {
  console.log('A client connected');
  
  // クライアントからのメッセージ受信時に実行されるイベント
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);

    // クライアントからのメッセージが「get_serial_port」の場合
    // シリアルポートのリストを取得してクライアントに送信
    if (message === 'get_serial_port') {
      SerialCommunication.getSerialPortList().then(
        ports => {
          ports.forEach(port => {
            console.log(port.path);
            // シリアルポートリストをクライアントに送信
            // 送信する際のフォーマットはJSON形式
            ws.send(JSON.stringify({type: 'serial_port', data: port.path}));
          });
        },
        err => {
          console.error('Error listing ports', err);
        }
      );
    }

    // クライアントからのメッセージが「open_serial_port」の場合
    // シリアルポートを開く
    if (message === 'open_serial_port') {
      const port = SerialCommunication.openSerialPort();
      const parser = SerialCommunication.getSerialPortParser(port);
      parser.on('data', (data) => {
        console.log('Received:', data.toString());
        // シリアルポートからのデータをWebSocketを通じてクライアントに送信
        // 送信する際のフォーマットはJSON形式
        ws.send(JSON.stringify({type: 'serial_data', data: data.toString()}));
      });
      port.on('error', function(err) {
        console.log('Error: ', err.message)
      });
    }

  });

  // シリアルポートからのデータをWebSocketを通じてクライアントに送信
  // ここでは例として「Hello Client」メッセージを送信しています
  ws.send('Hello Client');
});


function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })

  win.loadFile('index.html') // ここにFlutterビルドのWebアプリケーションのパスを指定
}

app.whenReady().then(createWindow)
