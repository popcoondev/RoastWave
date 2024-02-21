// main.js から呼び出される関数を定義するファイル

// シリアル通信を行うためのファイル
const { SerialPort } = require('serialport')
const { ReadlineParser } = require('@serialport/parser-readline')

// シリアルポートのパスをコマンドライン引数から取得
// const portPath = process.argv[2];

// シリアルポートのリストを取得してmain.jsに返却する関数
function getSerialPortList() {
  return SerialPort.list();
}

// シリアルポートを開く関数
function openSerialPort(portPath) {
  return new SerialPort({path:portPath, baudRate: 115200});
}

// シリアルポートを閉じる関数
function closeSerialPort(port) {
  port.close();
}

// シリアルポートを開いて、データを受信できるparserを返却する関数
// この関数はmain.jsから呼び出される
function getSerialPortParser(port) {
  return port.pipe(new ReadlineParser({ delimiter: '\r\n' }));
}

module.exports = {
  getSerialPortList: getSerialPortList,
  openSerialPort: openSerialPort,
  getSerialPortParser: getSerialPortParser,
  closeSerialPort: closeSerialPort
}

// // シリアルポートを開く
// //   ls /dev/tty.*   でポート名を確認
// //   screen /dev/tty.usbmodem1101 115200 でシリアル通信を確認
// const port = new SerialPort({path:portPath,
//     baudRate: 115200,
//    });
 
//  // シリアルポートをスキャン
//  SerialPort.list().then(
//    ports => {
//      ports.forEach(port => {
//        console.log(port.path);
//      });
//    },
//    err => {
//      console.error('Error listing ports', err);
//    }
//  );
 
//  const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }))
//  parser.on('data', (data) => {
//        console.log('Received:', data.toString());
//  });
 
//  port.on('error', function(err) {
//    console.log('Error: ', err.message)
//  });
