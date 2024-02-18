import 'package:flutter/material.dart';
import 'package:web_socket_channel/io.dart';
import 'package:web_socket_channel/web_socket_channel.dart';
import 'package:fl_chart/fl_chart.dart';
import 'dart:convert';

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

  // グラフデータを保持するリスト
  // Map<DateTime, double> graphData = {};
  List<double> graphData = [];
  // リングバッファのサイズを決める
  int bufferSize = 100;
  // リングバッファの初期化
  List<String> ringBuffer = List.filled(100, '0');
  // ringBufferへの追記関数
  void addRingBuffer(String data) {
    if(data == null) return;
    if(ringBuffer.length >= bufferSize) {
      ringBuffer.removeAt(0);
    }
    ringBuffer.add(data);
  }

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
          
          StreamBuilder(
            stream: channel.stream,
            builder: (context, snapshot) {
              if(snapshot.hasData) {
                Map<String, dynamic> map = jsonDecode(snapshot.data as String);
                //addRingBuffer(map['data']);
                if(map['type'] == 'serial_port_data') {
                  // graphData[DateTime.now()] = double.parse(map['data']);
                  graphData.add(double.parse(map['data']));
                  return Text(map['data']);
                }
              }
              return Text('');
            },
          ),
          // グラフを表示する
          LineChart(
            LineChartData(lineBarsData: [
              LineChartBarData(spots: const [
                FlSpot(1, 323),
                FlSpot(2, 538),
                FlSpot(3, 368),
                FlSpot(4, 259),
                FlSpot(5, 551),
                FlSpot(6, 226),
                FlSpot(7, 268),
                FlSpot(8, 296),
                FlSpot(9, 203),
                FlSpot(10, 246),
                FlSpot(11, 345),
              ])
            ]),
          ),
          
        ],
      ),
    );
  }
}
