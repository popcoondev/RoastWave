import 'package:web_socket_channel/io.dart';

// Websocketでelectronと通信するクラス
class RoastWaveWebSocket {
  WebSocketChannel _channel;
  StreamController _eventController;

  // WebSocketのチャンネルを作成
  // シングルトンでサーバーは一つしかないので、コンストラクタでチャンネルを作成
  RoastWaveWebSocket(String url) {
    _channel = WebSocketChannel.connect(Uri.parse(url));
    _eventController = StreamController.broadcast();
    _channel.stream.listen((data) {
      _eventController.add(data);
    });
  }

  // WebSocketのチャンネルを閉じる
  void close() {
    _channel.sink.close();
  }


  // シリアルポートのリストを取得する
  void getSerialPort() {
    _channel.sink.add('get_serial_port');
  }

  // シリアルポートを開く
  void openSerialPort(String portPath) {
    _channel.sink.add('open_serial_port');
  }

  // シリアルポートを閉じる
  void closeSerialPort() {
    _channel.sink.add('close_serial_port');
  }

  //このクラスの中でストリームを監視している
//   void _listen() {
//     //   final dataString = data as String;
//     //   final dataJson = json.decode(dataString);
//     //   onData(dataJson);
//     });
//   }

  Stream get events => _eventController.stream;

  void dispose() {
    _eventController.close();
  }

} 