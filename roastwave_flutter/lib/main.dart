import 'package:flutter/material.dart';

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
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('RoastWave'),
      ),
      body: Center(
        child: Text('Welcome to RoastWave'),
      ),
    );
  }
}
