const { app, BrowserWindow, session } = require('electron')
const SerialCommunication = require('./serial_communication')
const { ReadlineParser } = require('@serialport/parser-readline')

// コマンドライン引数からシリアルポートのパスを取得
//const portPath = process.argv[2];
// const portPath = '/dev/tty.usbmodem1101';
// console.log('portPath:', portPath);

// Webサーバーを起動
const express = require('express');
const path = require('path');
// const localServer = express();
const PORT = 3001;

// FlutterビルドのWebアプリケーションをホスティング
// localServer.use(express.static(path.join(__dirname, '../roastwave_flutter/build/web')));

// localServer.listen(PORT, '127.0.0.1', () => {
//   console.log(`App is running on http://localhost:${PORT}`);
// });

// WebSocketサーバーを起動
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });
let activePort; // シリアルポートを保持する変数
const powerSaveBlocker = require('electron').powerSaveBlocker;
let powerSaveBlockerId;

wss.on('connection', function connection(ws) {
  console.log('A client connected');
  sendSerialPortListToClient(ws);
  

  // クライアントからのメッセージ受信時に実行されるイベント
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
    const parsedMessage = parseWebSocketMessage(message);
    console.log('parsedMessage:', parsedMessage);
    // クライアントからのメッセージが「get_serial_port」の場合
    // シリアルポートのリストを取得してクライアントに送信
    
    if (parsedMessage.type === 'get_serial_port') {
      console.log('event: get_serial_port');
      sendSerialPortListToClient(ws);
    }

    // クライアントからのメッセージが「open_serial_port」の場合
    // シリアルポートを開く
    if (parsedMessage.type === 'open_serial_port') {
      console.log('event: open_serial_port port:', parsedMessage.port);
      
      activePort = SerialCommunication.openSerialPort(parsedMessage.port);
      const parser = SerialCommunication.getSerialPortParser(activePort);
      ws.send(formatWebSocketMessage('serial_port_opened'));
      parser.on('data', (data) => {
        console.log('Received:', data.toString());
        // シリアルポートからのデータをWebSocketを通じてクライアントに送信
        // 送信する際のフォーマットはJSON形式
        ws.send(formatWebSocketMessage('serial_port_data', data.toString()));
        // ws.send(sendDataToArtisan(data.toString(), 0));
      });
      activePort.on('error', function(err) {
        console.log('Error: ', err.message);
      });
    }

    // クライアントからのメッセージが「close_serial_port」の場合
    // シリアルポートを閉じる
    if (parsedMessage.type === 'close_serial_port') {
      console.log('event: close_serial_port');
      SerialCommunication.closeSerialPort(activePort);
      ws.send(formatWebSocketMessage('serial_port_closed'));
    }

    if(parsedMessage.type === 'start_roast') {
      console.log('event: start_roast');
      if(powerSaveBlockerId === undefined) {
        powerSaveBlockerId = powerSaveBlocker.start('prevent-display-sleep');
        console.log('powerSaveBlockerId:', powerSaveBlockerId);
      }
    }

    if(parsedMessage.type === 'stop_roast') {
      console.log('event: stop_roast');
      if(powerSaveBlockerId !== undefined) {
        powerSaveBlocker.stop(powerSaveBlockerId);
        powerSaveBlockerId = undefined;
      }
    }
  });

  ws.on('close', function close() {
    console.log('A client disconnected');
    // クライアントが切断された場合、シリアルポートを閉じる
    SerialCommunication.closeSerialPort(activePort);

    if(powerSaveBlocker !== undefined) {
      powerSaveBlocker.stop(powerSaveBlockerId);
      powerSaveBlocker = undefined;
    }
    
  });


  // シリアルポートからのデータをWebSocketを通じてクライアントに送信
  // ここでは例として「Hello Client」メッセージを送信しています
  ws.send(formatWebSocketMessage('test_message', 'Hello Client'));
  // let count = 0;
  // setInterval(() => {
  //   ws.send(count++);
  // }, 1000);
});

function sendSerialPortListToClient(ws) {
  SerialCommunication.getSerialPortList().then(
    ports => {
      console.log('ports:', ports);
      ws.send(formatWebSocketMessage('serial_port_list', ports));
    },
    err => {
      console.error('Error listing ports', err);
    }
  );
}


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

// websocketに送信する際のフォーマットに変換する関数
function formatWebSocketMessage(type, data) {
  return JSON.stringify({type: type, data: data});
}

