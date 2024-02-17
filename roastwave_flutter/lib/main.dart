import 'package:flutter/material.dart';
import 'package:web_socket_channel/io.dart';
import 'package:web_socket_channel/web_socket_channel.dart';

void main() {
  runApp(RoastWaveApp());
}

class RoastWaveApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'RoastWave',
      theme: ThemeData(
        primarySwatch: Colors.brown,
        visualDensity: VisualDensity.adaptivePlatformDensity,
      ),
      home: HomePage(),
    );
  }
}

class HomePage extends StatelessWidget {
  final channel = WebSocketChannel.connect(
    Uri.parse('ws://localhost:8080'),
  );

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('RoastWave'),
      ),
      body: Column(
        // child: Text('Hello, RoastWave!'),
        children: <Widget>[
          // get_serial_portを送信するボタン
          RaisedButton(
            onPressed: () {
              channel.sink.add('get_serial_port');
            },
            child: Text('get_serial_port'),
          ),
          // open_serial_portを送信するボタン
          RaisedButton(
            onPressed: () {
              channel.sink.add('open_serial_port');
            },
            child: Text('open_serial_port'),
          ),
          // close_serial_portを送信するボタン
          RaisedButton(
            onPressed: () {
              channel.sink.add('close_serial_port');
            },
            child: Text('close_serial_port'),
          ),
          // 受信したデータをリアルタイムで表示する
          StreamBuilder(
            stream: channel.stream,
            builder: (context, snapshot) {
              return Text(snapshot.hasData ? '${snapshot.data}' : '');
            },
          ),
          
        ],
      ),
    );
  }
}