// websocketで受信したメッセージをJSON形式に変換する関数
function parseWebSocketMessage(message) {
  return JSON.parse(message);
}


function createWindow () {
  async () => {
    const pathToVueDevTools = '/Users/mn/.nodebrew/current/bin/vue-devtools';
    try {
      // defaultSessionを使用して、Vue Devtools拡張機能をロード
      await session.defaultSession.loadExtension(pathToVueDevTools, {
        // 拡張機能を開発モードでロードする場合は、以下のオプションを有効にします
        allowFileAccess: true
      });
      console.log('Vue Devtools has been loaded successfully!');
    } catch (err) {
      console.error('Failed to load Vue Devtools:', err);
    }
  }

  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,  // コンテキスト分離を有効にする
      preload: path.join(__dirname, 'preload.js')  // preloadスクリプトを指定する
    }
  });

  // win.loadFile('../roastwave_flutter/build/web/index.html') // ここにFlutterビルドのWebアプリケーションのパスを指定
  win.loadURL(`http://localhost:${PORT}`);

  // win.loadFile('/Users/mn/development/RoastWave/roastwave_flutter/build/web/index.html');
  win.webContents.openDevTools();


}

app.whenReady().then(createWindow);


class TimestampIDGenerator {
  constructor() {
    this.baseTimestamp = new Date().getTime(); // 現在のタイムスタンプを基準値として設定
    this.index = 0; // インデックスの初期値
  }

  getNextID() {
    const id = this.baseTimestamp + this.index; // タイムスタンプにインデックスを加算
    this.index += 1; // 次のIDのためにインデックスを増やす
    return id;
  }
}

const idGenerator = new TimestampIDGenerator();
function sendDataToArtisan(btTempeture, etTemperature) {
  //{ "id": nnnn, "data": { "BT": xx.x, "ET": yy.y } }
  const id = idGenerator.getNextID();
  const data = {BT: btTempeture, ET: etTemperature};
  return JSON.stringify({id: id, data: data});
}

// main.jsとserial_communication.jsの実装からWebsocketManager.jsで実装するためのメッセージ仕様を抽出
// このメッセージ仕様を元に、WebSocketManager.jsを実装する
// このメッセージ仕様は、WebSocketを通じて送受信するメッセージのフォーマットを定義する
// このメッセージ仕様は、JSON形式で送受信される
// このメッセージ仕様は、typeとdataの2つのフィールドを持つ
// typeフィールドはメッセージの種類を表し、dataフィールドはメッセージの内容を表す
// このメッセージ仕様は、typeフィールドの値によって、dataフィールドの内容が変わる
// このメッセージ仕様は、typeフィールドの値によって、メッセージの処理が変わる
// このメッセージ仕様は、typeフィールドの値によって、クライアントとサーバーの通信が行われる
// typeの種別は以下の通り
// get_serial_port: シリアルポートのリストを取得する
// serial_port_list: シリアルポートのリストをクライアントに送信する
// open_serial_port: シリアルポートを開く
// serial_port_opened: シリアルポートが開かれたことをクライアントに通知する
// close_serial_port: シリアルポートを閉じる
// serial_port_closed: シリアルポートが閉じられたことをクライアントに通知する
// serial_port_data: シリアルポートからのデータをクライアントに送信する
// test_message: テストメッセージをクライアントに送信する
// このメッセージ仕様は、get_serial_portの場合、dataフィールドには何も含まれない
// このメッセージ仕様は、serial_port_listの場合、dataフィールドにはシリアルポートのリストが含まれる
// dataフィールドの内容は、シリアルポートのリストを表す
// シリアルポートのリストは、シリアルポートのパスを含む
// このメッセージ仕様は、open_serial_portの場合、dataフィールドにはシリアルポートのパスが含まれる
// このメッセージ仕様は、serial_port_openedの場合、dataフィールドには何も含まれない
// このメッセージ仕様は、close_serial_portの場合、dataフィールドには何も含まれない
// このメッセージ仕様は、serial_port_closedの場合、dataフィールドには何も含まれない
// このメッセージ仕様は、serial_port_dataの場合、dataフィールドにはシリアルポートからのデータが含まれる
// dataフィールドの内容は、シリアルポートからの温度データを表す
// このメッセージ仕様は、test_messageの場合、dataフィールドにはテストメッセージが含まれる
// このメッセージ仕様は、WebSocketManager.jsで利用される
